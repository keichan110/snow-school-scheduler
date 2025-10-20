import { redirect } from "next/navigation";
import ManagerLayout from "@/app/(member)/(manager)/layout";
import {
  ACCESS_DENIED_REDIRECT,
  buildLoginRedirectUrl,
} from "@/features/shared/lib/auth-redirect";
import { ensureRole } from "@/features/shared/lib/role-guard";

// Mock dependencies
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@/features/shared/lib/role-guard", () => ({
  ensureRole: jest.fn(),
}));

jest.mock("@/features/shared/lib/auth-redirect", () => ({
  ACCESS_DENIED_REDIRECT: "/",
  buildLoginRedirectUrl: jest.fn(),
}));

type MockedEnsureRole = jest.MockedFunction<typeof ensureRole>;
type MockedRedirect = jest.MockedFunction<typeof redirect>;
type MockedBuildLoginRedirectUrl = jest.MockedFunction<
  typeof buildLoginRedirectUrl
>;

describe("ManagerLayout", () => {
  const mockEnsureRole = ensureRole as MockedEnsureRole;
  const mockRedirect = redirect as MockedRedirect;
  const mockBuildLoginRedirectUrl =
    buildLoginRedirectUrl as MockedBuildLoginRedirectUrl;

  const mockUser = {
    id: "user_1",
    lineUserId: "line_1",
    displayName: "Test User",
    pictureUrl: null,
    role: "MANAGER" as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders children when user has MANAGER role", async () => {
    mockEnsureRole.mockResolvedValue({
      status: "authorized",
      user: mockUser,
    });

    const result = await ManagerLayout({
      children: <div>Test Content</div>,
    });

    expect(mockEnsureRole).toHaveBeenCalledWith({ atLeast: "MANAGER" });
    expect(mockRedirect).not.toHaveBeenCalled();
    expect(result).toBeTruthy();
  });

  it("renders children when user has ADMIN role", async () => {
    mockEnsureRole.mockResolvedValue({
      status: "authorized",
      user: { ...mockUser, role: "ADMIN" },
    });

    const result = await ManagerLayout({
      children: <div>Test Content</div>,
    });

    expect(mockEnsureRole).toHaveBeenCalledWith({ atLeast: "MANAGER" });
    expect(mockRedirect).not.toHaveBeenCalled();
    expect(result).toBeTruthy();
  });

  it("redirects to login when user is unauthenticated", async () => {
    mockEnsureRole.mockResolvedValue({
      status: "unauthenticated",
    });
    mockBuildLoginRedirectUrl.mockResolvedValue("/login?redirect=%2Fmanager");

    await ManagerLayout({
      children: <div>Test Content</div>,
    });

    expect(mockEnsureRole).toHaveBeenCalledWith({ atLeast: "MANAGER" });
    expect(mockBuildLoginRedirectUrl).toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith("/login?redirect=%2Fmanager");
  });

  it("redirects to access denied when user has MEMBER role", async () => {
    mockEnsureRole.mockResolvedValue({
      status: "forbidden",
      user: { ...mockUser, role: "MEMBER" },
    });

    await ManagerLayout({
      children: <div>Test Content</div>,
    });

    expect(mockEnsureRole).toHaveBeenCalledWith({ atLeast: "MANAGER" });
    expect(mockRedirect).toHaveBeenCalledWith(ACCESS_DENIED_REDIRECT);
  });
});
