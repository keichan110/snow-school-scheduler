import { GET, POST } from './route';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { authenticateFromRequest } from '@/lib/auth/middleware';

type ShiftType = {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Prismaクライアントをモック化
jest.mock('@/lib/db', () => ({
  prisma: {
    shiftType: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// NextResponseをモック化
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

// 認証ミドルウェアをモック化
jest.mock('@/lib/auth/middleware', () => ({
  authenticateFromRequest: jest.fn(),
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockShiftTypeFindMany = mockPrisma.shiftType.findMany as jest.MockedFunction<
  typeof prisma.shiftType.findMany
>;
const mockShiftTypeCreate = mockPrisma.shiftType.create as jest.MockedFunction<
  typeof prisma.shiftType.create
>;
const mockNextResponse = NextResponse as jest.Mocked<typeof NextResponse>;
const mockAuthenticateFromRequest = authenticateFromRequest as jest.MockedFunction<
  typeof authenticateFromRequest
>;

describe('GET /api/shift-types', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 認証成功をデフォルトでモック
    mockAuthenticateFromRequest.mockResolvedValue({
      success: true,
      user: {
        id: '1',
        lineUserId: 'test-line-user',
        displayName: 'Test User',
        profileImageUrl: null,
        role: 'ADMIN',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    // NextResponse.jsonのデフォルトモック実装
    mockNextResponse.json.mockImplementation((data, init) => {
      return {
        status: init?.status || 200,
        json: async () => data,
        cookies: {},
        headers: new Headers(),
        ok: true,
        redirected: false,
        statusText: 'OK',
        type: 'basic' as ResponseType,
        url: '',
        body: null,
        bodyUsed: false,
        clone: jest.fn(),
        arrayBuffer: jest.fn(),
        blob: jest.fn(),
        formData: jest.fn(),
        text: jest.fn(),
        [Symbol.for('NextResponse')]: true,
      } as unknown as NextResponse;
    });
  });

  describe('正常系', () => {
    it('シフト種類データが正しく返されること', async () => {
      // Arrange
      const mockShiftTypes: ShiftType[] = [
        {
          id: 1,
          name: 'レッスン',
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 2,
          name: 'パトロール',
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      mockShiftTypeFindMany.mockResolvedValue(mockShiftTypes);

      // Act
      await GET(new NextRequest('http://localhost'));

      // Assert
      expect(mockShiftTypeFindMany).toHaveBeenCalledWith({
        orderBy: {
          name: 'asc',
        },
      });

      expect(mockNextResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockShiftTypes,
        count: 2,
        message: null,
        error: null,
      });
    });

    it('シフト種類データが空の場合でも正しく処理されること', async () => {
      // Arrange
      const mockShiftTypes: ShiftType[] = [];
      mockShiftTypeFindMany.mockResolvedValue(mockShiftTypes);

      // Act
      await GET(new NextRequest('http://localhost'));

      // Assert
      expect(mockShiftTypeFindMany).toHaveBeenCalledWith({
        orderBy: {
          name: 'asc',
        },
      });

      expect(mockNextResponse.json).toHaveBeenCalledWith({
        success: true,
        data: [],
        count: 0,
        message: null,
        error: null,
      });
    });

    it('単一のシフト種類データが正しく返されること', async () => {
      // Arrange
      const mockShiftTypes: ShiftType[] = [
        {
          id: 1,
          name: 'レッスン',
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      mockShiftTypeFindMany.mockResolvedValue(mockShiftTypes);

      // Act
      await GET(new NextRequest('http://localhost'));

      // Assert
      expect(mockNextResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockShiftTypes,
        count: 1,
        message: null,
        error: null,
      });
    });
  });

  describe('異常系', () => {
    it('データベースエラーが発生した場合に500エラーが返されること', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      mockShiftTypeFindMany.mockRejectedValue(mockError);

      // console.errorをモック化してログ出力をテスト
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      await GET(new NextRequest('http://localhost'));

      // Assert
      expect(mockShiftTypeFindMany).toHaveBeenCalledWith({
        orderBy: {
          name: 'asc',
        },
      });

      expect(consoleSpy).toHaveBeenCalledWith('ShiftTypes API error:', mockError);

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          data: null,
          message: null,
          error: 'Internal server error',
        },
        { status: 500 }
      );

      // cleanup
      consoleSpy.mockRestore();
    });

    it('Prismaの特定のエラーが発生した場合も適切に処理されること', async () => {
      // Arrange
      const mockError = new Error('P2002: Unique constraint failed');
      mockError.name = 'PrismaClientKnownRequestError';
      mockShiftTypeFindMany.mockRejectedValue(mockError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      await GET(new NextRequest('http://localhost'));

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('ShiftTypes API error:', mockError);

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          data: null,
          message: null,
          error: 'Internal server error',
        },
        { status: 500 }
      );

      consoleSpy.mockRestore();
    });
  });

  describe('データベースクエリ', () => {
    it('シフト種類データが名前順（昇順）でソートされて取得されること', async () => {
      // Arrange
      const mockShiftTypes: Partial<ShiftType>[] = [
        { id: 2, name: 'パトロール' },
        { id: 1, name: 'レッスン' },
      ];
      mockShiftTypeFindMany.mockResolvedValue(mockShiftTypes as ShiftType[]);

      // Act
      await GET(new NextRequest('http://localhost'));

      // Assert
      expect(mockShiftTypeFindMany).toHaveBeenCalledWith({
        orderBy: {
          name: 'asc',
        },
      });
    });

    it('findManyが1回だけ呼ばれること', async () => {
      // Arrange
      mockShiftTypeFindMany.mockResolvedValue([]);

      // Act
      await GET(new NextRequest('http://localhost'));

      // Assert
      expect(mockShiftTypeFindMany).toHaveBeenCalledTimes(1);
    });
  });
});

describe('POST /api/shift-types', () => {
  // NextRequest.jsonをモック化
  const mockRequest = {
    json: jest.fn(),
  } as unknown as NextRequest;

  beforeEach(() => {
    jest.clearAllMocks();
    // 認証成功をデフォルトでモック
    mockAuthenticateFromRequest.mockResolvedValue({
      success: true,
      user: {
        id: '1',
        lineUserId: 'test-line-user',
        displayName: 'Test User',
        profileImageUrl: null,
        role: 'ADMIN',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    // NextResponse.jsonのデフォルトモック実装
    mockNextResponse.json.mockImplementation((data, init) => {
      return {
        status: init?.status || 200,
        json: async () => data,
        cookies: {},
        headers: new Headers(),
        ok: true,
        redirected: false,
        statusText: 'OK',
        type: 'basic' as ResponseType,
        url: '',
        body: null,
        bodyUsed: false,
        clone: jest.fn(),
        arrayBuffer: jest.fn(),
        blob: jest.fn(),
        formData: jest.fn(),
        text: jest.fn(),
        [Symbol.for('NextResponse')]: true,
      } as unknown as NextResponse;
    });
  });

  describe('正常系', () => {
    it('シフト種類が正常に作成されること', async () => {
      // Arrange
      const inputData = {
        name: 'レッスン',
        isActive: true,
      };

      const mockCreatedShiftType: ShiftType = {
        id: 1,
        name: 'レッスン',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockShiftTypeCreate.mockResolvedValue(mockCreatedShiftType);
      mockRequest.json = jest.fn().mockResolvedValue(inputData);

      // Act
      await POST(mockRequest);

      // Assert
      expect(mockShiftTypeCreate).toHaveBeenCalledWith({
        data: {
          name: inputData.name,
          isActive: inputData.isActive,
        },
      });

      expect(mockNextResponse.json).toHaveBeenCalledWith(mockCreatedShiftType, { status: 201 });
    });

    it('isActiveが未設定でもデフォルト値trueで作成されること', async () => {
      // Arrange
      const inputData = {
        name: 'レッスン',
      };

      const mockCreatedShiftType: ShiftType = {
        id: 1,
        name: 'レッスン',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockShiftTypeCreate.mockResolvedValue(mockCreatedShiftType);
      mockRequest.json = jest.fn().mockResolvedValue(inputData);

      // Act
      await POST(mockRequest);

      // Assert
      expect(mockShiftTypeCreate).toHaveBeenCalledWith({
        data: {
          name: inputData.name,
          isActive: true,
        },
      });

      expect(mockNextResponse.json).toHaveBeenCalledWith(mockCreatedShiftType, { status: 201 });
    });

    it('isActive=falseで作成されること', async () => {
      // Arrange
      const inputData = {
        name: 'レッスン',
        isActive: false,
      };

      const mockCreatedShiftType: ShiftType = {
        id: 1,
        name: 'レッスン',
        isActive: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockShiftTypeCreate.mockResolvedValue(mockCreatedShiftType);
      mockRequest.json = jest.fn().mockResolvedValue(inputData);

      // Act
      await POST(mockRequest);

      // Assert
      expect(mockShiftTypeCreate).toHaveBeenCalledWith({
        data: {
          name: inputData.name,
          isActive: inputData.isActive,
        },
      });

      expect(mockNextResponse.json).toHaveBeenCalledWith(mockCreatedShiftType, { status: 201 });
    });
  });

  describe('異常系', () => {
    it('nameが未設定の場合は400エラーが返されること', async () => {
      // Arrange
      const inputData = {
        isActive: true,
      };

      mockRequest.json = jest.fn().mockResolvedValue(inputData);

      // Act
      await POST(mockRequest);

      // Assert
      expect(mockShiftTypeCreate).not.toHaveBeenCalled();

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          data: null,
          message: null,
          error: 'Validation failed',
        },
        { status: 400 }
      );
    });

    it('nameが空文字の場合は400エラーが返されること', async () => {
      // Arrange
      const inputData = {
        name: '',
        isActive: true,
      };

      mockRequest.json = jest.fn().mockResolvedValue(inputData);

      // Act
      await POST(mockRequest);

      // Assert
      expect(mockShiftTypeCreate).not.toHaveBeenCalled();

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          data: null,
          message: null,
          error: 'Validation failed',
        },
        { status: 400 }
      );
    });

    it('データベースエラーが発生した場合は500エラーが返されること', async () => {
      // Arrange
      const inputData = {
        name: 'レッスン',
      };

      const mockError = new Error('Database error');
      mockShiftTypeCreate.mockRejectedValue(mockError);
      mockRequest.json = jest.fn().mockResolvedValue(inputData);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      await POST(mockRequest);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('ShiftTypes POST API error:', expect.any(Error));

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          data: null,
          message: null,
          error: 'Internal server error',
        },
        { status: 500 }
      );

      consoleSpy.mockRestore();
    });

    it('不正なJSONデータの場合は500エラーが返されること', async () => {
      // Arrange
      const jsonError = new Error('Invalid JSON');
      mockRequest.json = jest.fn().mockRejectedValue(jsonError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      await POST(mockRequest);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('ShiftTypes POST API error:', jsonError);

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          data: null,
          message: null,
          error: 'Internal server error',
        },
        { status: 500 }
      );

      consoleSpy.mockRestore();
    });
  });
});
