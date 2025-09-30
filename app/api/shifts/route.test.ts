import { NextRequest, NextResponse } from "next/server";
import { authenticateFromRequest } from "@/lib/auth/middleware";
import { prisma } from "@/lib/db";
import { GET, POST } from "./route";

// Mock types
type Department = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type ShiftType = {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type Instructor = {
  id: number;
  lastName: string;
  firstName: string;
  lastNameKana: string | null;
  firstNameKana: string | null;
  status: "ACTIVE" | "INACTIVE" | "RETIRED";
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type ShiftAssignment = {
  id: number;
  shiftId: number;
  instructorId: number;
  assignedAt: Date;
  instructor: Instructor;
};

type Shift = {
  id: number;
  date: Date;
  departmentId: number;
  shiftTypeId: number;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  department: Department;
  shiftType: ShiftType;
  shiftAssignments: ShiftAssignment[];
};

// Prismaクライアントをモック化
jest.mock("@/lib/db", () => ({
  prisma: {
    shift: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    shiftAssignment: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
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
const mockShiftFindMany = mockPrisma.shift.findMany as jest.MockedFunction<
  typeof prisma.shift.findMany
>;
const mockShiftFindUnique = mockPrisma.shift.findUnique as jest.MockedFunction<
  typeof prisma.shift.findUnique
>;
const mockTransaction = mockPrisma.$transaction as jest.MockedFunction<
  typeof prisma.$transaction
>;
const mockNextResponse = NextResponse as jest.Mocked<typeof NextResponse>;
const mockAuthenticateFromRequest =
  authenticateFromRequest as jest.MockedFunction<
    typeof authenticateFromRequest
  >;

// テスト用のモックデータ
const mockDepartment: Department = {
  id: 1,
  code: "SKI",
  name: "スキー",
  description: "スキー部門",
  isActive: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

const mockShiftType: ShiftType = {
  id: 1,
  name: "レッスン",
  isActive: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

const mockInstructor: Instructor = {
  id: 1,
  lastName: "山田",
  firstName: "太郎",
  lastNameKana: "ヤマダ",
  firstNameKana: "タロウ",
  status: "ACTIVE",
  notes: null,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

const mockShiftAssignment: ShiftAssignment = {
  id: 1,
  shiftId: 1,
  instructorId: 1,
  assignedAt: new Date("2024-01-01T10:00:00Z"),
  instructor: mockInstructor,
};

const mockShift: Shift = {
  id: 1,
  date: new Date("2024-01-15"),
  departmentId: 1,
  shiftTypeId: 1,
  description: "テストシフト",
  createdAt: new Date("2024-01-01T10:00:00Z"),
  updatedAt: new Date("2024-01-01T10:00:00Z"),
  department: mockDepartment,
  shiftType: mockShiftType,
  shiftAssignments: [mockShiftAssignment],
};

describe("Shifts API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 認証成功をデフォルトでモック
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

  describe("GET /api/shifts", () => {
    const createMockRequest = (searchParams: Record<string, string> = {}) => {
      const url = new URL("http://localhost/api/shifts");
      Object.entries(searchParams).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });

      return new NextRequest(url.toString());
    };

    describe("正常系", () => {
      it("フィルターなしでシフト一覧が正しく返されること", async () => {
        // Arrange
        const mockShifts = [mockShift];
        mockShiftFindMany.mockResolvedValue(mockShifts);
        const request = createMockRequest();

        // Act
        await GET(request);

        // Assert
        expect(mockShiftFindMany).toHaveBeenCalledWith({
          where: {},
          include: {
            department: true,
            shiftType: true,
            shiftAssignments: {
              include: {
                instructor: true,
              },
            },
          },
          orderBy: [
            { date: "asc" },
            { departmentId: "asc" },
            { shiftTypeId: "asc" },
          ],
        });

        expect(mockNextResponse.json).toHaveBeenCalledWith({
          success: true,
          data: [
            {
              id: 1,
              date: "2024-01-15",
              departmentId: 1,
              shiftTypeId: 1,
              description: "テストシフト",
              createdAt: mockShift.createdAt.toISOString(),
              updatedAt: mockShift.updatedAt.toISOString(),
              department: mockDepartment,
              shiftType: mockShiftType,
              assignments: [
                {
                  id: 1,
                  shiftId: 1,
                  instructorId: 1,
                  assignedAt: mockShiftAssignment.assignedAt.toISOString(),
                  instructor: {
                    id: 1,
                    lastName: "山田",
                    firstName: "太郎",
                    status: "ACTIVE",
                  },
                },
              ],
              assignedCount: 1,
            },
          ],
          count: 1,
          message: null,
          error: null,
        });
      });

      it("部門IDフィルターが正しく適用されること", async () => {
        // Arrange
        mockShiftFindMany.mockResolvedValue([]);
        const request = createMockRequest({ departmentId: "1" });

        // Act
        await GET(request);

        // Assert
        expect(mockShiftFindMany).toHaveBeenCalledWith({
          where: { departmentId: 1 },
          include: expect.any(Object),
          orderBy: expect.any(Array),
        });
      });

      it("日付範囲フィルターが正しく適用されること", async () => {
        // Arrange
        mockShiftFindMany.mockResolvedValue([]);
        const request = createMockRequest({
          dateFrom: "2024-01-01",
          dateTo: "2024-01-31",
        });

        // Act
        await GET(request);

        // Assert
        expect(mockShiftFindMany).toHaveBeenCalledWith({
          where: {
            date: {
              gte: new Date("2024-01-01"),
              lte: new Date("2024-01-31"),
            },
          },
          include: expect.any(Object),
          orderBy: expect.any(Array),
        });
      });

      it("複数フィルターが正しく組み合わされること", async () => {
        // Arrange
        mockShiftFindMany.mockResolvedValue([]);
        const request = createMockRequest({
          departmentId: "1",
          shiftTypeId: "1",
          dateFrom: "2024-01-01",
        });

        // Act
        await GET(request);

        // Assert
        expect(mockShiftFindMany).toHaveBeenCalledWith({
          where: {
            departmentId: 1,
            shiftTypeId: 1,
            date: { gte: new Date("2024-01-01") },
          },
          include: expect.any(Object),
          orderBy: expect.any(Array),
        });
      });
    });

    describe("異常系", () => {
      it("データベースエラーが発生した場合に500エラーが返されること", async () => {
        // Arrange
        const mockError = new Error("Database connection failed");
        mockShiftFindMany.mockRejectedValue(mockError);
        const consoleSpy = jest.spyOn(console, "error").mockImplementation();
        const request = createMockRequest();

        // Act
        await GET(request);

        // Assert
        expect(consoleSpy).toHaveBeenCalledWith("Shifts API error:", mockError);
        expect(mockNextResponse.json).toHaveBeenCalledWith(
          {
            success: false,
            data: null,
            message: null,
            error: "Internal server error",
          },
          { status: 500 }
        );

        consoleSpy.mockRestore();
      });
    });
  });

  describe("POST /api/shifts", () => {
    const createMockPostRequest = (body: Record<string, unknown>) =>
      new NextRequest("http://localhost/api/shifts", {
        method: "POST",
        body: JSON.stringify(body),
      });

    describe("正常系", () => {
      it("シフトが正しく作成されること", async () => {
        // Arrange
        const requestBody = {
          date: "2024-01-15",
          departmentId: 1,
          shiftTypeId: 1,
          description: "テストシフト",
          assignedInstructorIds: [1],
        };

        const createdShift = {
          id: 1,
          date: new Date("2024-01-15"),
          departmentId: 1,
          shiftTypeId: 1,
          description: "テストシフト",
          createdAt: new Date("2024-01-01T10:00:00Z"),
          updatedAt: new Date("2024-01-01T10:00:00Z"),
          department: mockDepartment,
          shiftType: mockShiftType,
        };

        const createdAssignment = {
          id: 1,
          shiftId: 1,
          instructorId: 1,
          assignedAt: new Date("2024-01-01T10:00:00Z"),
          instructor: mockInstructor,
        };

        // 重複チェックでシフトが存在しないことをモック
        mockShiftFindUnique.mockResolvedValue(null);

        mockTransaction.mockImplementation(
          async (callback) =>
            await callback({
              shift: {
                create: jest.fn().mockResolvedValue(createdShift),
              },
              shiftAssignment: {
                create: jest.fn().mockResolvedValue(createdAssignment),
              },
            } as unknown as Parameters<typeof callback>[0])
        );

        const request = createMockPostRequest(requestBody);

        // Act
        await POST(request);

        // Assert
        expect(mockTransaction).toHaveBeenCalled();
        expect(mockNextResponse.json).toHaveBeenCalledWith(
          {
            success: true,
            data: {
              id: 1,
              date: "2024-01-15",
              departmentId: 1,
              shiftTypeId: 1,
              description: "テストシフト",
              createdAt: createdShift.createdAt.toISOString(),
              updatedAt: createdShift.updatedAt.toISOString(),
              department: mockDepartment,
              shiftType: mockShiftType,
              assignments: [
                {
                  id: 1,
                  shiftId: 1,
                  instructorId: 1,
                  assignedAt: createdAssignment.assignedAt.toISOString(),
                  instructor: {
                    id: 1,
                    lastName: "山田",
                    firstName: "太郎",
                    status: "ACTIVE",
                  },
                },
              ],
              assignedCount: 1,
            },
            message: "シフトが正常に作成されました",
            error: null,
          },
          { status: 201 }
        );
      });

      it("割り当てインストラクターなしでシフトが作成されること", async () => {
        // Arrange
        const requestBody = {
          date: "2024-01-15",
          departmentId: 1,
          shiftTypeId: 1,
          description: "テストシフト",
        };

        const createdShift = {
          id: 1,
          date: new Date("2024-01-15"),
          departmentId: 1,
          shiftTypeId: 1,
          description: "テストシフト",
          createdAt: new Date("2024-01-01T10:00:00Z"),
          updatedAt: new Date("2024-01-01T10:00:00Z"),
          department: mockDepartment,
          shiftType: mockShiftType,
        };

        // 重複チェックでシフトが存在しないことをモック
        mockShiftFindUnique.mockResolvedValue(null);

        mockTransaction.mockImplementation(
          async (callback) =>
            await callback({
              shift: {
                create: jest.fn().mockResolvedValue(createdShift),
              },
              shiftAssignment: {
                create: jest.fn(),
              },
            } as unknown as Parameters<typeof callback>[0])
        );

        const request = createMockPostRequest(requestBody);

        // Act
        await POST(request);

        // Assert
        expect(mockNextResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            data: expect.objectContaining({
              assignments: [],
              assignedCount: 0,
            }),
          }),
          { status: 201 }
        );
      });
    });

    describe("異常系", () => {
      it("必須フィールドが不足している場合に400エラーが返されること", async () => {
        // Arrange
        const requestBody = {
          date: "2024-01-15",
          // departmentId が不足
          shiftTypeId: 1,
        };
        const request = createMockPostRequest(requestBody);

        // Act
        await POST(request);

        // Assert
        expect(mockNextResponse.json).toHaveBeenCalledWith(
          {
            success: false,
            data: null,
            message: null,
            error: "Required fields: date, departmentId, shiftTypeId",
          },
          { status: 400 }
        );
      });

      it("データベースエラーが発生した場合に500エラーが返されること", async () => {
        // Arrange
        const requestBody = {
          date: "2024-01-15",
          departmentId: 1,
          shiftTypeId: 1,
        };
        const mockError = new Error("Database error");
        // findUniqueでエラーが発生することをモック
        mockShiftFindUnique.mockRejectedValue(mockError);
        const consoleSpy = jest.spyOn(console, "error").mockImplementation();
        const request = createMockPostRequest(requestBody);

        // Act
        await POST(request);

        // Assert
        expect(consoleSpy).toHaveBeenCalledWith(
          "Shift creation error:",
          mockError
        );
        expect(mockNextResponse.json).toHaveBeenCalledWith(
          {
            success: false,
            data: null,
            message: null,
            error: "Internal server error",
          },
          { status: 500 }
        );

        consoleSpy.mockRestore();
      });
    });
  });
});
