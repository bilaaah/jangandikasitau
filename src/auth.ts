import { compare } from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import authConfig from "@/auth.config";
import { db } from "@/lib/db";

const CredentialsSchema = z.object({
  email: z.string().trim().email().transform((email) => email.toLowerCase()),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email Bisnis", type: "email" },
        password: { label: "Kata Sandi", type: "password" },
      },
      async authorize(credentials) {
        const parsed = CredentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const membership = await db.userBusiness.findFirst({
          where: { user: { email: parsed.data.email } },
          include: { user: true },
          orderBy: { joinedAt: "asc" },
        });

        if (!membership?.user.hashedPassword) return null;

        const passwordMatches = await compare(
          parsed.data.password,
          membership.user.hashedPassword,
        );
        if (!passwordMatches) return null;

        return {
          id: membership.user.id,
          email: membership.user.email,
          name: membership.user.name,
          businessId: membership.businessId,
          role: membership.role,
        };
      },
    }),
  ],
});
