import type { NextAuthConfig } from "next-auth";

const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8,
  },
  callbacks: {
    authorized: ({ auth }) => Boolean(auth?.user),
    async jwt({ token, user }) {
      if (user) {
        const businessId = "businessId" in user ? user.businessId : undefined;
        const role = "role" in user ? (user as { role?: unknown }).role : undefined;
        if (typeof businessId === "string") token.businessId = businessId;
        if (typeof role === "string") token.role = role as any;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.businessId =
          typeof token.businessId === "string" ? token.businessId : undefined;
        session.user.role =
          typeof token.role === "string" ? (token.role as any) : undefined;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;

export default authConfig;
