import { GET, PUT } from './route';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { InstructorStatus } from '@/shared/types/common';

// Request グローバルオブジェクトのモック
global.Request = class MockRequest {
  url: string;
  method: string;
  private _body: unknown;

  constructor(url: string, options?: { method?: string; body?: unknown }) {
    this.url = url;
    this.method = options?.method || 'GET';
    this._body = options?.body;
  }

  async json(): Promise<unknown> {
    if (typeof this._body === 'string') {
      return JSON.parse(this._body);
    }
    return this._body || {};
  }
} as unknown as typeof Request;

type InstructorWithCertifications = {
  id: number;
  lastName: string;
  firstName: string;
  lastNameKana: string | null;
  firstNameKana: string | null;
  status: InstructorStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  certifications: {
    certification: {
      id: number;
      name: string;
      shortName: string | null;
      organization: string;
      department: {
        id: number;
        name: string;
      };
    };
  }[];
};

// Prismaクライアントをモック化
jest.mock('@/lib/db', () => ({
  prisma: {
    instructor: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    certification: {
      findMany: jest.fn(),
    },
    instructorCertification: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

// NextResponseをモック化
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockInstructorFindUnique = mockPrisma.instructor.findUnique as jest.MockedFunction<
  typeof prisma.instructor.findUnique
>;
const mockInstructorUpdate = mockPrisma.instructor.update as jest.MockedFunction<
  typeof prisma.instructor.update
>;
const mockCertificationFindMany = mockPrisma.certification.findMany as jest.MockedFunction<
  typeof prisma.certification.findMany
>;
const mockInstructorCertificationDeleteMany = mockPrisma.instructorCertification
  .deleteMany as jest.MockedFunction<typeof prisma.instructorCertification.deleteMany>;
const mockInstructorCertificationCreateMany = mockPrisma.instructorCertification
  .createMany as jest.MockedFunction<typeof prisma.instructorCertification.createMany>;
const mockTransaction = mockPrisma.$transaction as jest.MockedFunction<typeof prisma.$transaction>;
const mockNextResponse = NextResponse as jest.Mocked<typeof NextResponse>;

describe('GET /api/instructors/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    it('インストラクターの詳細情報が資格情報付きで正しく返されること', async () => {
      // Arrange
      const mockInstructor: InstructorWithCertifications = {
        id: 1,
        lastName: '山田',
        firstName: '太郎',
        lastNameKana: 'ヤマダ',
        firstNameKana: 'タロウ',
        status: 'ACTIVE' as InstructorStatus,
        notes: 'テストメモ',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
        certifications: [
          {
            certification: {
              id: 1,
              name: 'スキー指導員',
              shortName: '指導員',
              organization: 'SAJ',
              department: {
                id: 1,
                name: 'スキー',
              },
            },
          },
          {
            certification: {
              id: 2,
              name: 'スキー準指導員',
              shortName: '準指導員',
              organization: 'SAJ',
              department: {
                id: 1,
                name: 'スキー',
              },
            },
          },
        ],
      };

      mockInstructorFindUnique.mockResolvedValue(mockInstructor);

      const mockRequest = new Request('http://localhost:3000/api/instructors/1');
      const context = { params: Promise.resolve({ id: '1' }) };

      // Act
      await GET(mockRequest, context);

      // Assert
      expect(mockInstructorFindUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          certifications: {
            include: {
              certification: {
                include: {
                  department: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      expect(mockNextResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          id: 1,
          lastName: '山田',
          firstName: '太郎',
          lastNameKana: 'ヤマダ',
          firstNameKana: 'タロウ',
          status: 'ACTIVE',
          notes: 'テストメモ',
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
          updatedAt: new Date('2024-01-01T00:00:00.000Z'),
          certifications: [
            {
              id: 1,
              name: 'スキー指導員',
              shortName: '指導員',
              organization: 'SAJ',
              department: {
                id: 1,
                name: 'スキー',
              },
            },
            {
              id: 2,
              name: 'スキー準指導員',
              shortName: '準指導員',
              organization: 'SAJ',
              department: {
                id: 1,
                name: 'スキー',
              },
            },
          ],
        },
        message: 'Instructor operation completed successfully',
        error: null,
      });
    });

    it('資格情報がないインストラクターでも正しく返されること', async () => {
      // Arrange
      const mockInstructor: InstructorWithCertifications = {
        id: 2,
        lastName: '佐藤',
        firstName: '花子',
        lastNameKana: null,
        firstNameKana: null,
        status: 'INACTIVE' as InstructorStatus,
        notes: null,
        createdAt: new Date('2024-01-02T00:00:00.000Z'),
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
        certifications: [],
      };

      mockInstructorFindUnique.mockResolvedValue(mockInstructor);

      const mockRequest = new Request('http://localhost:3000/api/instructors/2');
      const context = { params: Promise.resolve({ id: '2' }) };

      // Act
      await GET(mockRequest, context);

      // Assert
      expect(mockNextResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          id: 2,
          lastName: '佐藤',
          firstName: '花子',
          lastNameKana: null,
          firstNameKana: null,
          status: 'INACTIVE',
          notes: null,
          createdAt: new Date('2024-01-02T00:00:00.000Z'),
          updatedAt: new Date('2024-01-02T00:00:00.000Z'),
          certifications: [],
        },
        message: 'Instructor operation completed successfully',
        error: null,
      });
    });

    it('数値文字列のIDが正しく整数に変換されること', async () => {
      // Arrange
      const mockInstructor: InstructorWithCertifications = {
        id: 123,
        lastName: '田中',
        firstName: '三郎',
        lastNameKana: 'タナカ',
        firstNameKana: 'サブロウ',
        status: 'RETIRED' as InstructorStatus,
        notes: '退職済み',
        createdAt: new Date('2024-01-03T00:00:00.000Z'),
        updatedAt: new Date('2024-01-03T00:00:00.000Z'),
        certifications: [],
      };

      mockInstructorFindUnique.mockResolvedValue(mockInstructor);

      const mockRequest = new Request('http://localhost:3000/api/instructors/123');
      const context = { params: Promise.resolve({ id: '123' }) };

      // Act
      await GET(mockRequest, context);

      // Assert
      expect(mockInstructorFindUnique).toHaveBeenCalledWith({
        where: { id: 123 },
        include: {
          certifications: {
            include: {
              certification: {
                include: {
                  department: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    });
  });

  describe('異常系', () => {
    it('存在しないIDが指定された場合に404エラーが返されること', async () => {
      // Arrange
      mockInstructorFindUnique.mockResolvedValue(null);

      const mockRequest = new Request('http://localhost:3000/api/instructors/999');
      const context = { params: Promise.resolve({ id: '999' }) };

      // Act
      await GET(mockRequest, context);

      // Assert
      expect(mockInstructorFindUnique).toHaveBeenCalledWith({
        where: { id: 999 },
        include: {
          certifications: {
            include: {
              certification: {
                include: {
                  department: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
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

    it('無効なID（数値でない）が指定された場合に400エラーが返されること', async () => {
      // Arrange
      const mockRequest = new Request('http://localhost:3000/api/instructors/invalid');
      const context = { params: Promise.resolve({ id: 'invalid' }) };

      // Act
      await GET(mockRequest, context);

      // Assert
      expect(mockInstructorFindUnique).not.toHaveBeenCalled();
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          data: null,
          message: null,
          error: 'Invalid ID format',
        },
        { status: 400 }
      );
    });

    it('負の数値IDが指定された場合に400エラーが返されること', async () => {
      // Arrange
      const mockRequest = new Request('http://localhost:3000/api/instructors/-1');
      const context = { params: Promise.resolve({ id: '-1' }) };

      // Act
      await GET(mockRequest, context);

      // Assert
      expect(mockInstructorFindUnique).not.toHaveBeenCalled();
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          data: null,
          message: null,
          error: 'Invalid ID format',
        },
        { status: 400 }
      );
    });

    it('0のIDが指定された場合に400エラーが返されること', async () => {
      // Arrange
      const mockRequest = new Request('http://localhost:3000/api/instructors/0');
      const context = { params: Promise.resolve({ id: '0' }) };

      // Act
      await GET(mockRequest, context);

      // Assert
      expect(mockInstructorFindUnique).not.toHaveBeenCalled();
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          data: null,
          message: null,
          error: 'Invalid ID format',
        },
        { status: 400 }
      );
    });

    it('データベースエラーが発生した場合に500エラーが返されること', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      mockInstructorFindUnique.mockRejectedValue(mockError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockRequest = new Request('http://localhost:3000/api/instructors/1');
      const context = { params: Promise.resolve({ id: '1' }) };

      // Act
      await GET(mockRequest, context);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Instructor API error:', mockError);

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
    it('findUniqueが1回だけ呼ばれること', async () => {
      // Arrange
      const mockInstructor: InstructorWithCertifications = {
        id: 1,
        lastName: '山田',
        firstName: '太郎',
        lastNameKana: 'ヤマダ',
        firstNameKana: 'タロウ',
        status: 'ACTIVE' as InstructorStatus,
        notes: null,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
        certifications: [],
      };

      mockInstructorFindUnique.mockResolvedValue(mockInstructor);

      const mockRequest = new Request('http://localhost:3000/api/instructors/1');
      const context = { params: Promise.resolve({ id: '1' }) };

      // Act
      await GET(mockRequest, context);

      // Assert
      expect(mockInstructorFindUnique).toHaveBeenCalledTimes(1);
    });

    it('資格情報が適切にincludeされていること', async () => {
      // Arrange
      mockInstructorFindUnique.mockResolvedValue(null);

      const mockRequest = new Request('http://localhost:3000/api/instructors/1');
      const context = { params: Promise.resolve({ id: '1' }) };

      // Act
      await GET(mockRequest, context);

      // Assert
      expect(mockInstructorFindUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            certifications: {
              include: {
                certification: {
                  include: {
                    department: {
                      select: {
                        id: true,
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        })
      );
    });

    it('正しいwhere条件でクエリが実行されること', async () => {
      // Arrange
      mockInstructorFindUnique.mockResolvedValue(null);

      const mockRequest = new Request('http://localhost:3000/api/instructors/42');
      const context = { params: Promise.resolve({ id: '42' }) };

      // Act
      await GET(mockRequest, context);

      // Assert
      expect(mockInstructorFindUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 42 },
        })
      );
    });
  });

  describe('レスポンス形式', () => {
    it('OpenAPI仕様に準拠したレスポンス形式で返されること', async () => {
      // Arrange
      const mockInstructor: InstructorWithCertifications = {
        id: 1,
        lastName: '山田',
        firstName: '太郎',
        lastNameKana: 'ヤマダ',
        firstNameKana: 'タロウ',
        status: 'ACTIVE' as InstructorStatus,
        notes: null,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-01T00:00:00.000Z'),
        certifications: [
          {
            certification: {
              id: 1,
              name: 'スキー指導員',
              shortName: '指導員',
              organization: 'SAJ',
              department: {
                id: 1,
                name: 'スキー',
              },
            },
          },
        ],
      };

      mockInstructorFindUnique.mockResolvedValue(mockInstructor);

      const mockRequest = new Request('http://localhost:3000/api/instructors/1');
      const context = { params: Promise.resolve({ id: '1' }) };

      // Act
      await GET(mockRequest, context);

      // Assert
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: expect.any(Boolean),
          data: expect.objectContaining({
            id: expect.any(Number),
            lastName: expect.any(String),
            firstName: expect.any(String),
            status: expect.stringMatching(/^(ACTIVE|INACTIVE|RETIRED)$/),
            certifications: expect.arrayContaining([
              expect.objectContaining({
                id: expect.any(Number),
                name: expect.any(String),
                organization: expect.any(String),
                department: expect.objectContaining({
                  id: expect.any(Number),
                  name: expect.any(String),
                }),
              }),
            ]),
          }),
          message: expect.any(String),
          error: null,
        })
      );
    });

    it('エラー時はOpenAPI仕様に準拠したエラーレスポンス形式で返されること', async () => {
      // Arrange
      mockInstructorFindUnique.mockResolvedValue(null);

      const mockRequest = new Request('http://localhost:3000/api/instructors/999');
      const context = { params: Promise.resolve({ id: '999' }) };

      // Act
      await GET(mockRequest, context);

      // Assert
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          data: null,
          message: null,
          error: expect.any(String),
        }),
        expect.objectContaining({
          status: expect.any(Number),
        })
      );
    });
  });
});

describe('PUT /api/instructors/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    it('インストラクター情報が正しく更新されること', async () => {
      // Arrange
      const requestBody = {
        lastName: '田中',
        firstName: '花子',
        lastNameKana: 'タナカ',
        firstNameKana: 'ハナコ',
        status: 'ACTIVE',
        notes: '更新テスト',
        certificationIds: [1, 2],
      };

      const existingInstructor = {
        id: 1,
        lastName: '山田',
        firstName: '太郎',
      };

      const existingCertifications = [
        { id: 1, name: 'スキー指導員', isActive: true },
        { id: 2, name: 'スキー準指導員', isActive: true },
      ];

      const updatedInstructor: InstructorWithCertifications = {
        id: 1,
        lastName: '田中',
        firstName: '花子',
        lastNameKana: 'タナカ',
        firstNameKana: 'ハナコ',
        status: 'ACTIVE' as InstructorStatus,
        notes: '更新テスト',
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
        certifications: [
          {
            certification: {
              id: 1,
              name: 'スキー指導員',
              shortName: '指導員',
              organization: 'SAJ',
              department: {
                id: 1,
                name: 'スキー',
              },
            },
          },
          {
            certification: {
              id: 2,
              name: 'スキー準指導員',
              shortName: '準指導員',
              organization: 'SAJ',
              department: {
                id: 1,
                name: 'スキー',
              },
            },
          },
        ],
      };

      mockInstructorFindUnique.mockResolvedValue(existingInstructor as never);
      mockCertificationFindMany.mockResolvedValue(existingCertifications as never);
      mockTransaction.mockImplementation(async (callback) => {
        return await callback({
          instructor: {
            update: mockInstructorUpdate.mockResolvedValue(updatedInstructor),
            findUnique: jest.fn().mockResolvedValue(updatedInstructor),
          },
          instructorCertification: {
            deleteMany: mockInstructorCertificationDeleteMany,
            createMany: mockInstructorCertificationCreateMany,
          },
        } as never);
      });

      const mockRequest = new Request('http://localhost:3000/api/instructors/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      const context = { params: Promise.resolve({ id: '1' }) };

      // Act
      await PUT(mockRequest, context);

      // Assert
      expect(mockNextResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          id: 1,
          lastName: '田中',
          firstName: '花子',
          lastNameKana: 'タナカ',
          firstNameKana: 'ハナコ',
          status: 'ACTIVE',
          notes: '更新テスト',
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
          updatedAt: new Date('2024-01-02T00:00:00.000Z'),
          certifications: [
            {
              id: 1,
              name: 'スキー指導員',
              shortName: '指導員',
              organization: 'SAJ',
              department: {
                id: 1,
                name: 'スキー',
              },
            },
            {
              id: 2,
              name: 'スキー準指導員',
              shortName: '準指導員',
              organization: 'SAJ',
              department: {
                id: 1,
                name: 'スキー',
              },
            },
          ],
        },
        message: 'Instructor operation completed successfully',
        error: null,
      });
    });

    it('資格指定なしでインストラクター情報が更新されること', async () => {
      // Arrange
      const requestBody = {
        lastName: '佐藤',
        firstName: '次郎',
        status: 'INACTIVE',
      };

      const existingInstructor = {
        id: 2,
        lastName: '山田',
        firstName: '太郎',
      };

      const updatedInstructor: InstructorWithCertifications = {
        id: 2,
        lastName: '佐藤',
        firstName: '次郎',
        lastNameKana: null,
        firstNameKana: null,
        status: 'INACTIVE' as InstructorStatus,
        notes: null,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
        certifications: [],
      };

      mockInstructorFindUnique.mockResolvedValue(existingInstructor as never);
      mockTransaction.mockImplementation(async (callback) => {
        return await callback({
          instructor: {
            update: mockInstructorUpdate.mockResolvedValue(updatedInstructor),
            findUnique: jest.fn().mockResolvedValue(updatedInstructor),
          },
          instructorCertification: {
            deleteMany: mockInstructorCertificationDeleteMany,
            createMany: mockInstructorCertificationCreateMany,
          },
        } as never);
      });

      const mockRequest = new Request('http://localhost:3000/api/instructors/2', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      const context = { params: Promise.resolve({ id: '2' }) };

      // Act
      await PUT(mockRequest, context);

      // Assert
      expect(mockCertificationFindMany).not.toHaveBeenCalled();
      expect(mockNextResponse.json).toHaveBeenCalledWith({
        success: true,
        data: {
          id: 2,
          lastName: '佐藤',
          firstName: '次郎',
          lastNameKana: null,
          firstNameKana: null,
          status: 'INACTIVE',
          notes: null,
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
          updatedAt: new Date('2024-01-02T00:00:00.000Z'),
          certifications: [],
        },
        message: 'Instructor operation completed successfully',
        error: null,
      });
    });
  });

  describe('異常系', () => {
    it('存在しないIDが指定された場合に404エラーが返されること', async () => {
      // Arrange
      const requestBody = {
        lastName: '存在しない',
        firstName: 'インストラクター',
      };

      mockInstructorFindUnique.mockResolvedValue(null);

      const mockRequest = new Request('http://localhost:3000/api/instructors/999', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      const context = { params: Promise.resolve({ id: '999' }) };

      // Act
      await PUT(mockRequest, context);

      // Assert
      expect(mockTransaction).not.toHaveBeenCalled();
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

    it('必須フィールドが不足している場合に400エラーが返されること', async () => {
      // Arrange
      const requestBody = {
        lastName: '田中',
        // firstName が不足
      };

      const mockRequest = new Request('http://localhost:3000/api/instructors/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      const context = { params: Promise.resolve({ id: '1' }) };

      // Act
      await PUT(mockRequest, context);

      // Assert
      expect(mockInstructorFindUnique).not.toHaveBeenCalled();
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          data: null,
          message: null,
          error: 'Missing required fields: firstName',
        },
        { status: 400 }
      );
    });

    it('無効なステータスが指定された場合に400エラーが返されること', async () => {
      // Arrange
      const requestBody = {
        lastName: '田中',
        firstName: '花子',
        status: 'INVALID_STATUS',
      };

      const mockRequest = new Request('http://localhost:3000/api/instructors/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      const context = { params: Promise.resolve({ id: '1' }) };

      // Act
      await PUT(mockRequest, context);

      // Assert
      expect(mockInstructorFindUnique).not.toHaveBeenCalled();
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          data: null,
          message: null,
          error: 'Invalid status value',
        },
        { status: 400 }
      );
    });

    it('存在しない資格IDが指定された場合に400エラーが返されること', async () => {
      // Arrange
      const requestBody = {
        lastName: '田中',
        firstName: '花子',
        certificationIds: [1, 999], // 999は存在しない
      };

      const existingInstructor = {
        id: 1,
        lastName: '山田',
        firstName: '太郎',
      };

      const existingCertifications = [
        { id: 1, name: 'スキー指導員', isActive: true },
        // id: 999 は存在しない
      ];

      mockInstructorFindUnique.mockResolvedValue(existingInstructor as never);
      mockCertificationFindMany.mockResolvedValue(existingCertifications as never);

      const mockRequest = new Request('http://localhost:3000/api/instructors/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      const context = { params: Promise.resolve({ id: '1' }) };

      // Act
      await PUT(mockRequest, context);

      // Assert
      expect(mockTransaction).not.toHaveBeenCalled();
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          data: null,
          message: null,
          error: 'Some certification IDs are invalid or inactive',
        },
        { status: 400 }
      );
    });

    it('無効なID形式が指定された場合に400エラーが返されること', async () => {
      // Arrange
      const requestBody = {
        lastName: '田中',
        firstName: '花子',
      };

      const mockRequest = new Request('http://localhost:3000/api/instructors/invalid', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      const context = { params: Promise.resolve({ id: 'invalid' }) };

      // Act
      await PUT(mockRequest, context);

      // Assert
      expect(mockInstructorFindUnique).not.toHaveBeenCalled();
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          data: null,
          message: null,
          error: 'Invalid ID format',
        },
        { status: 400 }
      );
    });

    it('データベースエラーが発生した場合に500エラーが返されること', async () => {
      // Arrange
      const requestBody = {
        lastName: '田中',
        firstName: '花子',
      };

      const mockError = new Error('Database connection failed');
      mockInstructorFindUnique.mockRejectedValue(mockError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockRequest = new Request('http://localhost:3000/api/instructors/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      const context = { params: Promise.resolve({ id: '1' }) };

      // Act
      await PUT(mockRequest, context);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Instructor API error:', mockError);
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

  describe('トランザクション処理', () => {
    it('資格更新時にトランザクション内で既存資格削除と新規作成が行われること', async () => {
      // Arrange
      const requestBody = {
        lastName: '田中',
        firstName: '花子',
        certificationIds: [1, 2],
      };

      const existingInstructor = {
        id: 1,
        lastName: '山田',
        firstName: '太郎',
      };

      const existingCertifications = [
        { id: 1, name: 'スキー指導員', isActive: true },
        { id: 2, name: 'スキー準指導員', isActive: true },
      ];

      const updatedInstructor: InstructorWithCertifications = {
        id: 1,
        lastName: '田中',
        firstName: '花子',
        lastNameKana: null,
        firstNameKana: null,
        status: 'ACTIVE' as InstructorStatus,
        notes: null,
        createdAt: new Date('2024-01-01T00:00:00.000Z'),
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
        certifications: [],
      };

      mockInstructorFindUnique.mockResolvedValue(existingInstructor as never);
      mockCertificationFindMany.mockResolvedValue(existingCertifications as never);

      let transactionCallback: unknown;
      mockTransaction.mockImplementation(async (callback) => {
        transactionCallback = callback;
        return await callback({
          instructor: {
            update: mockInstructorUpdate.mockResolvedValue(updatedInstructor),
            findUnique: jest.fn().mockResolvedValue(updatedInstructor),
          },
          instructorCertification: {
            deleteMany: mockInstructorCertificationDeleteMany,
            createMany: mockInstructorCertificationCreateMany,
          },
        } as never);
      });

      const mockRequest = new Request('http://localhost:3000/api/instructors/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      const context = { params: Promise.resolve({ id: '1' }) };

      // Act
      await PUT(mockRequest, context);

      // Assert
      expect(mockTransaction).toHaveBeenCalledTimes(1);
      expect(typeof transactionCallback).toBe('function');
    });
  });
});
