import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { auth, findMembership } = vi.hoisted(() => ({
  auth: vi.fn(),
  findMembership: vi.fn(),
}));

vi.mock("next/server", () => ({ connection: vi.fn() }));
vi.mock("@/auth", () => ({ auth }));
vi.mock("@/lib/db", () => ({
  db: { userBusiness: { findUnique: findMembership } },
}));

import { getBusinessContext } from "@/lib/context";

describe("getBusinessContext development fallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("DEV_BUSINESS_ID", "");
    vi.stubEnv("NODE_ENV", "development");
    auth.mockResolvedValue(null);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses the dev context outside production when no session exists", async () => {
    await expect(getBusinessContext()).resolves.toMatchObject({
      businessId: "sudah-dikasih-tau",
      businessName: "SweetCrumbs Bakery",
      role: "OWNER",
    });
  });

  it("does not use the dev context in production when no session exists", async () => {
    vi.stubEnv("NODE_ENV", "production");

    await expect(getBusinessContext()).rejects.toThrow(
      "Business context is unavailable for the authenticated user.",
    );
  });

  it("propagates authentication failures in production", async () => {
    const authError = new Error("Auth service unavailable");
    auth.mockRejectedValue(authError);
    vi.stubEnv("NODE_ENV", "production");

    await expect(getBusinessContext()).rejects.toBe(authError);
  });
});
