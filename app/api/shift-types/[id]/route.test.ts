import { GET, PUT } from './route';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

// Request グローバルオブジェクトのモック
global.Request = class MockRequest {
  url: string;
  method: string;
  private _body: any;

  constructor(url: string, options?: { method?: string; body?: any }) {
    this.url = url;
    this.method = options?.method || 'GET';
    this._body = options?.body;
  }

  async json() {
    if (typeof this._body === 'string') {
      return JSON.parse(this._body);
    }
    return this._body || {};
  }
} as any;

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

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockShiftTypeFindUnique = mockPrisma.shiftType.findUnique as jest.MockedFunction<
  typeof prisma.shiftType.findUnique
>;
const mockShiftTypeUpdate = mockPrisma.shiftType.update as jest.MockedFunction<
  typeof prisma.shiftType.update
>;
const mockNextResponse = NextResponse as jest.Mocked<typeof NextResponse>;

describe('GET /api/shift-types/[id]', () => {
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
    it('シフト種類詳細データが正しく返されること', async () => {
      // Arrange
      const mockShiftType: ShiftType = {
        id: 1,
        name: 'レッスン',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockShiftTypeFindUnique.mockResolvedValue(mockShiftType);

      const mockContext = {
        params: Promise.resolve({ id: '1' }),
      };

      // Act
      await GET(new Request('http://localhost'), mockContext);

      // Assert
      expect(mockShiftTypeFindUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });

      expect(mockNextResponse.json).toHaveBeenCalledWith(mockShiftType);
    });

    it('非アクティブなシフト種類でも正しく返されること', async () => {
      // Arrange
      const mockShiftType: ShiftType = {
        id: 2,
        name: '廃止されたレッスン',
        isActive: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockShiftTypeFindUnique.mockResolvedValue(mockShiftType);

      const mockContext = {
        params: Promise.resolve({ id: '2' }),
      };

      // Act
      await GET(new Request('http://localhost'), mockContext);

      // Assert
      expect(mockNextResponse.json).toHaveBeenCalledWith(mockShiftType);
    });
  });

  describe('異常系', () => {
    it('存在しないシフト種類IDの場合は404エラーが返されること', async () => {
      // Arrange
      mockShiftTypeFindUnique.mockResolvedValue(null);

      const mockContext = {
        params: Promise.resolve({ id: '999' }),
      };

      // Act
      await GET(new Request('http://localhost'), mockContext);

      // Assert
      expect(mockShiftTypeFindUnique).toHaveBeenCalledWith({
        where: { id: 999 },
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
      await GET(new Request('http://localhost'), mockContext);

      // Assert
      expect(mockShiftTypeFindUnique).not.toHaveBeenCalled();

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
      mockShiftTypeFindUnique.mockRejectedValue(mockError);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const mockContext = {
        params: Promise.resolve({ id: '1' }),
      };

      // Act
      await GET(new Request('http://localhost'), mockContext);

      // Assert
      expect(mockShiftTypeFindUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });

      expect(consoleSpy).toHaveBeenCalledWith('ShiftTypes GET API error:', mockError);

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
      const mockShiftType: ShiftType = {
        id: 1,
        name: 'テストシフト種類',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };
      mockShiftTypeFindUnique.mockResolvedValue(mockShiftType);

      const mockContext = {
        params: Promise.resolve({ id: '1' }),
      };

      // Act
      await GET(new Request('http://localhost'), mockContext);

      // Assert
      expect(mockShiftTypeFindUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('findUniqueが1回だけ呼ばれること', async () => {
      // Arrange
      mockShiftTypeFindUnique.mockResolvedValue(null);

      const mockContext = {
        params: Promise.resolve({ id: '1' }),
      };

      // Act
      await GET(new Request('http://localhost'), mockContext);

      // Assert
      expect(mockShiftTypeFindUnique).toHaveBeenCalledTimes(1);
    });
  });
});

describe('PUT /api/shift-types/[id]', () => {
  // NextRequest.jsonをモック化
  const mockRequest = {
    json: jest.fn(),
  } as unknown as Request;

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
    it('シフト種類が正常に更新されること', async () => {
      // Arrange
      const inputData = {
        name: '更新されたレッスン',
        isActive: true,
      };

      const mockExistingShiftType: ShiftType = {
        id: 1,
        name: 'レッスン',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      const mockUpdatedShiftType: ShiftType = {
        id: 1,
        name: '更新されたレッスン',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      mockShiftTypeFindUnique.mockResolvedValue(mockExistingShiftType);
      mockShiftTypeUpdate.mockResolvedValue(mockUpdatedShiftType);
      mockRequest.json = jest.fn().mockResolvedValue(inputData);

      const mockContext = {
        params: Promise.resolve({ id: '1' }),
      };

      // Act
      await PUT(mockRequest, mockContext);

      // Assert
      expect(mockShiftTypeFindUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });

      expect(mockShiftTypeUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: inputData.name,
          isActive: inputData.isActive,
        },
      });

      expect(mockNextResponse.json).toHaveBeenCalledWith(mockUpdatedShiftType);
    });

    it('isActiveが未設定でもデフォルト値trueで更新されること', async () => {
      // Arrange
      const inputData = {
        name: '更新されたレッスン',
      };

      const mockExistingShiftType: ShiftType = {
        id: 1,
        name: 'レッスン',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      const mockUpdatedShiftType: ShiftType = {
        id: 1,
        name: '更新されたレッスン',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      mockShiftTypeFindUnique.mockResolvedValue(mockExistingShiftType);
      mockShiftTypeUpdate.mockResolvedValue(mockUpdatedShiftType);
      mockRequest.json = jest.fn().mockResolvedValue(inputData);

      const mockContext = {
        params: Promise.resolve({ id: '1' }),
      };

      // Act
      await PUT(mockRequest, mockContext);

      // Assert
      expect(mockShiftTypeUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: inputData.name,
          isActive: true,
        },
      });

      expect(mockNextResponse.json).toHaveBeenCalledWith(mockUpdatedShiftType);
    });

    it('isActive=falseで更新されること', async () => {
      // Arrange
      const inputData = {
        name: '廃止されたレッスン',
        isActive: false,
      };

      const mockExistingShiftType: ShiftType = {
        id: 1,
        name: 'レッスン',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      const mockUpdatedShiftType: ShiftType = {
        id: 1,
        name: '廃止されたレッスン',
        isActive: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      mockShiftTypeFindUnique.mockResolvedValue(mockExistingShiftType);
      mockShiftTypeUpdate.mockResolvedValue(mockUpdatedShiftType);
      mockRequest.json = jest.fn().mockResolvedValue(inputData);

      const mockContext = {
        params: Promise.resolve({ id: '1' }),
      };

      // Act
      await PUT(mockRequest, mockContext);

      // Assert
      expect(mockShiftTypeUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: inputData.name,
          isActive: inputData.isActive,
        },
      });

      expect(mockNextResponse.json).toHaveBeenCalledWith(mockUpdatedShiftType);
    });
  });

  describe('異常系', () => {
    it('存在しないシフト種類IDの場合は404エラーが返されること', async () => {
      // Arrange
      const inputData = {
        name: 'テストシフト種類',
      };

      mockShiftTypeFindUnique.mockResolvedValue(null);
      mockRequest.json = jest.fn().mockResolvedValue(inputData);

      const mockContext = {
        params: Promise.resolve({ id: '999' }),
      };

      // Act
      await PUT(mockRequest, mockContext);

      // Assert
      expect(mockShiftTypeFindUnique).toHaveBeenCalledWith({
        where: { id: 999 },
      });

      expect(mockShiftTypeUpdate).not.toHaveBeenCalled();

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
        name: 'テストシフト種類',
      };

      mockRequest.json = jest.fn().mockResolvedValue(inputData);

      const mockContext = {
        params: Promise.resolve({ id: 'invalid' }),
      };

      // Act
      await PUT(mockRequest, mockContext);

      // Assert
      expect(mockShiftTypeFindUnique).not.toHaveBeenCalled();
      expect(mockShiftTypeUpdate).not.toHaveBeenCalled();

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

    it('nameが未設定の場合は400エラーが返されること', async () => {
      // Arrange
      const inputData = {
        isActive: true,
      };

      mockRequest.json = jest.fn().mockResolvedValue(inputData);

      const mockContext = {
        params: Promise.resolve({ id: '1' }),
      };

      // Act
      await PUT(mockRequest, mockContext);

      // Assert
      expect(mockShiftTypeFindUnique).not.toHaveBeenCalled();
      expect(mockShiftTypeUpdate).not.toHaveBeenCalled();

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

      const mockContext = {
        params: Promise.resolve({ id: '1' }),
      };

      // Act
      await PUT(mockRequest, mockContext);

      // Assert
      expect(mockShiftTypeFindUnique).not.toHaveBeenCalled();
      expect(mockShiftTypeUpdate).not.toHaveBeenCalled();

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
        name: 'テストシフト種類',
      };

      const mockError = new Error('Database error');
      mockShiftTypeFindUnique.mockRejectedValue(mockError);
      mockRequest.json = jest.fn().mockResolvedValue(inputData);

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const mockContext = {
        params: Promise.resolve({ id: '1' }),
      };

      // Act
      await PUT(mockRequest, mockContext);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('ShiftTypes PUT API error:', mockError);

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
      expect(consoleSpy).toHaveBeenCalledWith('ShiftTypes PUT API error:', jsonError);

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
    it('findUniqueとupdateが正しいパラメータで呼ばれること', async () => {
      // Arrange
      const inputData = {
        name: 'テストシフト種類',
        isActive: false,
      };

      const mockExistingShiftType: ShiftType = {
        id: 1,
        name: '元のシフト種類',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      const mockUpdatedShiftType: ShiftType = {
        id: 1,
        name: 'テストシフト種類',
        isActive: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      mockShiftTypeFindUnique.mockResolvedValue(mockExistingShiftType);
      mockShiftTypeUpdate.mockResolvedValue(mockUpdatedShiftType);
      mockRequest.json = jest.fn().mockResolvedValue(inputData);

      const mockContext = {
        params: Promise.resolve({ id: '1' }),
      };

      // Act
      await PUT(mockRequest, mockContext);

      // Assert
      expect(mockShiftTypeFindUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });

      expect(mockShiftTypeUpdate).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: inputData.name,
          isActive: inputData.isActive,
        },
      });
    });

    it('findUniqueとupdateがそれぞれ1回ずつ呼ばれること', async () => {
      // Arrange
      const inputData = {
        name: 'テストシフト種類',
      };

      const mockExistingShiftType: ShiftType = {
        id: 1,
        name: '元のシフト種類',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      const mockUpdatedShiftType: ShiftType = {
        id: 1,
        name: 'テストシフト種類',
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      mockShiftTypeFindUnique.mockResolvedValue(mockExistingShiftType);
      mockShiftTypeUpdate.mockResolvedValue(mockUpdatedShiftType);
      mockRequest.json = jest.fn().mockResolvedValue(inputData);

      const mockContext = {
        params: Promise.resolve({ id: '1' }),
      };

      // Act
      await PUT(mockRequest, mockContext);

      // Assert
      expect(mockShiftTypeFindUnique).toHaveBeenCalledTimes(1);
      expect(mockShiftTypeUpdate).toHaveBeenCalledTimes(1);
    });
  });
});
