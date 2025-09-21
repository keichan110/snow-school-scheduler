import { GET } from './route';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { authenticateFromRequest } from '@/lib/auth/middleware';

type Department = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Prismaクライアントをモック化
jest.mock('@/lib/db', () => ({
  prisma: {
    department: {
      findMany: jest.fn(),
    },
  },
}));

// NextResponseとNextRequestをモック化
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
  NextRequest: jest.fn((url, init) => ({
    url,
    ...init,
    headers: new Headers(init?.headers),
    cookies: {
      get: jest.fn().mockReturnValue({ value: 'test-token' }),
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
jest.mock('@/lib/auth/middleware', () => ({
  authenticateFromRequest: jest.fn(),
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockDepartmentFindMany = mockPrisma.department.findMany as jest.MockedFunction<
  typeof prisma.department.findMany
>;
const mockNextResponse = NextResponse as jest.Mocked<typeof NextResponse>;
const mockAuthenticateFromRequest = authenticateFromRequest as jest.MockedFunction<
  typeof authenticateFromRequest
>;

describe('GET /api/departments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 認証成功をデフォルトでモック
    mockAuthenticateFromRequest.mockResolvedValue({
      success: true,
      user: {
        id: '1',
        lineUserId: 'test-user',
        displayName: 'Test User',
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
    it('部門データが正しく返されること', async () => {
      // Arrange
      const mockDepartments: Department[] = [
        {
          id: 1,
          code: 'SKI',
          name: 'スキー',
          description: 'スキー部門',
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 2,
          code: 'SNOWBOARD',
          name: 'スノーボード',
          description: 'スノーボード部門',
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      mockDepartmentFindMany.mockResolvedValue(mockDepartments);

      // Act
      await GET(new NextRequest('http://localhost'));

      // Assert
      expect(mockDepartmentFindMany).toHaveBeenCalledWith({
        orderBy: {
          name: 'asc',
        },
      });

      expect(mockNextResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockDepartments,
        count: 2,
        message: null,
        error: null,
      });
    });

    it('部門データが空の場合でも正しく処理されること', async () => {
      // Arrange
      const mockDepartments: Department[] = [];
      mockDepartmentFindMany.mockResolvedValue(mockDepartments);

      // Act
      await GET(new NextRequest('http://localhost'));

      // Assert
      expect(mockDepartmentFindMany).toHaveBeenCalledWith({
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

    it('単一の部門データが正しく返されること', async () => {
      // Arrange
      const mockDepartments: Department[] = [
        {
          id: 1,
          code: 'SKI',
          name: 'スキー',
          description: 'スキー部門',
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      mockDepartmentFindMany.mockResolvedValue(mockDepartments);

      // Act
      await GET(new NextRequest('http://localhost'));

      // Assert
      expect(mockNextResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockDepartments,
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
      mockDepartmentFindMany.mockRejectedValue(mockError);

      // console.errorをモック化してログ出力をテスト
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      await GET(new NextRequest('http://localhost'));

      // Assert
      expect(mockDepartmentFindMany).toHaveBeenCalledWith({
        orderBy: {
          name: 'asc',
        },
      });

      expect(consoleSpy).toHaveBeenCalledWith('Departments API error:', mockError);

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
      mockDepartmentFindMany.mockRejectedValue(mockError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Act
      await GET(new NextRequest('http://localhost'));

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Departments API error:', mockError);

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
    it('部門データが名前順（昇順）でソートされて取得されること', async () => {
      // Arrange
      const mockDepartments: Partial<Department>[] = [
        { id: 2, code: 'SNOWBOARD', name: 'スノーボード' },
        { id: 1, code: 'SKI', name: 'スキー' },
      ];
      mockDepartmentFindMany.mockResolvedValue(mockDepartments as Department[]);

      // Act
      await GET(new NextRequest('http://localhost'));

      // Assert
      expect(mockDepartmentFindMany).toHaveBeenCalledWith({
        orderBy: {
          name: 'asc',
        },
      });
    });

    it('findManyが1回だけ呼ばれること', async () => {
      // Arrange
      mockDepartmentFindMany.mockResolvedValue([]);

      // Act
      await GET(new NextRequest('http://localhost'));

      // Assert
      expect(mockDepartmentFindMany).toHaveBeenCalledTimes(1);
    });
  });
});
