// lib/auth.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import User from '@/models/User';
import connectDB from '@/lib/mongodb';

async function verifyCredentials(credentials: Record<'email' | 'password', string> | undefined) {
  if (!credentials?.email || !credentials?.password) {
    throw new Error('Missing credentials');
  }

  await connectDB();
  const user = await User.findOne({ email: credentials.email });
  if (!user?.password || !await bcrypt.compare(credentials.password, user.password!)) {
    throw new Error('Invalid email/password');
  }
  return { id: String(user._id), email: user.email, name: user.name };
}

export const { handlers, auth, signIn, signOut, SessionProvider } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID ? [Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })] : []),
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: verifyCredentials,
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/auth/signin' },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) token.role = 'user';
      return token;
    },
  },
});
