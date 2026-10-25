import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";

export async function getBusinessContext() {
  const session = await auth();

  if (!session?.user?.id || !session.user.businessId) {
    redirect("/login");
  }

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

  if (!membership) {
    redirect("/login?error=membership");
  }

  return {
    userId: session.user.id,
    businessId: membership.businessId,
    businessName: membership.business.name,
    role: membership.role,
  };
}

export async function getBusinessId(): Promise<string> {
  const { businessId } = await getBusinessContext();
  return businessId;
}
