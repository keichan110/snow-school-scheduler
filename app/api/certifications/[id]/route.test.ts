import { GET, PUT } from './route';
import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { authenticateFromRequest } from '@/lib/auth/middleware';

// Prismaクライアントをモック化
jest.mock('@/lib/db', () => ({
  prisma: {
    certification: {
      findUnique: jest.fn(),
      update: jest.fn(),
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
const mockCertificationFindUnique = mockPrisma.certification.findUnique as jest.MockedFunction<
  typeof prisma.certification.findUnique
>;
const mockCertificationUpdate = mockPrisma.certification.update as jest.MockedFunction<
  typeof prisma.certification.update
>;
const mockNextResponse = NextResponse as jest.Mocked<typeof NextResponse>;
const mockAuthenticateFromRequest = authenticateFromRequest as jest.MockedFunction<
  typeof authenticateFromRequest
>;

describe('GET /api/certifications/[id]', () => {
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
    it('資格詳細データがインストラクター情報付きで正しく返されること', async () => {
      // Arrange
      const mockCertificationFromDB = {
        id: 1,
        departmentId: 1,
        name: 'スキー指導員',
        shortName: '指導員',
        organization: 'SAJ',
        description: 'スキー指導員資格',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        department: {
          id: 1,
          name: 'スキー',
        },
        instructorCertifications: [
          {
            instructor: {
              id: 1,
              lastName: '山田',
              firstName: '太郎',
              status: 'ACTIVE',
            },
          },
          {
            instructor: {
              id: 2,
              lastName: '鈴木',
              firstName: '花子',
              status: 'ACTIVE',
            },
          },
        ],
      };

      const expectedResponse = {
        id: 1,
        departmentId: 1,
        name: 'スキー指導員',
        shortName: '指導員',
        organization: 'SAJ',
        description: 'スキー指導員資格',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        department: {
          id: 1,
          name: 'スキー',
        },
        instructors: [
          {
            id: 1,
            lastName: '山田',
            firstName: '太郎',
            status: 'ACTIVE',
          },
          {
            id: 2,
            lastName: '鈴木',
            firstName: '花子',
            status: 'ACTIVE',
          },
        ],
      };

      mockCertificationFindUnique.mockResolvedValue(mockCertificationFromDB);

      // ルートパラメータを模擬
      const mockContext = {
        params: Promise.resolve({ id: '1' }),
      };

      // Act
      await GET(new NextRequest('http://localhost'), mockContext);

      // Assert
      expect(mockCertificationFindUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          instructorCertifications: {
            include: {
              instructor: {
                select: {
                  id: true,
                  lastName: true,
                  firstName: true,
                  status: true,
                },
              },
            },
          },
        },
      });

      expect(mockNextResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expectedResponse,
        message: null,
        error: null,
      });
    });

    it('インストラクターが関連付けられていない資格でも正しく返されること', async () => {
      // Arrange
      const mockCertificationFromDB = {
        id: 2,
        departmentId: 2,
        name: 'スノーボード指導員',
        shortName: '指導員',
        organization: 'JSBA',
        description: null,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        department: {
          id: 2,
          name: 'スノーボード',
        },
        instructorCertifications: [],
      };

      const expectedResponse = {
        id: 2,
        departmentId: 2,
        name: 'スノーボード指導員',
        shortName: '指導員',
        organization: 'JSBA',
        description: null,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        department: {
          id: 2,
          name: 'スノーボード',
        },
        instructors: [],
      };

      mockCertificationFindUnique.mockResolvedValue(mockCertificationFromDB);

      const mockContext = {
        params: Promise.resolve({ id: '2' }),
      };

      // Act
      await GET(new NextRequest('http://localhost'), mockContext);

      // Assert
      expect(mockNextResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expectedResponse,
        message: null,
        error: null,
      });
    });
  });

  describe('異常系', () => {
    it('存在しない資格IDの場合は404エラーが返されること', async () => {
      // Arrange
      mockCertificationFindUnique.mockResolvedValue(null);

      const mockContext = {
        params: Promise.resolve({ id: '999' }),
      };

      // Act
      await GET(new NextRequest('http://localhost'), mockContext);

      // Assert
      expect(mockCertificationFindUnique).toHaveBeenCalledWith({
        where: { id: 999 },
        include: {
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          instructorCertifications: {
            include: {
              instructor: {
                select: {
                  id: true,
                  lastName: true,
                  firstName: true,
                  status: true,
                },
              },
            },
          },
        },
      });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          data: null,
          message: null,
          error: 'Resource not found',
        },
        { status: 404 }
      );
    });

    it('不正なIDパラメータの場合は404エラーが返されること', async () => {
      // Arrange
      const mockContext = {
        params: Promise.resolve({ id: 'invalid' }),
      };

      // Act
      await GET(new NextRequest('http://localhost'), mockContext);

      // Assert
      expect(mockCertificationFindUnique).not.toHaveBeenCalled();

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          data: null,
          message: null,
          error: 'Resource not found',
        },
        { status: 404 }
      );
    });

    it('データベースエラーが発生した場合に500エラーが返されること', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      mockCertificationFindUnique.mockRejectedValue(mockError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const mockContext = {
        params: Promise.resolve({ id: '1' }),
      };

      // Act
      await GET(new NextRequest('http://localhost'), mockContext);

      // Assert
      expect(mockCertificationFindUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          instructorCertifications: {
            include: {
              instructor: {
                select: {
                  id: true,
                  lastName: true,
                  firstName: true,
                  status: true,
                },
              },
            },
          },
        },
      });

      expect(consoleSpy).toHaveBeenCalledWith('Certification API error:', mockError);

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
    it('findUniqueが正しいパラメータで呼ばれること', async () => {
      // Arrange
      const mockCertificationFromDB = {
        id: 1,
        departmentId: 1,
        name: 'Test Certification',
        shortName: 'テスト',
        organization: 'Test Org',
        description: null,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        department: { id: 1, name: 'Test Dept' },
        instructorCertifications: [],
      };
      mockCertificationFindUnique.mockResolvedValue(mockCertificationFromDB);

      const mockContext = {
        params: Promise.resolve({ id: '1' }),
      };

      // Act
      await GET(new NextRequest('http://localhost'), mockContext);

      // Assert
      expect(mockCertificationFindUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          instructorCertifications: {
            include: {
              instructor: {
                select: {
                  id: true,
                  lastName: true,
                  firstName: true,
                  status: true,
                },
              },
            },
          },
        },
      });
    });

    it('findUniqueが1回だけ呼ばれること', async () => {
      // Arrange
      mockCertificationFindUnique.mockResolvedValue(null);

      const mockContext = {
        params: Promise.resolve({ id: '1' }),
      };

      // Act
      await GET(new NextRequest('http://localhost'), mockContext);

      // Assert
      expect(mockCertificationFindUnique).toHaveBeenCalledTimes(1);
    });

    it('部門情報とインストラクター情報が適切にincludeされていること', async () => {
      // Arrange
      mockCertificationFindUnique.mockResolvedValue(null);

      const mockContext = {
        params: Promise.resolve({ id: '1' }),
      };

      // Act
      await GET(new NextRequest('http://localhost'), mockContext);

      // Assert
      expect(mockCertificationFindUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            department: {
              select: {
                id: true,
                name: true,
              },
            },
            instructorCertifications: {
              include: {
                instructor: {
                  select: {
                    id: true,
                    lastName: true,
                    firstName: true,
                    status: true,
                  },
                },
              },
            },
          },
        })
      );
    });
  });
});

describe('PUT /api/certifications/[id]', () => {
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
    it('資格が正常に更新されること', async () => {
      // Arrange
      const inputData = {
        departmentId: 1,
        name: 'スキー検定員',
        shortName: '検定員',
        organization: 'SAJ',
        description: '更新されたスキー検定員資格',
        isActive: true,
      };

      const mockUpdatedCertification = {
        id: 1,
        departmentId: 1,
        name: 'スキー検定員',
        shortName: '検定員',
        organization: 'SAJ',
        description: '更新されたスキー検定員資格',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        department: {
          id: 1,
          name: 'スキー',
        },
      };

      mockCertificationUpdate.mockResolvedValue(mockUpdatedCertification);
      mockRequest.json = jest.fn().mockResolvedValue(inputData);

      const mockContext = {
        params: Promise.resolve({ id: '1' }),
      };

      // Act
      await PUT(mockRequest, mockContext);

      // Assert
      expect(mockCertificationUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          departmentId: inputData.departmentId,
          name: inputData.name,
          shortName: inputData.shortName,
          organization: inputData.organization,
          description: inputData.description,
          isActive: inputData.isActive,
        },
        include: {
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      expect(mockNextResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedCertification,
        message: 'Certification updated successfully',
        error: null,
      });
    });

    it('必須フィールドのみでも資格が更新されること', async () => {
      // Arrange
      const inputData = {
        departmentId: 2,
        name: 'スノーボード検定員',
        shortName: '検定員',
        organization: 'JSBA',
      };

      const mockUpdatedCertification = {
        id: 1,
        departmentId: 2,
        name: 'スノーボード検定員',
        shortName: '検定員',
        organization: 'JSBA',
        description: null,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        department: {
          id: 2,
          name: 'スノーボード',
        },
      };

      mockCertificationUpdate.mockResolvedValue(mockUpdatedCertification);
      mockRequest.json = jest.fn().mockResolvedValue(inputData);

      const mockContext = {
        params: Promise.resolve({ id: '1' }),
      };

      // Act
      await PUT(mockRequest, mockContext);

      // Assert
      expect(mockCertificationUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          departmentId: inputData.departmentId,
          name: inputData.name,
          shortName: inputData.shortName,
          organization: inputData.organization,
          description: undefined,
          isActive: true,
        },
        include: {
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      expect(mockNextResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedCertification,
        message: 'Certification updated successfully',
        error: null,
      });
    });
  });

  describe('異常系', () => {
    it('存在しない資格IDの場合は404エラーが返されること', async () => {
      // Arrange
      const inputData = {
        departmentId: 1,
        name: 'テスト資格',
        shortName: 'テスト',
        organization: 'TEST',
      };

      const mockError = Object.assign(new Error('Record to update not found.'), {
        code: 'P2025',
      });
      mockCertificationUpdate.mockRejectedValue(mockError);
      mockRequest.json = jest.fn().mockResolvedValue(inputData);

      const mockContext = {
        params: Promise.resolve({ id: '999' }),
      };

      // Act
      await PUT(mockRequest, mockContext);

      // Assert
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          data: null,
          message: null,
          error: 'Resource not found',
        },
        { status: 404 }
      );
    });

    it('不正なIDパラメータの場合は404エラーが返されること', async () => {
      // Arrange
      const inputData = {
        departmentId: 1,
        name: 'テスト資格',
        shortName: 'テスト',
        organization: 'TEST',
      };

      mockRequest.json = jest.fn().mockResolvedValue(inputData);

      const mockContext = {
        params: Promise.resolve({ id: 'invalid' }),
      };

      // Act
      await PUT(mockRequest, mockContext);

      // Assert
      expect(mockCertificationUpdate).not.toHaveBeenCalled();

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          data: null,
          message: null,
          error: 'Resource not found',
        },
        { status: 404 }
      );
    });

    it('必須フィールドが不足している場合は400エラーが返されること', async () => {
      // Arrange
      const inputData = {
        name: 'テスト資格',
        // departmentId、shortName、organizationが不足
      };

      mockRequest.json = jest.fn().mockResolvedValue(inputData);

      const mockContext = {
        params: Promise.resolve({ id: '1' }),
      };

      // Act
      await PUT(mockRequest, mockContext);

      // Assert
      expect(mockCertificationUpdate).not.toHaveBeenCalled();

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          data: null,
          message: null,
          error: 'Missing required fields: departmentId, shortName, organization',
        },
        { status: 400 }
      );
    });

    it('データベースエラーが発生した場合は500エラーが返されること', async () => {
      // Arrange
      const inputData = {
        departmentId: 1,
        name: 'テスト資格',
        shortName: 'テスト',
        organization: 'TEST',
      };

      const mockError = new Error('Database error');
      mockCertificationUpdate.mockRejectedValue(mockError);
      mockRequest.json = jest.fn().mockResolvedValue(inputData);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const mockContext = {
        params: Promise.resolve({ id: '1' }),
      };

      // Act
      await PUT(mockRequest, mockContext);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Certification API error:', mockError);

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

      const mockContext = {
        params: Promise.resolve({ id: '1' }),
      };

      // Act
      await PUT(mockRequest, mockContext);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Certification API error:', jsonError);

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
    it('updateが正しいパラメータで呼ばれること', async () => {
      // Arrange
      const inputData = {
        departmentId: 1,
        name: 'テスト資格',
        shortName: 'テスト',
        organization: 'TEST',
      };

      const mockUpdatedCertification = {
        id: 1,
        departmentId: 1,
        name: 'テスト資格',
        shortName: 'テスト',
        organization: 'TEST',
        description: null,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        department: {
          id: 1,
          name: 'テスト部門',
        },
      };

      mockCertificationUpdate.mockResolvedValue(mockUpdatedCertification);
      mockRequest.json = jest.fn().mockResolvedValue(inputData);

      const mockContext = {
        params: Promise.resolve({ id: '1' }),
      };

      // Act
      await PUT(mockRequest, mockContext);

      // Assert
      expect(mockCertificationUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          departmentId: inputData.departmentId,
          name: inputData.name,
          shortName: inputData.shortName,
          organization: inputData.organization,
          description: undefined,
          isActive: true,
        },
        include: {
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    });

    it('updateが1回だけ呼ばれること', async () => {
      // Arrange
      const inputData = {
        departmentId: 1,
        name: 'テスト資格',
        shortName: 'テスト',
        organization: 'TEST',
      };

      const mockUpdatedCertification = {
        id: 1,
        departmentId: 1,
        name: 'テスト資格',
        shortName: 'テスト',
        organization: 'TEST',
        description: null,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        department: {
          id: 1,
          name: 'テスト部門',
        },
      };

      mockCertificationUpdate.mockResolvedValue(mockUpdatedCertification);
      mockRequest.json = jest.fn().mockResolvedValue(inputData);

      const mockContext = {
        params: Promise.resolve({ id: '1' }),
      };

      // Act
      await PUT(mockRequest, mockContext);

      // Assert
      expect(mockCertificationUpdate).toHaveBeenCalledTimes(1);
    });

    it('部門情報が適切にincludeされていること', async () => {
      // Arrange
      const inputData = {
        departmentId: 1,
        name: 'テスト資格',
        shortName: 'テスト',
        organization: 'TEST',
      };

      const mockUpdatedCertification = {
        id: 1,
        departmentId: 1,
        name: 'テスト資格',
        shortName: 'テスト',
        organization: 'TEST',
        description: null,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
        department: {
          id: 1,
          name: 'テスト部門',
        },
      };

      mockCertificationUpdate.mockResolvedValue(mockUpdatedCertification);
      mockRequest.json = jest.fn().mockResolvedValue(inputData);

      const mockContext = {
        params: Promise.resolve({ id: '1' }),
      };

      // Act
      await PUT(mockRequest, mockContext);

      // Assert
      expect(mockCertificationUpdate).toHaveBeenCalledWith(
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
