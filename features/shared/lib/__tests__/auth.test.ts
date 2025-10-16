import { requireAdmin, requireManagerAuth } from "@/features/shared/lib/auth";
import { authenticateFromCookies } from "@/lib/auth/middleware";

type MockedAuthenticateFromCookies = jest.MockedFunction<
  typeof authenticateFromCookies
>;

jest.mock("@/lib/auth/middleware", () => ({
  authenticateFromCookies: jest.fn(),
}));

describe("auth helpers", () => {
  const mockAuthenticateFromCookies =
    authenticateFromCookies as MockedAuthenticateFromCookies;

  const baseUser = {
    id: "user_1",
    lineUserId: "line_1",
    displayName: "Test User",
    pictureUrl: null,
    role: "MEMBER" as const,
    isActive: true,
    createdAt: new Date("2024-01-01T00:00:00Z"),
    updatedAt: new Date("2024-01-01T00:00:00Z"),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("requireManagerAuth", () => {
    it("returns user information when role is MANAGER", async () => {
      mockAuthenticateFromCookies.mockResolvedValue({
        success: true,
        user: { ...baseUser, role: "MANAGER" },
      });

      const user = await requireManagerAuth();

      expect(user.role).toBe("MANAGER");
    });

    it("returns user information when role is ADMIN", async () => {
      mockAuthenticateFromCookies.mockResolvedValue({
        success: true,
        user: { ...baseUser, role: "ADMIN" },
      });

      const user = await requireManagerAuth();

      expect(user.role).toBe("ADMIN");
    });

    it("throws when user is MEMBER", async () => {
      mockAuthenticateFromCookies.mockResolvedValue({
        success: true,
        user: { ...baseUser, role: "MEMBER" },
      });

      await expect(requireManagerAuth()).rejects.toThrow(
        "Forbidden: Manager or Admin access required"
      );
    });

    it("throws when authentication fails", async () => {
      mockAuthenticateFromCookies.mockResolvedValue({ success: false });

      await expect(requireManagerAuth()).rejects.toThrow("Unauthorized");
    });
  });

  describe("requireAdmin", () => {
    it("returns user information when role is ADMIN", async () => {
      mockAuthenticateFromCookies.mockResolvedValue({
        success: true,
        user: { ...baseUser, role: "ADMIN" },
      });

      const user = await requireAdmin();

      expect(user.role).toBe("ADMIN");
    });

    it("throws when user is MANAGER", async () => {
      mockAuthenticateFromCookies.mockResolvedValue({
        success: true,
        user: { ...baseUser, role: "MANAGER" },
      });

      await expect(requireAdmin()).rejects.toThrow(
        "Forbidden: Admin access required"
      );
    });

    it("throws when authentication fails", async () => {
      mockAuthenticateFromCookies.mockResolvedValue({ success: false });

      await expect(requireAdmin()).rejects.toThrow("Unauthorized");
    });
  });
});
