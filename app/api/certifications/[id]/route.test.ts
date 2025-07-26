import { GET } from './route'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

type CertificationDetail = {
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
  instructors: Array<{
    id: number
    lastName: string
    firstName: string
    status: 'ACTIVE' | 'INACTIVE' | 'RETIRED'
  }>
}

// Prismaクライアントをモック化
jest.mock('@/lib/db', () => ({
  prisma: {
    certification: {
      findUnique: jest.fn(),
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
const mockCertificationFindUnique = mockPrisma.certification.findUnique as jest.MockedFunction<typeof prisma.certification.findUnique>
const mockNextResponse = NextResponse as jest.Mocked<typeof NextResponse>

describe('GET /api/certifications/[id]', () => {
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
    it('資格詳細データがインストラクター情報付きで正しく返されること', async () => {
      // Arrange
      const mockCertificationDetail: CertificationDetail = {
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
        },
        instructors: [
          {
            id: 1,
            lastName: '山田',
            firstName: '太郎',
            status: 'ACTIVE'
          },
          {
            id: 2,
            lastName: '鈴木',
            firstName: '花子',
            status: 'ACTIVE'
          }
        ]
      }

      mockCertificationFindUnique.mockResolvedValue(mockCertificationDetail)

      // ルートパラメータを模擬
      const mockContext = {
        params: Promise.resolve({ id: '1' })
      }

      // Act
      await GET(new Request('http://localhost'), mockContext)

      // Assert
      expect(mockCertificationFindUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          department: {
            select: {
              id: true,
              name: true,
              colorPalette: true
            }
          },
          instructorCertifications: {
            include: {
              instructor: {
                select: {
                  id: true,
                  lastName: true,
                  firstName: true,
                  status: true
                }
              }
            }
          }
        }
      })

      expect(mockNextResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockCertificationDetail,
        message: null,
        error: null
      })
    })

    it('インストラクターが関連付けられていない資格でも正しく返されること', async () => {
      // Arrange
      const mockCertificationDetail: CertificationDetail = {
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
          colorPalette: 'blue'
        },
        instructors: []
      }

      mockCertificationFindUnique.mockResolvedValue(mockCertificationDetail)

      const mockContext = {
        params: Promise.resolve({ id: '2' })
      }

      // Act
      await GET(new Request('http://localhost'), mockContext)

      // Assert
      expect(mockNextResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockCertificationDetail,
        message: null,
        error: null
      })
    })
  })

  describe('異常系', () => {
    it('存在しない資格IDの場合は404エラーが返されること', async () => {
      // Arrange
      mockCertificationFindUnique.mockResolvedValue(null)

      const mockContext = {
        params: Promise.resolve({ id: '999' })
      }

      // Act
      await GET(new Request('http://localhost'), mockContext)

      // Assert
      expect(mockCertificationFindUnique).toHaveBeenCalledWith({
        where: { id: 999 },
        include: {
          department: {
            select: {
              id: true,
              name: true,
              colorPalette: true
            }
          },
          instructorCertifications: {
            include: {
              instructor: {
                select: {
                  id: true,
                  lastName: true,
                  firstName: true,
                  status: true
                }
              }
            }
          }
        }
      })

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          data: null,
          message: null,
          error: 'Resource not found'
        },
        { status: 404 }
      )
    })

    it('不正なIDパラメータの場合は404エラーが返されること', async () => {
      // Arrange
      const mockContext = {
        params: Promise.resolve({ id: 'invalid' })
      }

      // Act
      await GET(new Request('http://localhost'), mockContext)

      // Assert
      expect(mockCertificationFindUnique).not.toHaveBeenCalled()

      expect(mockNextResponse.json).toHaveBeenCalledWith(
        {
          success: false,
          data: null,
          message: null,
          error: 'Resource not found'
        },
        { status: 404 }
      )
    })

    it('データベースエラーが発生した場合に500エラーが返されること', async () => {
      // Arrange
      const mockError = new Error('Database connection failed')
      mockCertificationFindUnique.mockRejectedValue(mockError)
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const mockContext = {
        params: Promise.resolve({ id: '1' })
      }

      // Act
      await GET(new Request('http://localhost'), mockContext)

      // Assert
      expect(mockCertificationFindUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          department: {
            select: {
              id: true,
              name: true,
              colorPalette: true
            }
          },
          instructorCertifications: {
            include: {
              instructor: {
                select: {
                  id: true,
                  lastName: true,
                  firstName: true,
                  status: true
                }
              }
            }
          }
        }
      })

      expect(consoleSpy).toHaveBeenCalledWith('Certification API error:', mockError)

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

  describe('データベースクエリ', () => {
    it('findUniqueが正しいパラメータで呼ばれること', async () => {
      // Arrange
      const mockCertificationDetail: Partial<CertificationDetail> = {
        id: 1,
        name: 'Test Certification',
        department: { id: 1, name: 'Test Dept', colorPalette: 'red' },
        instructors: []
      }
      mockCertificationFindUnique.mockResolvedValue(mockCertificationDetail as CertificationDetail)

      const mockContext = {
        params: Promise.resolve({ id: '1' })
      }

      // Act
      await GET(new Request('http://localhost'), mockContext)

      // Assert
      expect(mockCertificationFindUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          department: {
            select: {
              id: true,
              name: true,
              colorPalette: true
            }
          },
          instructorCertifications: {
            include: {
              instructor: {
                select: {
                  id: true,
                  lastName: true,
                  firstName: true,
                  status: true
                }
              }
            }
          }
        }
      })
    })

    it('findUniqueが1回だけ呼ばれること', async () => {
      // Arrange
      mockCertificationFindUnique.mockResolvedValue(null)

      const mockContext = {
        params: Promise.resolve({ id: '1' })
      }

      // Act
      await GET(new Request('http://localhost'), mockContext)

      // Assert
      expect(mockCertificationFindUnique).toHaveBeenCalledTimes(1)
    })

    it('部門情報とインストラクター情報が適切にincludeされていること', async () => {
      // Arrange
      mockCertificationFindUnique.mockResolvedValue(null)

      const mockContext = {
        params: Promise.resolve({ id: '1' })
      }

      // Act
      await GET(new Request('http://localhost'), mockContext)

      // Assert
      expect(mockCertificationFindUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            department: {
              select: {
                id: true,
                name: true,
                colorPalette: true
              }
            },
            instructorCertifications: {
              include: {
                instructor: {
                  select: {
                    id: true,
                    lastName: true,
                    firstName: true,
                    status: true
                  }
                }
              }
            }
          }
        })
      )
    })
  })
})