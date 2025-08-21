import { GET, POST } from './route';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { InstructorStatus } from '@prisma/client';

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

type Instructor = {
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
      findMany: jest.fn(),
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    certification: {
      findMany: jest.fn(),
    },
    instructorCertification: {
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
const mockInstructorFindMany = mockPrisma.instructor.findMany as jest.MockedFunction<
  typeof prisma.instructor.findMany
>;
const mockInstructorCreate = mockPrisma.instructor.create as jest.MockedFunction<
  typeof prisma.instructor.create
>;
const mockInstructorFindUnique = mockPrisma.instructor.findUnique as jest.MockedFunction<
  typeof prisma.instructor.findUnique
>;
const mockCertificationFindMany = mockPrisma.certification.findMany as jest.MockedFunction<
  typeof prisma.certification.findMany
>;
const mockInstructorCertificationCreateMany = mockPrisma.instructorCertification
  .createMany as jest.MockedFunction<typeof prisma.instructorCertification.createMany>;
const mockTransaction = mockPrisma.$transaction as jest.MockedFunction<typeof prisma.$transaction>;
const mockNextResponse = NextResponse as jest.Mocked<typeof NextResponse>;

describe('GET /api/instructors', () => {
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
    it('インストラクターデータが資格情報付きで正しく返されること', async () => {
      // Arrange
      const mockInstructors: Instructor[] = [
        {
          id: 1,
          lastName: '山田',
          firstName: '太郎',
          lastNameKana: 'ヤマダ',
          firstNameKana: 'タロウ',
          status: 'ACTIVE' as InstructorStatus,
          notes: null,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
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
        },
        {
          id: 2,
          lastName: '佐藤',
          firstName: '花子',
          lastNameKana: 'サトウ',
          firstNameKana: 'ハナコ',
          status: 'INACTIVE' as InstructorStatus,
          notes: 'テストメモ',
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
          certifications: [
            {
              certification: {
                id: 2,
                name: 'スノーボード指導員',
                shortName: '指導員',
                organization: 'JSBA',
                department: {
                  id: 2,
                  name: 'スノーボード',
                },
              },
            },
          ],
        },
      ];

      mockInstructorFindMany.mockResolvedValue(mockInstructors);

      const mockRequest = new Request('http://localhost:3000/api/instructors');

      // Act
      await GET(mockRequest);

      // Assert
      expect(mockInstructorFindMany).toHaveBeenCalledWith({
        where: {},
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
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      });

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: true,
          data: [
            {
              id: 1,
              lastName: '山田',
              firstName: '太郎',
              lastNameKana: 'ヤマダ',
              firstNameKana: 'タロウ',
              status: 'ACTIVE',
              notes: null,
              createdAt: new Date('2024-01-01'),
              updatedAt: new Date('2024-01-01'),
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
              ],
            },
            {
              id: 2,
              lastName: '佐藤',
              firstName: '花子',
              lastNameKana: 'サトウ',
              firstNameKana: 'ハナコ',
              status: 'INACTIVE',
              notes: 'テストメモ',
              createdAt: new Date('2024-01-02'),
              updatedAt: new Date('2024-01-02'),
              certifications: [
                {
                  id: 2,
                  name: 'スノーボード指導員',
                  shortName: '指導員',
                  organization: 'JSBA',
                  department: {
                    id: 2,
                    name: 'スノーボード',
                  },
                },
              ],
            },
          ],
          count: 2,
          message: null,
          error: null,
        },
        { status: 200 }
      );
    });

    it('statusパラメータでフィルタリングされること', async () => {
      // Arrange
      const mockInstructors: Instructor[] = [
        {
          id: 1,
          lastName: '山田',
          firstName: '太郎',
          lastNameKana: 'ヤマダ',
          firstNameKana: 'タロウ',
          status: 'ACTIVE' as InstructorStatus,
          notes: null,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          certifications: [],
        },
      ];

      mockInstructorFindMany.mockResolvedValue(mockInstructors);

      const mockRequest = new Request('http://localhost:3000/api/instructors?status=ACTIVE');

      // Act
      await GET(mockRequest);

      // Assert
      expect(mockInstructorFindMany).toHaveBeenCalledWith({
        where: { status: 'ACTIVE' },
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
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      });
    });

    it('インストラクターデータが空の場合でも正しく処理されること', async () => {
      // Arrange
      const mockInstructors: Instructor[] = [];
      mockInstructorFindMany.mockResolvedValue(mockInstructors);

      const mockRequest = new Request('http://localhost:3000/api/instructors');

      // Act
      await GET(mockRequest);

      // Assert
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: true,
          data: [],
          count: 0,
          message: null,
          error: null,
        },
        { status: 200 }
      );
    });
  });

  describe('異常系', () => {
    it('無効なstatusパラメータでバリデーションエラーが返されること', async () => {
      // Arrange
      const mockRequest = new Request('http://localhost:3000/api/instructors?status=INVALID');

      // Act
      await GET(mockRequest);

      // Assert
      expect(mockInstructorFindMany).not.toHaveBeenCalled();
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          data: null,
          message: null,
          error: 'Validation failed: status must be one of: ACTIVE, INACTIVE, RETIRED',
        },
        { status: 400 }
      );
    });

    it('データベースエラーが発生した場合に500エラーが返されること', async () => {
      // Arrange
      const mockError = new Error('Database connection failed');
      mockInstructorFindMany.mockRejectedValue(mockError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockRequest = new Request('http://localhost:3000/api/instructors');

      // Act
      await GET(mockRequest);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        'API Internal Error:',
        expect.objectContaining({
          message: 'GET /api/instructors: Database connection failed',
          context: 'GET /api/instructors',
          timestamp: expect.any(String),
          stack: expect.any(String),
        })
      );

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
    it('インストラクターデータが姓名順（昇順）でソートされて取得されること', async () => {
      // Arrange
      mockInstructorFindMany.mockResolvedValue([]);
      const mockRequest = new Request('http://localhost:3000/api/instructors');

      // Act
      await GET(mockRequest);

      // Assert
      expect(mockInstructorFindMany).toHaveBeenCalledWith({
        where: {},
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
        orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      });
    });

    it('findManyが1回だけ呼ばれること', async () => {
      // Arrange
      mockInstructorFindMany.mockResolvedValue([]);
      const mockRequest = new Request('http://localhost:3000/api/instructors');

      // Act
      await GET(mockRequest);

      // Assert
      expect(mockInstructorFindMany).toHaveBeenCalledTimes(1);
    });

    it('資格情報が適切にincludeされていること', async () => {
      // Arrange
      mockInstructorFindMany.mockResolvedValue([]);
      const mockRequest = new Request('http://localhost:3000/api/instructors');

      // Act
      await GET(mockRequest);

      // Assert
      expect(mockInstructorFindMany).toHaveBeenCalledWith(
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
  });
});

describe('POST /api/instructors', () => {
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
    it('必須項目のみでインストラクターが作成されること', async () => {
      // Arrange
      const requestBody = {
        lastName: '山田',
        firstName: '太郎',
        lastNameKana: 'ヤマダ',
        firstNameKana: 'タロウ',
        status: 'ACTIVE',
        notes: '',
        certificationIds: [],
      };

      const mockCreatedInstructor = {
        id: 1,
        lastName: '山田',
        firstName: '太郎',
        lastNameKana: 'ヤマダ',
        firstNameKana: 'タロウ',
        status: 'ACTIVE' as InstructorStatus,
        notes: '',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      const mockInstructorWithCertifications = {
        ...mockCreatedInstructor,
        certifications: [],
      };

      // certification.findManyのモック設定（空配列の場合）
      mockCertificationFindMany.mockResolvedValue([]);

      mockTransaction.mockImplementation(async (callback) => {
        return callback({
          instructor: {
            create: mockInstructorCreate.mockResolvedValue(mockCreatedInstructor),
            findUnique: mockInstructorFindUnique.mockResolvedValue(
              mockInstructorWithCertifications
            ),
          },
          instructorCertification: {
            createMany: mockInstructorCertificationCreateMany,
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
      });

      const mockRequest = new Request('http://localhost:3000/api/instructors', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      // Act
      await POST(mockRequest);

      // Assert
      expect(mockTransaction).toHaveBeenCalledTimes(1);
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: true,
          data: {
            id: 1,
            lastName: '山田',
            firstName: '太郎',
            lastNameKana: 'ヤマダ',
            firstNameKana: 'タロウ',
            status: 'ACTIVE',
            notes: '',
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
            certifications: [],
          },
          message: 'Instructor operation completed successfully',
          error: null,
        },
        { status: 201 }
      );
    });

    it('全項目を指定してインストラクターが作成されること', async () => {
      // Arrange
      const requestBody = {
        lastName: '佐藤',
        firstName: '花子',
        lastNameKana: 'サトウ',
        firstNameKana: 'ハナコ',
        status: 'INACTIVE',
        notes: 'テストメモ',
        certificationIds: [1, 2],
      };

      const mockCreatedInstructor = {
        id: 2,
        lastName: '佐藤',
        firstName: '花子',
        lastNameKana: 'サトウ',
        firstNameKana: 'ハナコ',
        status: 'INACTIVE' as InstructorStatus,
        notes: 'テストメモ',
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      };

      const mockInstructorWithCertifications = {
        ...mockCreatedInstructor,
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
              name: 'スノーボード指導員',
              shortName: '指導員',
              organization: 'JSBA',
              department: {
                id: 2,
                name: 'スノーボード',
              },
            },
          },
        ],
      };

      const mockExistingCertifications = [
        { id: 1, name: 'スキー指導員', isActive: true },
        { id: 2, name: 'スノーボード指導員', isActive: true },
      ];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockCertificationFindMany.mockResolvedValue(mockExistingCertifications as any);
      mockTransaction.mockImplementation(async (callback) => {
        return callback({
          instructor: {
            create: mockInstructorCreate.mockResolvedValue(mockCreatedInstructor),
            findUnique: mockInstructorFindUnique.mockResolvedValue(
              mockInstructorWithCertifications
            ),
          },
          instructorCertification: {
            createMany: mockInstructorCertificationCreateMany.mockResolvedValue({ count: 2 }),
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
      });

      const mockRequest = new Request('http://localhost:3000/api/instructors', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      // Act
      await POST(mockRequest);

      // Assert
      expect(mockCertificationFindMany).toHaveBeenCalledWith({
        where: {
          id: { in: [1, 2] },
          isActive: true,
        },
      });

      expect(mockTransaction).toHaveBeenCalledTimes(1);

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: true,
          data: {
            id: 2,
            lastName: '佐藤',
            firstName: '花子',
            lastNameKana: 'サトウ',
            firstNameKana: 'ハナコ',
            status: 'INACTIVE',
            notes: 'テストメモ',
            createdAt: new Date('2024-01-02'),
            updatedAt: new Date('2024-01-02'),
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
                name: 'スノーボード指導員',
                shortName: '指導員',
                organization: 'JSBA',
                department: {
                  id: 2,
                  name: 'スノーボード',
                },
              },
            ],
          },
          message: 'Instructor operation completed successfully',
          error: null,
        },
        { status: 201 }
      );
    });
  });

  describe('異常系', () => {
    it('必須フィールドが不足している場合に400エラーが返されること', async () => {
      // Arrange
      const requestBody = {
        firstName: '太郎',
        // lastName が不足
      };

      const mockRequest = new Request('http://localhost:3000/api/instructors', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      // Act
      await POST(mockRequest);

      // Assert
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          data: null,
          message: null,
          error: expect.stringContaining('lastName is required'),
        },
        { status: 400 }
      );
    });

    it('無効なstatusが指定された場合に400エラーが返されること', async () => {
      // Arrange
      const requestBody = {
        lastName: '山田',
        firstName: '太郎',
        status: 'INVALID_STATUS',
      };

      const mockRequest = new Request('http://localhost:3000/api/instructors', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      // Act
      await POST(mockRequest);

      // Assert
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          data: null,
          message: null,
          error: expect.stringContaining('status must be one of: ACTIVE, INACTIVE, RETIRED'),
        },
        { status: 400 }
      );
    });

    it('存在しない資格IDが指定された場合に400エラーが返されること', async () => {
      // Arrange
      const requestBody = {
        lastName: '山田',
        firstName: '太郎',
        lastNameKana: 'ヤマダ',
        firstNameKana: 'タロウ',
        status: 'ACTIVE',
        notes: '',
        certificationIds: [1, 2, 999],
      };

      // IDが1と2の資格のみ存在する場合
      const mockExistingCertifications = [
        { id: 1, name: 'スキー指導員', isActive: true },
        { id: 2, name: 'スノーボード指導員', isActive: true },
      ];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockCertificationFindMany.mockResolvedValue(mockExistingCertifications as any);

      const mockRequest = new Request('http://localhost:3000/api/instructors', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      // Act
      await POST(mockRequest);

      // Assert
      expect(mockCertificationFindMany).toHaveBeenCalledWith({
        where: {
          id: { in: [1, 2, 999] },
          isActive: true,
        },
      });

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

    it('非アクティブな資格IDが指定された場合に400エラーが返されること', async () => {
      // Arrange
      const requestBody = {
        lastName: '山田',
        firstName: '太郎',
        lastNameKana: 'ヤマダ',
        firstNameKana: 'タロウ',
        status: 'ACTIVE',
        notes: '',
        certificationIds: [1],
      };

      // 指定した資格が非アクティブな場合
      const mockExistingCertifications: Array<{ id: number; name: string; isActive: boolean }> = [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockCertificationFindMany.mockResolvedValue(mockExistingCertifications as any);

      const mockRequest = new Request('http://localhost:3000/api/instructors', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      // Act
      await POST(mockRequest);

      // Assert
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

    it('データベースエラーが発生した場合に500エラーが返されること', async () => {
      // Arrange
      const requestBody = {
        lastName: '山田',
        firstName: '太郎',
        lastNameKana: 'ヤマダ',
        firstNameKana: 'タロウ',
        status: 'ACTIVE',
        notes: '',
        certificationIds: [],
      };

      const mockError = new Error('Database connection failed');
      mockTransaction.mockRejectedValue(mockError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockRequest = new Request('http://localhost:3000/api/instructors', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      // Act
      await POST(mockRequest);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        'API Internal Error:',
        expect.objectContaining({
          message: 'POST /api/instructors: Database connection failed',
          context: 'POST /api/instructors',
          timestamp: expect.any(String),
          stack: expect.any(String),
        })
      );

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

    it('JSONパースエラーが発生した場合に500エラーが返されること', async () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockRequest = new Request('http://localhost:3000/api/instructors', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      });

      // Act
      await POST(mockRequest);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        'API Internal Error:',
        expect.objectContaining({
          message: expect.stringContaining('POST /api/instructors:'),
          context: 'POST /api/instructors',
          timestamp: expect.any(String),
        })
      );

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

  describe('バリデーション', () => {
    it('複数の必須フィールドが不足している場合にすべて報告されること', async () => {
      // Arrange
      const requestBody = {
        notes: 'メモのみ',
        // lastName, firstName が不足
      };

      const mockRequest = new Request('http://localhost:3000/api/instructors', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      // Act
      await POST(mockRequest);

      // Assert
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          data: null,
          message: null,
          error: expect.stringMatching(/lastName is required.*firstName is required/),
        },
        { status: 400 }
      );
    });

    it('certificationIdsが配列でない場合にバリデーションエラーが返されること', async () => {
      // Arrange
      const requestBody = {
        lastName: '山田',
        firstName: '太郎',
        certificationIds: 'not-array',
      };

      const mockRequest = new Request('http://localhost:3000/api/instructors', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      // Act
      await POST(mockRequest);

      // Assert
      expect(mockCertificationFindMany).not.toHaveBeenCalled();
      expect(mockTransaction).not.toHaveBeenCalled();
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          data: null,
          message: null,
          error: expect.stringContaining('certificationIds must be an array'),
        },
        { status: 400 }
      );
    });

    it('有効なstatus値（ACTIVE, INACTIVE, RETIRED）が受け入れられること', async () => {
      // Arrange
      const statuses = ['ACTIVE', 'INACTIVE', 'RETIRED'];

      for (const status of statuses) {
        jest.clearAllMocks();

        const requestBody = {
          lastName: '山田',
          firstName: '太郎',
          lastNameKana: 'ヤマダ',
          firstNameKana: 'タロウ',
          status,
          notes: '',
          certificationIds: [],
        };

        const mockCreatedInstructor = {
          id: 1,
          lastName: '山田',
          firstName: '太郎',
          lastNameKana: 'ヤマダ',
          firstNameKana: 'タロウ',
          status: status as InstructorStatus,
          notes: '',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        };

        const mockInstructorWithCertifications = {
          ...mockCreatedInstructor,
          certifications: [],
        };

        mockTransaction.mockImplementation(async (callback) => {
          const mockTx = {
            instructor: {
              create: jest.fn().mockResolvedValue(mockCreatedInstructor),
              findUnique: jest.fn().mockResolvedValue(mockInstructorWithCertifications),
            },
            instructorCertification: {
              createMany: jest.fn(),
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any;
          return await callback(mockTx);
        });

        mockNextResponse.json.mockImplementation((data, init) => {
          return {
            status: init?.status || 200,
          } as unknown as NextResponse;
        });

        const mockRequest = new Request('http://localhost:3000/api/instructors', {
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: { 'Content-Type': 'application/json' },
        });

        // Act
        await POST(mockRequest);

        // Assert
        expect(mockTransaction).toHaveBeenCalledTimes(1);
        expect(mockNextResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: true,
            data: expect.objectContaining({
              status,
            }),
          }),
          { status: 201 }
        );
      }
    });
  });

  describe('トランザクション処理', () => {
    it('インストラクター作成と資格関連付けがトランザクション内で実行されること', async () => {
      // Arrange
      const requestBody = {
        lastName: '田中',
        firstName: '次郎',
        lastNameKana: 'タナカ',
        firstNameKana: 'ジロウ',
        status: 'ACTIVE',
        notes: '',
        certificationIds: [1],
      };

      const mockCreatedInstructor = {
        id: 3,
        lastName: '田中',
        firstName: '次郎',
        lastNameKana: 'タナカ',
        firstNameKana: 'ジロウ',
        status: 'ACTIVE' as InstructorStatus,
        notes: '',
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03'),
      };

      const mockInstructorWithCertifications = {
        ...mockCreatedInstructor,
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

      const mockExistingCertifications = [{ id: 1, name: 'スキー指導員', isActive: true }];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockCertificationFindMany.mockResolvedValue(mockExistingCertifications as any);

      let txInstructorCreate: jest.MockedFunction<typeof prisma.instructor.create>;
      let txInstructorCertificationCreateMany: jest.MockedFunction<
        typeof prisma.instructorCertification.createMany
      >;
      let txInstructorFindUnique: jest.MockedFunction<typeof prisma.instructor.findUnique>;

      mockTransaction.mockImplementation(async (callback) => {
        txInstructorCreate = jest.fn().mockResolvedValue(mockCreatedInstructor);
        txInstructorCertificationCreateMany = jest.fn().mockResolvedValue({ count: 1 });
        txInstructorFindUnique = jest.fn().mockResolvedValue(mockInstructorWithCertifications);

        const mockTx = {
          instructor: {
            create: txInstructorCreate,
            findUnique: txInstructorFindUnique,
          },
          instructorCertification: {
            createMany: txInstructorCertificationCreateMany,
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
        return await callback(mockTx);
      });

      const mockRequest = new Request('http://localhost:3000/api/instructors', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });

      // Act
      await POST(mockRequest);

      // Assert
      expect(mockTransaction).toHaveBeenCalledTimes(1);
      expect(mockTransaction).toHaveBeenCalledWith(expect.any(Function));
    });
  });
});
