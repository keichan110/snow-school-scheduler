import { NextRequest, NextResponse } from "next/server";
import { authenticateFromRequest } from "@/lib/auth/middleware";
import { prisma } from "@/lib/db";
import { GET } from "./route";

type Certification = {
  id: number;
  departmentId: number;
  name: string;
  shortName: string;
  organization: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  department: {
    id: number;
    name: string;
  };
};

// Prismaクライアントをモック化
jest.mock("@/lib/db", () => ({
  prisma: {
    certification: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// NextResponseとNextRequestをモック化
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn(),
  },
  NextRequest: jest.fn((url, init) => ({
    url,
    ...init,
    headers: new Headers(init?.headers),
    cookies: {
      get: jest.fn().mockReturnValue({ value: "test-token" }),
    },
    json: init?.body
      ? () => Promise.resolve(JSON.parse(init.body as string))
      : () => Promise.resolve({}),
    nextUrl: {
      searchParams: new URL(url as string).searchParams,
    },
  })),
}));

// 認証ミドルウェアをモック化
jest.mock("@/lib/auth/middleware", () => ({
  authenticateFromRequest: jest.fn(),
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockCertificationFindMany = mockPrisma.certification
  .findMany as jest.MockedFunction<typeof prisma.certification.findMany>;
const mockNextResponse = NextResponse as jest.Mocked<typeof NextResponse>;
const mockAuthenticateFromRequest =
  authenticateFromRequest as jest.MockedFunction<
    typeof authenticateFromRequest
  >;

describe("GET /api/certifications", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 認証成功をデフォルトでモック
    mockAuthenticateFromRequest.mockResolvedValue({
      success: true,
      user: {
        id: "1",
        lineUserId: "test-line-user",
        displayName: "Test User",
        profileImageUrl: null,
        role: "ADMIN",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    // NextResponse.jsonのデフォルトモック実装
    mockNextResponse.json.mockImplementation(
      (data, init) =>
        ({
          status: init?.status || 200,
          json: async () => data,
          cookies: {},
          headers: new Headers(),
          ok: true,
          redirected: false,
          statusText: "OK",
          type: "basic" as ResponseType,
          url: "",
          body: null,
          bodyUsed: false,
          clone: jest.fn(),
          arrayBuffer: jest.fn(),
          blob: jest.fn(),
          formData: jest.fn(),
          text: jest.fn(),
          [Symbol.for("NextResponse")]: true,
        }) as unknown as NextResponse
    );
  });

  describe("正常系", () => {
    it("資格データが部門情報付きで正しく返されること", async () => {
      // Arrange
      const mockCertifications: Certification[] = [
        {
          id: 1,
          departmentId: 1,
          name: "スキー指導員",
          shortName: "指導員",
          organization: "SAJ",
          description: "スキー指導員資格",
          isActive: true,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
          department: {
            id: 1,
            name: "スキー",
          },
        },
        {
          id: 2,
          departmentId: 2,
          name: "スノーボード指導員",
          shortName: "指導員",
          organization: "JSBA",
          description: "スノーボード指導員資格",
          isActive: true,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
          department: {
            id: 2,
            name: "スノーボード",
          },
        },
      ];

      mockCertificationFindMany.mockResolvedValue(mockCertifications);

      // Act
      await GET(new NextRequest("http://localhost"));

      // Assert
      expect(mockCertificationFindMany).toHaveBeenCalledWith({
        include: {
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [{ department: { name: "asc" } }, { name: "asc" }],
      });

      expect(mockNextResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockCertifications,
        count: 2,
        message: null,
        error: null,
      });
    });

    it("資格データが空の場合でも正しく処理されること", async () => {
      // Arrange
      const mockCertifications: Certification[] = [];
      mockCertificationFindMany.mockResolvedValue(mockCertifications);

      // Act
      await GET(new NextRequest("http://localhost"));

      // Assert
      expect(mockCertificationFindMany).toHaveBeenCalledWith({
        include: {
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [{ department: { name: "asc" } }, { name: "asc" }],
      });

      expect(mockNextResponse.json).toHaveBeenCalledWith({
        success: true,
        data: [],
        count: 0,
        message: null,
        error: null,
      });
    });

    it("単一の資格データが正しく返されること", async () => {
      // Arrange
      const mockCertifications: Certification[] = [
        {
          id: 1,
          departmentId: 1,
          name: "スキー指導員",
          shortName: "指導員",
          organization: "SAJ",
          description: "スキー指導員資格",
          isActive: true,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-01"),
          department: {
            id: 1,
            name: "スキー",
          },
        },
      ];

      mockCertificationFindMany.mockResolvedValue(mockCertifications);

      // Act
      await GET(new NextRequest("http://localhost"));

      // Assert
      expect(mockNextResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockCertifications,
        count: 1,
        message: null,
        error: null,
      });
    });
  });

  describe("異常系", () => {
    it("データベースエラーが発生した場合に500エラーが返されること", async () => {
      // Arrange
      const mockError = new Error("Database connection failed");
      mockCertificationFindMany.mockRejectedValue(mockError);

      // Act
      await GET(new NextRequest("http://localhost"));

      // Assert
      expect(mockCertificationFindMany).toHaveBeenCalledWith({
        include: {
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [{ department: { name: "asc" } }, { name: "asc" }],
      });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          data: null,
          message: null,
          error: "Internal server error",
        },
        { status: 500 }
      );
    });

    it("Prismaの特定のエラーが発生した場合も適切に処理されること", async () => {
      // Arrange
      const mockError = new Error("P2002: Unique constraint failed");
      mockError.name = "PrismaClientKnownRequestError";
      mockCertificationFindMany.mockRejectedValue(mockError);

      // Act
      await GET(new NextRequest("http://localhost"));

      // Assert
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          data: null,
          message: null,
          error: "Internal server error",
        },
        { status: 500 }
      );
    });
  });

  describe("データベースクエリ", () => {
    it("資格データが部門名・資格名順（昇順）でソートされて取得されること", async () => {
      // Arrange
      const mockCertifications: Partial<Certification>[] = [
        {
          id: 1,
          name: "スキー指導員",
          department: { id: 1, name: "スキー" },
        },
        {
          id: 2,
          name: "スノーボード指導員",
          department: { id: 2, name: "スノーボード" },
        },
      ];
      mockCertificationFindMany.mockResolvedValue(
        mockCertifications as Certification[]
      );

      // Act
      await GET(new NextRequest("http://localhost"));

      // Assert
      expect(mockCertificationFindMany).toHaveBeenCalledWith({
        include: {
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [{ department: { name: "asc" } }, { name: "asc" }],
      });
    });

    it("findManyが1回だけ呼ばれること", async () => {
      // Arrange
      mockCertificationFindMany.mockResolvedValue([]);

      // Act
      await GET(new NextRequest("http://localhost"));

      // Assert
      expect(mockCertificationFindMany).toHaveBeenCalledTimes(1);
    });

    it("部門情報が適切にincludeされていること", async () => {
      // Arrange
      mockCertificationFindMany.mockResolvedValue([]);

      // Act
      await GET(new NextRequest("http://localhost"));

      // Assert
      expect(mockCertificationFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        })
      );
    });
  });
});
