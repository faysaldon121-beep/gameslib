// lib/auth.ts (full file, replaces your old version entirely)
import NextAuth, { User, Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import bcrypt from "bcryptjs";
import connectDB from "./mongodb"; // Your connectDB function
import clientPromise from "./mongodb"; // ClientPromise for Auth.js adapter
import UserModel, { IUser } from "@/models/User"; // Your MongoDB User model, import IUser

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
  request: Request // This parameter is crucial for matching the expected signature
) {
  // Validate input types first to resolve unknown type errors
  const email = credentials?.email;
  const password = credentials?.password;
  if (typeof email !== "string" || typeof password !== "string") {
    throw new Error("Please enter a valid email and password");
  }

  await connectDB();
  
  // Explicitly cast the result of lean() to IUser | null
  // This tells TypeScript that if a user is found, it will conform to IUser,
  // which guarantees the 'password' property after 'select('+password')'.
  const user = await UserModel.findOne({ email }).select("+password").lean() as (IUser | null);

  // Check if user exists AND if it has a password field (which it should due to select('+password'))
  if (!user || !user.password) {
    throw new Error("No account found with this email or password missing");
  }

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
  secret: process.env.AUTH_SECRET, // AUTH_SECRET is mandatory for production
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
    // Email/Password credentials provider
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: verifyCredentials,
    }),
  ],
  session: { strategy: "jwt" }, // Use JWT for session management
  pages: { signIn: "/auth/signin" }, // Custom sign-in page
  // Callbacks to attach user ID to JWT and sessions for client-side access
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id; // Attach user ID to the JWT
      return token;
    },
    async session({ session, token }) {
      if (token.id && session.user) session.user.id = token.id as string; // Attach user ID to the session object
      return session;
    },
  },
  // Enable debug logging only in development mode
  debug: process.env.NODE_ENV === "development",
});
