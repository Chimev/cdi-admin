import NextAuth, { NextAuthOptions } from "next-auth";
import bcrypt from "bcryptjs";     // Or your preferred hashing library
import { connectToDB } from "@/utilis/connectToDb";
import CredentialsProvider from "next-auth/providers/credentials";
import User from "@/utilis/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        await connectToDB();

        // 1. Find user in your single collection
        const dbUser = await User.findOne({ email: credentials.email.toLowerCase() });
        if (!dbUser) {
          throw new Error("No user found with this email");
        }

        // 2. Verify password
        const isValid = await bcrypt.compare(credentials.password, dbUser.password);
        if (!isValid) {
          throw new Error("Invalid password");
        }

        // 3. Return object matching the "interface User" you declared
        return {
          id: dbUser._id.toString(),
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role, // "user" or "admin"
        //   slug: dbUser.slug,
        };
      }
    })
  ],
  callbacks: {
    // Passes data from the authorize return object to the JWT token
    async jwt({ token, user }) {
      if (user) {
        token.userID = user.id;
        token.role = user.role || 'user';
        // token.slug = user.slug;
      }
      return token;
    },
    // Passes data from the JWT token to the client-side session
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userID;
        session.user.role = token.role || "admin";
        // session.user.slug = token.slug;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login", // Optional: your custom login page
  }
};


