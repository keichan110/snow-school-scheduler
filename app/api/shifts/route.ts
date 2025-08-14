import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const departmentId = searchParams.get('departmentId')
    const shiftTypeId = searchParams.get('shiftTypeId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // フィルター条件を構築
    const where: {
      departmentId?: number
      shiftTypeId?: number
      date?: {
        gte?: Date
        lte?: Date
      }
    } = {}

    if (departmentId) {
      where.departmentId = parseInt(departmentId)
    }

    if (shiftTypeId) {
      where.shiftTypeId = parseInt(shiftTypeId)
    }

    if (dateFrom || dateTo) {
      where.date = {}
      if (dateFrom) {
        where.date.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.date.lte = new Date(dateTo)
      }
    }

    const shifts = await prisma.shift.findMany({
      where,
      include: {
        department: true,
        shiftType: true,
        shiftAssignments: {
          include: {
            instructor: true
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { departmentId: 'asc' },
        { shiftTypeId: 'asc' }
      ]
    })

    // ShiftWithStats形式に変換
    const shiftsWithStats = shifts.map(shift => ({
      id: shift.id,
      date: shift.date.toISOString().split('T')[0], // date形式
      departmentId: shift.departmentId,
      shiftTypeId: shift.shiftTypeId,
      description: shift.description,
      createdAt: shift.createdAt.toISOString(),
      updatedAt: shift.updatedAt.toISOString(),
      department: shift.department,
      shiftType: shift.shiftType,
      assignments: shift.shiftAssignments.map(assignment => ({
        id: assignment.id,
        shiftId: assignment.shiftId,
        instructorId: assignment.instructorId,
        assignedAt: assignment.assignedAt.toISOString(),
        instructor: {
          id: assignment.instructor.id,
          lastName: assignment.instructor.lastName,
          firstName: assignment.instructor.firstName,
          status: assignment.instructor.status
        }
      })),
      assignedCount: shift.shiftAssignments.length
    }))

    return NextResponse.json({
      success: true,
      data: shiftsWithStats,
      count: shiftsWithStats.length,
      message: null,
      error: null
    })
  } catch (error) {
    console.error('Shifts API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        data: null,
        message: null,
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, departmentId, shiftTypeId, description, assignedInstructorIds = [] } = body

    // バリデーション
    if (!date || !departmentId || !shiftTypeId) {
      return NextResponse.json(
        { 
          success: false, 
          data: null,
          message: null,
          error: 'Required fields: date, departmentId, shiftTypeId' 
        },
        { status: 400 }
      )
    }

    // トランザクションでシフトと割り当てを同時作成
    const result = await prisma.$transaction(async (tx) => {
      // シフト作成
      const shift = await tx.shift.create({
        data: {
          date: new Date(date),
          departmentId: parseInt(departmentId),
          shiftTypeId: parseInt(shiftTypeId),
          description: description || null
        },
        include: {
          department: true,
          shiftType: true
        }
      })

      // インストラクター割り当て
      const assignmentPromises = assignedInstructorIds.map((instructorId: number) =>
        tx.shiftAssignment.create({
          data: {
            shiftId: shift.id,
            instructorId
          },
          include: {
            instructor: true
          }
        })
      )

      const assignments = await Promise.all(assignmentPromises)

      return { shift, assignments }
    })

    // レスポンス用データを整形
    const shiftWithStats = {
      id: result.shift.id,
      date: result.shift.date.toISOString().split('T')[0],
      departmentId: result.shift.departmentId,
      shiftTypeId: result.shift.shiftTypeId,
      description: result.shift.description,
      createdAt: result.shift.createdAt.toISOString(),
      updatedAt: result.shift.updatedAt.toISOString(),
      department: result.shift.department,
      shiftType: result.shift.shiftType,
      assignments: result.assignments.map(assignment => ({
        id: assignment.id,
        shiftId: assignment.shiftId,
        instructorId: assignment.instructorId,
        assignedAt: assignment.assignedAt.toISOString(),
        instructor: {
          id: assignment.instructor.id,
          lastName: assignment.instructor.lastName,
          firstName: assignment.instructor.firstName,
          status: assignment.instructor.status
        }
      })),
      assignedCount: result.assignments.length
    }

    return NextResponse.json(
      {
        success: true,
        data: shiftWithStats,
        message: 'Shift operation completed successfully',
        error: null
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Shift creation error:', error)
    return NextResponse.json(
      { 
        success: false, 
        data: null,
        message: null,
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}