import { connection } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function getBusinessContext() {
  try {
    // Explicitly wait for connection in Next.js 15+ to handle dynamic auth during prerendering
    await connection();
    const session = await auth();

    if (session?.user?.id && session.user.businessId) {
      const membership = await db.userBusiness.findUnique({
        where: {
          userId_businessId: {
            userId: session.user.id,
            businessId: session.user.businessId,
          },
        },
        include: {
          business: {
            select: { id: true, name: true },
          },
        },
      });

      if (membership) {
        return {
          userId: session.user.id,
          businessId: membership.businessId,
          businessName: membership.business.name,
          role: membership.role,
        };
      }
    }
  } catch (error) {
    if (process.env.NODE_ENV === "production") throw error;
    console.warn("[Context] Auth session check fallback to dev context:", error);
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Business context is unavailable for the authenticated user.");
  }

  // Development-only fallback so local pages can be tested without blocking login.
  const devBusinessId = process.env.DEV_BUSINESS_ID || "sudah-dikasih-tau";
  return {
    userId: "dev-user-sweetcrumbs",
    businessId: devBusinessId,
    businessName: "SweetCrumbs Bakery",
    role: "OWNER" as const,
  };
}

export async function getBusinessId(): Promise<string> {
  const { businessId } = await getBusinessContext();
  return businessId;
}
