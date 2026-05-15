import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { hasDatabaseUrl, prisma } from "@/lib/db";
import { signInSchema } from "@/lib/validation";

export const authOptions: NextAuthOptions = {
  adapter: hasDatabaseUrl ? PrismaAdapter(prisma) : undefined,
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/auth/sign-in",
  },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = signInSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });

        if (!user?.passwordHash) {
          return null;
        }

        const validPassword = await bcrypt.compare(
          parsed.data.password,
          user.passwordHash,
        );

        if (!validPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
    // Only enable Google provider when credentials are configured.
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    jwt({ token, user }) {
      // Credentials provider supplies `user.role`.
      if (user) {
        // `user` type is provider-specific; keep this minimal and avoid `any`.
        const typedUser = user as unknown as { id?: string; role?: string };
        token.id = typedUser.id ?? "";
        token.role =
          typedUser.role === "ADMIN" || typedUser.role === "USER"
            ? typedUser.role
            : "USER";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? "";
        session.user.role = token.role ?? "USER";
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      if (user?.id) {
        await prisma.admin.updateMany({
          where: { userId: user.id as string },
          data: { lastLoginAt: new Date() },
        });
      }
    },
  },
};
