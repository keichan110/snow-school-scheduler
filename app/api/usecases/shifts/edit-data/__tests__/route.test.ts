import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "../route";

// モック
vi.mock("@/lib/auth/middleware", () => ({
  withAuth: vi.fn(async () => ({
    result: { user: { id: 1, role: "MANAGER" } },
    errorResponse: null,
  })),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    shift: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    instructor: {
      findMany: vi.fn(),
    },
  },
}));

describe("GET /api/usecases/shifts/edit-data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 for missing required parameters", async () => {
    const request = new NextRequest(
      "http://localhost/api/usecases/shifts/edit-data?date=2025-01-15"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("Required parameters");
  });

  it("should return 400 for invalid date format", async () => {
    const request = new NextRequest(
      "http://localhost/api/usecases/shifts/edit-data?date=invalid&departmentId=1&shiftTypeId=1"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
  });

  it("should return 400 for invalid department ID", async () => {
    const request = new NextRequest(
      "http://localhost/api/usecases/shifts/edit-data?date=2025-01-15&departmentId=abc&shiftTypeId=1"
    );
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain("Invalid department or shift type ID");
  });

  // 注: 実際のデータベース操作を伴うテストは、統合テストまたはE2Eテストで実施することを推奨
  // このファイルではバリデーションロジックのテストに焦点を当てています
});
