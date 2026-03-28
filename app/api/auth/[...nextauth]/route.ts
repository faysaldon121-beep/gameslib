import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

const handler = NextAuth({
  providers: [
    Providers.Credentials({
      name: 'Email/Password',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'your@email.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        await connectDB();
        const user = await User.findOne({ email: credentials?.email }).select('+password').lean();

        if (!user || !bcrypt.compareSync(credentials?.password, user.password)) {
          throw new Error('Invalid email or password');
        }

        return { id: user._id, email: user.email };
      },
    }),
    // Add more providers (e.g., Google, GitHub) here if needed
  ],
  adapter: MongoDBAdapter({
    dbClient: connectDB(), // Reuse existing MongoDB connection
    collectionName: 'users', // Store sessions/users in MongoDB
  }),
  session: {
    strategy: 'jwt', // Use JWT for sessions (stateless)
    maxAge: 30 * 24 * 60 * 60, // 30-day session
  },
  secret: process.env.NEXTAUTH_SECRET, // Must be 32+ chars (e.g., OpenSSL rand)
  pages: {
    signIn: '/auth/signin', // Custom sign-in page
    signOut: '/auth/signout', // Custom sign-out page
    error: '/auth/error', // Custom error page
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        email: token.email,
      };
      return session;
    },
  },
  debug: process.env.NODE_ENV === 'development', // Enable logs in dev
});

export { handler as GET, handler as POST };
