/**
 * @jest-environment node
 */

import { NextRequest } from "next/server";

jest.mock("@/lib/auth/middleware", () => ({
  authenticateFromRequest: jest.fn(),
}));

// Prismaをモック化
jest.mock("@/lib/db", () => ({
  prisma: {
    department: {
      findUnique: jest.fn(),
    },
  },
}));

import { authenticateFromRequest } from "@/lib/auth/middleware";
import { prisma } from "@/lib/db";
import { GET } from "./route";

const mockFindUnique = prisma.department.findUnique as jest.MockedFunction<
  typeof prisma.department.findUnique
>;
const mockAuthenticateFromRequest =
  authenticateFromRequest as jest.MockedFunction<
    typeof authenticateFromRequest
  >;

describe("/api/departments/[id] GET", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthenticateFromRequest.mockResolvedValue({
      success: true,
      user: {
        id: "1",
        lineUserId: "test-user",
        displayName: "Test User",
        role: "ADMIN",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  });

  it("認証に失敗した場合、401エラーを返す", async () => {
    mockAuthenticateFromRequest.mockResolvedValueOnce({
      success: false,
      error: "Authentication required",
    });

    const request = new NextRequest("http://localhost:3000/api/departments/1");
    const response = await GET(request, {
      params: Promise.resolve({ id: "1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data).toEqual({
      success: false,
      data: null,
      message: null,
      error: "Authentication required",
    });
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("部門が存在する場合、部門詳細を返す", async () => {
    // テストデータを準備
    const mockDepartment = {
      id: 1,
      code: "ski",
      name: "スキー",
      description: "スキー部門",
      isActive: true,
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    };

    mockFindUnique.mockResolvedValue(mockDepartment);

    // リクエストを作成
    const request = new NextRequest("http://localhost:3000/api/departments/1");
    const response = await GET(request, {
      params: Promise.resolve({ id: "1" }),
    });
    const data = await response.json();

    // レスポンスを検証
    expect(response.status).toBe(200);
    expect(data).toEqual({
      success: true,
      data: {
        id: 1,
        code: "ski",
        name: "スキー",
        description: "スキー部門",
        isActive: true,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      },
      message: null,
      error: null,
    });

    // Prismaクエリが正しく呼ばれたことを確認
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it("部門が存在しない場合、404エラーを返す", async () => {
    mockFindUnique.mockResolvedValue(null);

    const request = new NextRequest(
      "http://localhost:3000/api/departments/999"
    );
    const response = await GET(request, {
      params: Promise.resolve({ id: "999" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({
      success: false,
      data: null,
      message: null,
      error: "Resource not found",
    });
  });

  it("無効なIDパラメータの場合、404エラーを返す", async () => {
    const request = new NextRequest(
      "http://localhost:3000/api/departments/invalid"
    );
    const response = await GET(request, {
      params: Promise.resolve({ id: "invalid" }),
    });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({
      success: false,
      data: null,
      message: null,
      error: "Resource not found",
    });

    // 無効なIDの場合はPrismaクエリが呼ばれないことを確認
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("データベースエラーが発生した場合、500エラーを返す", async () => {
    mockFindUnique.mockRejectedValue(new Error("Database error"));

    const request = new NextRequest("http://localhost:3000/api/departments/1");
    const response = await GET(request, {
      params: Promise.resolve({ id: "1" }),
    });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      success: false,
      data: null,
      message: null,
      error: "Internal server error",
    });
  });
});
