// lib/auth.ts (full file, replaces your old version entirely)
import NextAuth, { User, Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import bcrypt from "bcryptjs";
import connectDB from "./mongodb"; // Your connectDB function
import clientPromise from "./mongodb"; // ClientPromise for Auth.js adapter
import UserModel from "@/models/User"; // Your MongoDB User model

// Extend NextAuth's built-in types to avoid client-side type errors
declare module "next-auth" {
  interface User {
    id: string;
  }
  interface Session {
    user: User & {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }
}

// Matches Auth.js v5's required authorize function signature EXACTLY
async function verifyCredentials(
  credentials: Partial<Record<"email" | "password", unknown>>,
  request: Request // Added the missing request parameter to fix type mismatch
) {
  // Validate input types first to resolve unknown type errors
  const email = credentials?.email;
  const password = credentials?.password;
  if (typeof email !== "string" || typeof password !== "string") {
    throw new Error("Please enter a valid email and password");
  }

  await connectDB();
  // Explicitly select password (Mongoose often omits sensitive fields by default)
  const user = await UserModel.findOne({ email }).select("+password").lean();
  if (!user?.password) throw new Error("No account found with this email");

  // Verify password hash
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new Error("Invalid email or password");

  // Return only safe user data to attach to the session
  return {
    id: String(user._id),
    email: user.email,
    name: user.name || null,
    image: user.image || null,
  } satisfies User;
}

// Core NextAuth config
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  secret: process.env.AUTH_SECRET,
  providers: [
    // Google OAuth (only enabled if env vars are set)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    // Email/Password credentials
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: verifyCredentials,
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/signin" },
  // Callbacks to attach user ID to JWT and sessions
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token.id && session.user) session.user.id = token.id as string;
      return session;
    },
  },
  // Enable debug logging only in development
  debug: process.env.NODE_ENV === "development",
});
