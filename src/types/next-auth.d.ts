import type { BusinessRole } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    businessId?: string;
    role?: BusinessRole | "STAFF" | string;
  }

  interface Session {
    user: {
      id: string;
      businessId?: string;
      role?: BusinessRole | "STAFF" | string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    businessId?: string;
    role?: BusinessRole | "STAFF" | string;
  }
}
