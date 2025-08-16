import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const departmentId = searchParams.get('departmentId');
    const shiftTypeId = searchParams.get('shiftTypeId');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    // フィルター条件を構築
    const where: {
      departmentId?: number;
      shiftTypeId?: number;
      date?: {
        gte?: Date;
        lte?: Date;
      };
    } = {};

    if (departmentId) {
      where.departmentId = parseInt(departmentId);
    }

    if (shiftTypeId) {
      where.shiftTypeId = parseInt(shiftTypeId);
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) {
        where.date.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.date.lte = new Date(dateTo);
      }
    }

    const shifts = await prisma.shift.findMany({
      where,
      include: {
        department: true,
        shiftType: true,
        shiftAssignments: {
          include: {
            instructor: true,
          },
        },
      },
      orderBy: [{ date: 'asc' }, { departmentId: 'asc' }, { shiftTypeId: 'asc' }],
    });

    // ShiftWithStats形式に変換
    const shiftsWithStats = shifts.map((shift) => ({
      id: shift.id,
      date: shift.date.toISOString().split('T')[0], // date形式
      departmentId: shift.departmentId,
      shiftTypeId: shift.shiftTypeId,
      description: shift.description,
      createdAt: shift.createdAt.toISOString(),
      updatedAt: shift.updatedAt.toISOString(),
      department: shift.department,
      shiftType: shift.shiftType,
      assignments: shift.shiftAssignments.map((assignment) => ({
        id: assignment.id,
        shiftId: assignment.shiftId,
        instructorId: assignment.instructorId,
        assignedAt: assignment.assignedAt.toISOString(),
        instructor: {
          id: assignment.instructor.id,
          lastName: assignment.instructor.lastName,
          firstName: assignment.instructor.firstName,
          status: assignment.instructor.status,
        },
      })),
      assignedCount: shift.shiftAssignments.length,
    }));

    return NextResponse.json({
      success: true,
      data: shiftsWithStats,
      count: shiftsWithStats.length,
      message: null,
      error: null,
    });
  } catch (error) {
    console.error('Shifts API error:', error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: null,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      date,
      departmentId,
      shiftTypeId,
      description,
      force = false,
      assignedInstructorIds = [],
    } = body;

    // バリデーション
    if (!date || !departmentId || !shiftTypeId) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: null,
          error: 'Required fields: date, departmentId, shiftTypeId',
        },
        { status: 400 }
      );
    }

    // 既存シフトチェック（重複検出）
    const existingShift = await prisma.shift.findUnique({
      where: {
        unique_shift_per_day: {
          date: new Date(date),
          departmentId: parseInt(departmentId),
          shiftTypeId: parseInt(shiftTypeId),
        },
      },
      include: {
        department: true,
        shiftType: true,
        shiftAssignments: {
          include: {
            instructor: true,
          },
        },
      },
    });

    // 重複チェック: force=falseかつ既存シフトがある場合
    if (existingShift && !force) {
      return NextResponse.json(
        {
          success: false,
          error: 'DUPLICATE_SHIFT',
          data: {
            existing: {
              id: existingShift.id,
              date: existingShift.date.toISOString().split('T')[0],
              departmentId: existingShift.departmentId,
              shiftTypeId: existingShift.shiftTypeId,
              description: existingShift.description,
              department: existingShift.department,
              shiftType: existingShift.shiftType,
              assignments: existingShift.shiftAssignments.map((assignment) => ({
                id: assignment.id,
                shiftId: assignment.shiftId,
                instructorId: assignment.instructorId,
                assignedAt: assignment.assignedAt.toISOString(),
                instructor: {
                  id: assignment.instructor.id,
                  lastName: assignment.instructor.lastName,
                  firstName: assignment.instructor.firstName,
                  status: assignment.instructor.status,
                },
              })),
              assignedCount: existingShift.shiftAssignments.length,
            },
            canForce: true,
            options: ['merge', 'replace', 'cancel'],
          },
          message: '同じ日付・部門・シフト種別のシフトが既に存在します',
        },
        { status: 409 }
      );
    }

    // トランザクションでシフト作成/更新
    const result = await prisma.$transaction(async (tx) => {
      let shift;

      if (existingShift && force) {
        // 強制更新: 既存シフトを更新
        shift = await tx.shift.update({
          where: { id: existingShift.id },
          data: {
            description: description || existingShift.description,
          },
          include: {
            department: true,
            shiftType: true,
          },
        });
      } else {
        // 新規作成
        shift = await tx.shift.create({
          data: {
            date: new Date(date),
            departmentId: parseInt(departmentId),
            shiftTypeId: parseInt(shiftTypeId),
            description: description || null,
          },
          include: {
            department: true,
            shiftType: true,
          },
        });
      }

      // インストラクター割り当て処理
      if (assignedInstructorIds.length > 0) {
        // 既存割り当てを削除（force更新の場合）
        if (existingShift && force) {
          await tx.shiftAssignment.deleteMany({
            where: { shiftId: shift.id },
          });
        }

        // 新しい割り当てを作成
        const assignmentPromises = assignedInstructorIds.map((instructorId: number) =>
          tx.shiftAssignment.create({
            data: {
              shiftId: shift.id,
              instructorId,
            },
            include: {
              instructor: true,
            },
          })
        );

        const assignments = await Promise.all(assignmentPromises);
        return { shift, assignments };
      }

      return { shift, assignments: [] };
    });

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
      assignments: result.assignments.map((assignment) => ({
        id: assignment.id,
        shiftId: assignment.shiftId,
        instructorId: assignment.instructorId,
        assignedAt: assignment.assignedAt.toISOString(),
        instructor: {
          id: assignment.instructor.id,
          lastName: assignment.instructor.lastName,
          firstName: assignment.instructor.firstName,
          status: assignment.instructor.status,
        },
      })),
      assignedCount: result.assignments.length,
    };

    return NextResponse.json(
      {
        success: true,
        data: shiftWithStats,
        message: force ? 'シフトが正常に更新されました' : 'シフトが正常に作成されました',
        error: null,
      },
      { status: force ? 200 : 201 }
    );
  } catch (error) {
    console.error('Shift creation error:', error);

    // Prisma unique constraint violation
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: null,
          error: 'DUPLICATE_SHIFT',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        data: null,
        message: null,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
