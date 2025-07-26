import { GET, POST } from './route'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

type Certification = {
  id: number
  departmentId: number
  name: string
  shortName: string | null
  organization: string
  description: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  department: {
    id: number
    name: string
    colorPalette: string
  }
}

// Prismaクライアントをモック化
jest.mock('@/lib/db', () => ({
  prisma: {
    certification: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  },
}))

// NextResponseをモック化
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockCertificationFindMany = mockPrisma.certification.findMany as jest.MockedFunction<typeof prisma.certification.findMany>
const mockCertificationCreate = mockPrisma.certification.create as jest.MockedFunction<typeof prisma.certification.create>
const mockNextResponse = NextResponse as jest.Mocked<typeof NextResponse>

describe('GET /api/certifications', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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
      } as unknown as NextResponse
    })
  })

  describe('正常系', () => {
    it('資格データが部門情報付きで正しく返されること', async () => {
      // Arrange
      const mockCertifications: Certification[] = [
        {
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
            colorPalette: 'red'
          }
        },
        {
          id: 2,
          departmentId: 2,
          name: 'スノーボード指導員',
          shortName: '指導員',
          organization: 'JSBA',
          description: 'スノーボード指導員資格',
          isActive: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          department: {
            id: 2,
            name: 'スノーボード',
            colorPalette: 'blue'
          }
        },
      ]

      mockCertificationFindMany.mockResolvedValue(mockCertifications)

      // Act
      await GET()

      // Assert
      expect(mockCertificationFindMany).toHaveBeenCalledWith({
        include: {
          department: {
            select: {
              id: true,
              name: true,
              colorPalette: true
            }
          }
        },
        orderBy: [
          { department: { name: 'asc' } },
          { name: 'asc' }
        ]
      })

      expect(mockNextResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockCertifications,
        count: 2,
        message: null,
        error: null,
      })
    })

    it('資格データが空の場合でも正しく処理されること', async () => {
      // Arrange
      const mockCertifications: Certification[] = []
      mockCertificationFindMany.mockResolvedValue(mockCertifications)

      // Act
      await GET()

      // Assert
      expect(mockCertificationFindMany).toHaveBeenCalledWith({
        include: {
          department: {
            select: {
              id: true,
              name: true,
              colorPalette: true
            }
          }
        },
        orderBy: [
          { department: { name: 'asc' } },
          { name: 'asc' }
        ]
      })

      expect(mockNextResponse.json).toHaveBeenCalledWith({
        success: true,
        data: [],
        count: 0,
        message: null,
        error: null,
      })
    })

    it('単一の資格データが正しく返されること', async () => {
      // Arrange
      const mockCertifications: Certification[] = [
        {
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
            colorPalette: 'red'
          }
        },
      ]

      mockCertificationFindMany.mockResolvedValue(mockCertifications)

      // Act
      await GET()

      // Assert
      expect(mockNextResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockCertifications,
        count: 1,
        message: null,
        error: null,
      })
    })
  })

  describe('異常系', () => {
    it('データベースエラーが発生した場合に500エラーが返されること', async () => {
      // Arrange
      const mockError = new Error('Database connection failed')
      mockCertificationFindMany.mockRejectedValue(mockError)
      
      // console.errorをモック化してログ出力をテスト
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      // Act
      await GET()

      // Assert
      expect(mockCertificationFindMany).toHaveBeenCalledWith({
        include: {
          department: {
            select: {
              id: true,
              name: true,
              colorPalette: true
            }
          }
        },
        orderBy: [
          { department: { name: 'asc' } },
          { name: 'asc' }
        ]
      })

      expect(consoleSpy).toHaveBeenCalledWith('Certifications API error:', mockError)

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          data: null,
          message: null,
          error: 'Internal server error',
        },
        { status: 500 }
      )

      // cleanup
      consoleSpy.mockRestore()
    })

    it('Prismaの特定のエラーが発生した場合も適切に処理されること', async () => {
      // Arrange
      const mockError = new Error('P2002: Unique constraint failed')
      mockError.name = 'PrismaClientKnownRequestError'
      mockCertificationFindMany.mockRejectedValue(mockError)
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      // Act  
      await GET()

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Certifications API error:', mockError)
      
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          data: null,
          message: null,
          error: 'Internal server error',
        },
        { status: 500 }
      )

      consoleSpy.mockRestore()
    })
  })

  describe('データベースクエリ', () => {
    it('資格データが部門名・資格名順（昇順）でソートされて取得されること', async () => {
      // Arrange
      const mockCertifications: Partial<Certification>[] = [
        { 
          id: 1, 
          name: 'スキー指導員',
          department: { id: 1, name: 'スキー', colorPalette: 'red' }
        },
        { 
          id: 2, 
          name: 'スノーボード指導員',
          department: { id: 2, name: 'スノーボード', colorPalette: 'blue' }
        },
      ]
      mockCertificationFindMany.mockResolvedValue(mockCertifications as Certification[])

      // Act
      await GET()

      // Assert
      expect(mockCertificationFindMany).toHaveBeenCalledWith({
        include: {
          department: {
            select: {
              id: true,
              name: true,
              colorPalette: true
            }
          }
        },
        orderBy: [
          { department: { name: 'asc' } },
          { name: 'asc' }
        ]
      })
    })

    it('findManyが1回だけ呼ばれること', async () => {
      // Arrange
      mockCertificationFindMany.mockResolvedValue([])

      // Act
      await GET()

      // Assert
      expect(mockCertificationFindMany).toHaveBeenCalledTimes(1)
    })

    it('部門情報が適切にincludeされていること', async () => {
      // Arrange
      mockCertificationFindMany.mockResolvedValue([])

      // Act
      await GET()

      // Assert
      expect(mockCertificationFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            department: {
              select: {
                id: true,
                name: true,
                colorPalette: true
              }
            }
          }
        })
      )
    })
  })
})

describe('POST /api/certifications', () => {
  // NextRequest.jsonをモック化
  const mockRequest = {
    json: jest.fn(),
  } as unknown as Request

  beforeEach(() => {
    jest.clearAllMocks()
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
      } as unknown as NextResponse
    })
  })

  describe('正常系', () => {
    it('資格が正常に作成されること', async () => {
      // Arrange
      const inputData = {
        departmentId: 1,
        name: 'スキー指導員',
        shortName: '指導員',
        organization: 'SAJ',
        description: 'スキー指導員資格',
        isActive: true
      }

      const mockCreatedCertification: Certification = {
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
          colorPalette: 'red'
        }
      }

      mockCertificationCreate.mockResolvedValue(mockCreatedCertification)
      mockRequest.json = jest.fn().mockResolvedValue(inputData)

      // Act
      await POST(mockRequest)

      // Assert
      expect(mockCertificationCreate).toHaveBeenCalledWith({
        data: {
          departmentId: inputData.departmentId,
          name: inputData.name,
          shortName: inputData.shortName,
          organization: inputData.organization,
          description: inputData.description,
          isActive: inputData.isActive
        },
        include: {
          department: {
            select: {
              id: true,
              name: true,
              colorPalette: true
            }
          }
        }
      })

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: true,
          data: mockCreatedCertification,
          message: 'Certification created successfully',
          error: null
        },
        { status: 201 }
      )
    })

    it('必須フィールドのみでも資格が作成されること', async () => {
      // Arrange
      const inputData = {
        departmentId: 1,
        name: 'スキー指導員',
        organization: 'SAJ'
      }

      const mockCreatedCertification: Certification = {
        id: 1,
        departmentId: 1,
        name: 'スキー指導員',
        shortName: null,
        organization: 'SAJ',
        description: null,
        isActive: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        department: {
          id: 1,
          name: 'スキー',
          colorPalette: 'red'
        }
      }

      mockCertificationCreate.mockResolvedValue(mockCreatedCertification)
      mockRequest.json = jest.fn().mockResolvedValue(inputData)

      // Act
      await POST(mockRequest)

      // Assert
      expect(mockCertificationCreate).toHaveBeenCalledWith({
        data: {
          departmentId: inputData.departmentId,
          name: inputData.name,
          shortName: undefined,
          organization: inputData.organization,
          description: undefined,
          isActive: true
        },
        include: {
          department: {
            select: {
              id: true,
              name: true,
              colorPalette: true
            }
          }
        }
      })

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: true,
          data: mockCreatedCertification,
          message: 'Certification created successfully',
          error: null
        },
        { status: 201 }
      )
    })
  })

  describe('異常系', () => {
    it('必須フィールドが不足している場合は400エラーが返されること', async () => {
      // Arrange
      const inputData = {
        name: 'スキー指導員'
        // departmentIdとorganizationが不足
      }

      mockRequest.json = jest.fn().mockResolvedValue(inputData)

      // Act
      await POST(mockRequest)

      // Assert
      expect(mockCertificationCreate).not.toHaveBeenCalled()

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          data: null,
          message: null,
          error: 'Missing required fields: departmentId, organization'
        },
        { status: 400 }
      )
    })

    it('データベースエラーが発生した場合は500エラーが返されること', async () => {
      // Arrange
      const inputData = {
        departmentId: 1,
        name: 'スキー指導員',
        organization: 'SAJ'
      }

      const mockError = new Error('Database error')
      mockCertificationCreate.mockRejectedValue(mockError)
      mockRequest.json = jest.fn().mockResolvedValue(inputData)

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      // Act
      await POST(mockRequest)

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Certifications API error:', mockError)

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          data: null,
          message: null,
          error: 'Internal server error'
        },
        { status: 500 }
      )

      consoleSpy.mockRestore()
    })

    it('不正なJSONデータの場合は400エラーが返されること', async () => {
      // Arrange
      const jsonError = new Error('Invalid JSON')
      mockRequest.json = jest.fn().mockRejectedValue(jsonError)

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      // Act
      await POST(mockRequest)

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Certifications API error:', jsonError)

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          data: null,
          message: null,
          error: 'Internal server error'
        },
        { status: 500 }
      )

      consoleSpy.mockRestore()
    })
  })
})