import { NextRequest, NextResponse } from "next/server";
import { authenticateFromRequest } from "@/lib/auth/middleware";
import { prisma } from "@/lib/db";
import { DELETE, GET, PUT } from "./route";

// Mock types (同じ型定義を再利用)
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
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    shiftAssignment: {
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

// NextResponseとNextRequestをモック化
jest.mock("next/server", () => ({
  NextResponse: jest.fn().mockImplementation((body, init) => ({
    status: init?.status || 200,
    json: async () => body,
    headers: new Headers(),
  })),
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

jest.mock("@/lib/auth/middleware", () => ({
  authenticateFromRequest: jest.fn(),
}));

// NextResponseをjsonとコンストラクタの両方でモック化
const MockedNextResponse = NextResponse as jest.MockedClass<
  typeof NextResponse
>;
const mockNextResponseJson = jest.fn();
MockedNextResponse.json = mockNextResponseJson;

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockShiftFindUnique = mockPrisma.shift.findUnique as jest.MockedFunction<
  typeof prisma.shift.findUnique
>;
const mockTransaction = mockPrisma.$transaction as jest.MockedFunction<
  typeof prisma.$transaction
>;
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

describe("Shifts [id] API", () => {
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
    // NextResponse.jsonのデフォルトモック実装
    mockNextResponseJson.mockImplementation(
      (
        data: Parameters<typeof NextResponse.json>[0],
        init?: Parameters<typeof NextResponse.json>[1]
      ) =>
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

    // NextResponseコンストラクタのモック実装
    MockedNextResponse.mockImplementation(
      (body, init) =>
        ({
          status: init?.status || 200,
          json: async () => body,
          cookies: {},
          headers: new Headers(),
          ok: true,
          redirected: false,
          statusText: init?.status === 204 ? "No Content" : "OK",
          type: "basic" as ResponseType,
          url: "",
          body,
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

  describe("GET /api/shifts/[id]", () => {
    const createMockGetRequest = () =>
      new NextRequest("http://localhost/api/shifts/1");
    const createMockContext = (id: string) => ({
      params: Promise.resolve({ id }),
    });

    describe("正常系", () => {
      it("シフト詳細が正しく返されること", async () => {
        // Arrange
        mockShiftFindUnique.mockResolvedValue(mockShift);
        const request = createMockGetRequest();
        const context = createMockContext("1");

        // Act
        const response = await GET(request, context);

        // Assert
        expect(mockShiftFindUnique).toHaveBeenCalledWith({
          where: { id: 1 },
          include: {
            department: true,
            shiftType: true,
            shiftAssignments: {
              include: {
                instructor: true,
              },
            },
          },
        });

        const responseJson = await response.json();
        expect(responseJson).toEqual({
          success: true,
          data: {
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
          message: "Shift operation completed successfully",
          error: null,
        });
      });
    });

    describe("異常系", () => {
      it("無効なIDの場合に400エラーが返されること", async () => {
        // Arrange
        const request = createMockGetRequest();
        const context = createMockContext("invalid");

        // Act
        const response = await GET(request, context);

        // Assert
        expect(response.status).toBe(400);
        const responseJson = await response.json();
        expect(responseJson).toEqual({
          success: false,
          data: null,
          message: null,
          error: "Invalid shift ID",
        });
      });

      it("シフトが見つからない場合に404エラーが返されること", async () => {
        // Arrange
        mockShiftFindUnique.mockResolvedValue(null);
        const request = createMockGetRequest();
        const context = createMockContext("999");

        // Act
        const response = await GET(request, context);

        // Assert
        expect(response.status).toBe(404);
        const responseJson = await response.json();
        expect(responseJson).toEqual({
          success: false,
          data: null,
          message: null,
          error: "Resource not found",
        });
      });

      it("データベースエラーが発生した場合に500エラーが返されること", async () => {
        // Arrange
        const mockError = new Error("Database error");
        mockShiftFindUnique.mockRejectedValue(mockError);
        const consoleSpy = jest.spyOn(console, "error").mockImplementation();
        const request = createMockGetRequest();
        const context = createMockContext("1");

        // Act
        const response = await GET(request, context);

        // Assert
        expect(response.status).toBe(500);
        expect(consoleSpy).toHaveBeenCalledWith("Shift GET error:", mockError);

        consoleSpy.mockRestore();
      });
    });
  });

  describe("PUT /api/shifts/[id]", () => {
    const createMockPutRequest = (body: Record<string, unknown>) =>
      new NextRequest("http://localhost/api/shifts/1", {
        method: "PUT",
        body: JSON.stringify(body),
      });
    const createMockContext = (id: string) => ({
      params: Promise.resolve({ id }),
    });

    describe("正常系", () => {
      it("シフトが正しく更新されること", async () => {
        // Arrange
        const requestBody = {
          date: "2024-01-16",
          departmentId: 1,
          shiftTypeId: 1,
          description: "更新されたシフト",
          assignedInstructorIds: [1],
        };

        const existingShift = { ...mockShift };
        const updatedShift = {
          ...mockShift,
          date: new Date("2024-01-16"),
          description: "更新されたシフト",
          updatedAt: new Date("2024-01-02T10:00:00Z"),
        };

        mockShiftFindUnique.mockResolvedValue(existingShift);

        mockTransaction.mockImplementation(
          async (callback) =>
            await callback({
              shift: {
                update: jest.fn().mockResolvedValue({
                  ...updatedShift,
                  department: mockDepartment,
                  shiftType: mockShiftType,
                }),
              },
              shiftAssignment: {
                deleteMany: jest.fn(),
                create: jest.fn().mockResolvedValue({
                  ...mockShiftAssignment,
                  assignedAt: new Date("2024-01-02T10:00:00Z"),
                }),
              },
            } as unknown as Parameters<typeof callback>[0])
        );

        const request = createMockPutRequest(requestBody);
        const context = createMockContext("1");

        // Act
        await PUT(request, context);

        // Assert
        expect(mockShiftFindUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(mockTransaction).toHaveBeenCalled();
      });
    });

    describe("異常系", () => {
      it("無効なIDの場合に400エラーが返されること", async () => {
        // Arrange
        const requestBody = {
          date: "2024-01-16",
          departmentId: 1,
          shiftTypeId: 1,
        };
        const request = createMockPutRequest(requestBody);
        const context = createMockContext("invalid");

        // Act
        const response = await PUT(request, context);

        // Assert
        expect(response.status).toBe(400);
      });

      it("必須フィールドが不足している場合に400エラーが返されること", async () => {
        // Arrange
        const requestBody = {
          date: "2024-01-16",
          // departmentId が不足
          shiftTypeId: 1,
        };
        const request = createMockPutRequest(requestBody);
        const context = createMockContext("1");

        // Act
        const response = await PUT(request, context);

        // Assert
        expect(response.status).toBe(400);
        const responseJson = await response.json();
        expect(responseJson.error).toBe(
          "Required fields: date, departmentId, shiftTypeId"
        );
      });

      it("存在しないシフトを更新しようとした場合に404エラーが返されること", async () => {
        // Arrange
        const requestBody = {
          date: "2024-01-16",
          departmentId: 1,
          shiftTypeId: 1,
        };
        mockShiftFindUnique.mockResolvedValue(null);
        const request = createMockPutRequest(requestBody);
        const context = createMockContext("999");

        // Act
        const response = await PUT(request, context);

        // Assert
        expect(response.status).toBe(404);
        const responseJson = await response.json();
        expect(responseJson.error).toBe("Resource not found");
      });
    });
  });

  describe("DELETE /api/shifts/[id]", () => {
    const createMockDeleteRequest = () =>
      new NextRequest("http://localhost/api/shifts/1", { method: "DELETE" });
    const createMockContext = (id: string) => ({
      params: Promise.resolve({ id }),
    });

    describe("正常系", () => {
      it("シフトが正しく削除されること", async () => {
        // Arrange
        mockShiftFindUnique.mockResolvedValue(mockShift);
        mockTransaction.mockImplementation(
          async (callback) =>
            await callback({
              shiftAssignment: {
                deleteMany: jest.fn(),
              },
              shift: {
                delete: jest.fn(),
              },
            } as unknown as Parameters<typeof callback>[0])
        );

        const request = createMockDeleteRequest();
        const context = createMockContext("1");

        // Act
        const response = await DELETE(request, context);

        // Assert
        expect(mockShiftFindUnique).toHaveBeenCalledWith({ where: { id: 1 } });
        expect(mockTransaction).toHaveBeenCalled();
        expect(response.status).toBe(204);
      });
    });

    describe("異常系", () => {
      it("無効なIDの場合に400エラーが返されること", async () => {
        // Arrange
        const request = createMockDeleteRequest();
        const context = createMockContext("invalid");

        // Act
        const response = await DELETE(request, context);

        // Assert
        expect(response.status).toBe(400);
        const responseJson = await response.json();
        expect(responseJson.error).toBe("Invalid shift ID");
      });

      it("存在しないシフトを削除しようとした場合に404エラーが返されること", async () => {
        // Arrange
        mockShiftFindUnique.mockResolvedValue(null);
        const request = createMockDeleteRequest();
        const context = createMockContext("999");

        // Act
        const response = await DELETE(request, context);

        // Assert
        expect(response.status).toBe(404);
        const responseJson = await response.json();
        expect(responseJson.error).toBe("Resource not found");
      });

      it("データベースエラーが発生した場合に500エラーが返されること", async () => {
        // Arrange
        const mockError = new Error("Database error");
        mockShiftFindUnique.mockResolvedValue(mockShift);
        mockTransaction.mockRejectedValue(mockError);
        const consoleSpy = jest.spyOn(console, "error").mockImplementation();
        const request = createMockDeleteRequest();
        const context = createMockContext("1");

        // Act
        const response = await DELETE(request, context);

        // Assert
        expect(response.status).toBe(500);
        expect(consoleSpy).toHaveBeenCalledWith(
          "Shift DELETE error:",
          mockError
        );

        consoleSpy.mockRestore();
      });
    });
  });
});
