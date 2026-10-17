// src/lib/context.ts
//
// Business context resolution.
//
// During Milestone 1 (no authentication), this function reads DEV_BUSINESS_ID
// from the environment to identify the active business.
//
// In Milestone 2, this function will be updated to read from the NextAuth session.
// No other code needs to change — this is the single seam for auth integration.
//
// Usage in Server Actions and Server Components:
//   const businessId = await getBusinessId();
//   // use businessId to filter all DB queries

/**
 * Returns the businessId for the current request context.
 *
 * Milestone 1: reads from DEV_BUSINESS_ID environment variable.
 * Milestone 2: will read from the authenticated session.
 *
 * Throws if no business context can be determined, preventing
 * accidental cross-business data leaks.
 */
export async function getBusinessId(): Promise<string> {
  // TODO (Milestone 2): Replace this block with session-based auth.
  // import { auth } from "@/lib/auth";
  // const session = await auth();
  // if (!session?.user?.businessId) throw new Error("Unauthorized");
  // return session.user.businessId;

  const devBusinessId = process.env.DEV_BUSINESS_ID;

  if (!devBusinessId || devBusinessId === "replace-after-running-npm-run-db-seed") {
    throw new Error(
      "DEV_BUSINESS_ID is not set. Run `npm run db:seed` and copy the generated " +
        "business ID into your .env.local file.",
    );
  }

  return devBusinessId;
}
