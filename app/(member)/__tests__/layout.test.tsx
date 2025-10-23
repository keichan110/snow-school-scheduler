import { redirect } from "next/navigation";
import MemberLayout from "@/app/(member)/layout";
import {
  ACCESS_DENIED_REDIRECT,
  buildLoginRedirectUrl,
} from "@/lib/auth/auth-redirect";
import { ensureRole } from "@/lib/auth/role-guard";

// Mock dependencies
jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@/lib/auth/role-guard", () => ({
  ensureRole: jest.fn(),
}));

jest.mock("@/lib/auth/auth-redirect", () => ({
  ACCESS_DENIED_REDIRECT: "/",
  buildLoginRedirectUrl: jest.fn(),
}));

// Mock Header and Footer components
jest.mock("@/app/_components/layout/header", () => ({
  __esModule: true,
  default: () => <div data-testid="header">Header</div>,
}));

jest.mock("@/app/_components/layout/footer", () => ({
  __esModule: true,
  default: () => <div data-testid="footer">Footer</div>,
}));

// Mock AuthProvider
jest.mock("@/contexts/auth-context", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-provider">{children}</div>
  ),
}));

type MockedEnsureRole = jest.MockedFunction<typeof ensureRole>;
type MockedRedirect = jest.MockedFunction<typeof redirect>;
type MockedBuildLoginRedirectUrl = jest.MockedFunction<
  typeof buildLoginRedirectUrl
>;

describe("MemberLayout", () => {
  const mockEnsureRole = ensureRole as MockedEnsureRole;
  const mockRedirect = redirect as MockedRedirect;
  const mockBuildLoginRedirectUrl =
    buildLoginRedirectUrl as MockedBuildLoginRedirectUrl;

  const mockUser = {
    id: "user_1",
    lineUserId: "line_1",
    displayName: "Test User",
    pictureUrl: null,
    role: "MEMBER" as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders children when user has MEMBER role", async () => {
    mockEnsureRole.mockResolvedValue({
      status: "authorized",
      user: mockUser,
    });

    const result = await MemberLayout({
      children: <div>Test Content</div>,
    });

    expect(mockEnsureRole).toHaveBeenCalledWith({ atLeast: "MEMBER" });
    expect(mockRedirect).not.toHaveBeenCalled();
    expect(result).toBeTruthy();
  });

  it("renders children when user has MANAGER role", async () => {
    mockEnsureRole.mockResolvedValue({
      status: "authorized",
      user: { ...mockUser, role: "MANAGER" },
    });

    const result = await MemberLayout({
      children: <div>Test Content</div>,
    });

    expect(mockEnsureRole).toHaveBeenCalledWith({ atLeast: "MEMBER" });
    expect(mockRedirect).not.toHaveBeenCalled();
    expect(result).toBeTruthy();
  });

  it("renders children when user has ADMIN role", async () => {
    mockEnsureRole.mockResolvedValue({
      status: "authorized",
      user: { ...mockUser, role: "ADMIN" },
    });

    const result = await MemberLayout({
      children: <div>Test Content</div>,
    });

    expect(mockEnsureRole).toHaveBeenCalledWith({ atLeast: "MEMBER" });
    expect(mockRedirect).not.toHaveBeenCalled();
    expect(result).toBeTruthy();
  });

  it("redirects to login when user is unauthenticated", async () => {
    mockEnsureRole.mockResolvedValue({
      status: "unauthenticated",
    });
    mockBuildLoginRedirectUrl.mockResolvedValue("/login?redirect=%2F");

    await MemberLayout({
      children: <div>Test Content</div>,
    });

    expect(mockEnsureRole).toHaveBeenCalledWith({ atLeast: "MEMBER" });
    expect(mockBuildLoginRedirectUrl).toHaveBeenCalled();
    expect(mockRedirect).toHaveBeenCalledWith("/login?redirect=%2F");
  });

  it("redirects to access denied when user is forbidden", async () => {
    mockEnsureRole.mockResolvedValue({
      status: "forbidden",
      user: mockUser,
    });

    await MemberLayout({
      children: <div>Test Content</div>,
    });

    expect(mockEnsureRole).toHaveBeenCalledWith({ atLeast: "MEMBER" });
    expect(mockRedirect).toHaveBeenCalledWith(ACCESS_DENIED_REDIRECT);
  });
});
