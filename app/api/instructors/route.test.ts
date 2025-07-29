import { GET } from './route'
import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'
import { InstructorStatus } from '@prisma/client'

type Instructor = {
  id: number
  lastName: string
  firstName: string
  lastNameKana: string | null
  firstNameKana: string | null
  status: InstructorStatus
  notes: string | null
  createdAt: Date
  updatedAt: Date
  certifications: {
    certification: {
      id: number
      name: string
      shortName: string | null
      organization: string
      department: {
        id: number
        name: string
      }
    }
  }[]
}

// Prismaクライアントをモック化
jest.mock('@/lib/db', () => ({
  prisma: {
    instructor: {
      findMany: jest.fn(),
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
const mockInstructorFindMany = mockPrisma.instructor.findMany as jest.MockedFunction<typeof prisma.instructor.findMany>
const mockNextResponse = NextResponse as jest.Mocked<typeof NextResponse>

describe('GET /api/instructors', () => {
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
                  name: 'スキー'
                }
              }
            }
          ]
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
                  name: 'スノーボード'
                }
              }
            }
          ]
        }
      ]

      mockInstructorFindMany.mockResolvedValue(mockInstructors)

      const mockRequest = new Request('http://localhost:3000/api/instructors')

      // Act
      await GET(mockRequest)

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
                      name: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' }
        ]
      })

      expect(mockNextResponse.json).toHaveBeenCalledWith({
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
                  name: 'スキー'
                }
              }
            ]
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
                  name: 'スノーボード'
                }
              }
            ]
          }
        ],
        count: 2,
        message: null,
        error: null
      })
    })

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
          certifications: []
        }
      ]

      mockInstructorFindMany.mockResolvedValue(mockInstructors)

      const mockRequest = new Request('http://localhost:3000/api/instructors?status=ACTIVE')

      // Act
      await GET(mockRequest)

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
                      name: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' }
        ]
      })
    })

    it('無効なstatusパラメータは無視されること', async () => {
      // Arrange
      const mockInstructors: Instructor[] = []
      mockInstructorFindMany.mockResolvedValue(mockInstructors)

      const mockRequest = new Request('http://localhost:3000/api/instructors?status=INVALID')

      // Act
      await GET(mockRequest)

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
                      name: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' }
        ]
      })
    })

    it('インストラクターデータが空の場合でも正しく処理されること', async () => {
      // Arrange
      const mockInstructors: Instructor[] = []
      mockInstructorFindMany.mockResolvedValue(mockInstructors)

      const mockRequest = new Request('http://localhost:3000/api/instructors')

      // Act
      await GET(mockRequest)

      // Assert
      expect(mockNextResponse.json).toHaveBeenCalledWith({
        success: true,
        data: [],
        count: 0,
        message: null,
        error: null
      })
    })
  })

  describe('異常系', () => {
    it('データベースエラーが発生した場合に500エラーが返されること', async () => {
      // Arrange
      const mockError = new Error('Database connection failed')
      mockInstructorFindMany.mockRejectedValue(mockError)
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const mockRequest = new Request('http://localhost:3000/api/instructors')

      // Act
      await GET(mockRequest)

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('Instructors API error:', mockError)

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
    it('インストラクターデータが姓名順（昇順）でソートされて取得されること', async () => {
      // Arrange
      mockInstructorFindMany.mockResolvedValue([])
      const mockRequest = new Request('http://localhost:3000/api/instructors')

      // Act
      await GET(mockRequest)

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
                      name: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: [
          { lastName: 'asc' },
          { firstName: 'asc' }
        ]
      })
    })

    it('findManyが1回だけ呼ばれること', async () => {
      // Arrange
      mockInstructorFindMany.mockResolvedValue([])
      const mockRequest = new Request('http://localhost:3000/api/instructors')

      // Act
      await GET(mockRequest)

      // Assert
      expect(mockInstructorFindMany).toHaveBeenCalledTimes(1)
    })

    it('資格情報が適切にincludeされていること', async () => {
      // Arrange
      mockInstructorFindMany.mockResolvedValue([])
      const mockRequest = new Request('http://localhost:3000/api/instructors')

      // Act
      await GET(mockRequest)

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
                        name: true
                      }
                    }
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