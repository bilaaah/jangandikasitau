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
        const role = "role" in user ? user.role : undefined;
        if (typeof businessId === "string") token.businessId = businessId;
        if (role === "OWNER" || role === "MEMBER") token.role = role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.businessId =
          typeof token.businessId === "string" ? token.businessId : undefined;
        session.user.role =
          token.role === "OWNER" || token.role === "MEMBER" ? token.role : undefined;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;

export default authConfig;
