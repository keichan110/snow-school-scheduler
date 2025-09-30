import { type NextRequest, NextResponse } from "next/server";
import { authenticateFromRequest } from "@/lib/auth/middleware";
import { prisma } from "@/lib/db";

interface Params {
  id: string;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  try {
    const params = await context.params;
    const id = Number.parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: null,
          error: "Invalid shift ID",
        },
        { status: 400 }
      );
    }

    const shift = await prisma.shift.findUnique({
      where: { id },
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

    if (!shift) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: null,
          error: "Resource not found",
        },
        { status: 404 }
      );
    }

    // ShiftWithStats形式に変換
    const shiftWithStats = {
      id: shift.id,
      date: shift.date.toISOString().split("T")[0],
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
    };

    return NextResponse.json({
      success: true,
      data: shiftWithStats,
      message: "Shift operation completed successfully",
      error: null,
    });
  } catch (error) {
    console.error("Shift GET error:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: null,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  const authResult = await authenticateFromRequest(request);
  if (!authResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Authentication required",
        data: null,
        message: null,
      },
      { status: 401 }
    );
  }
  try {
    const params = await context.params;
    const id = Number.parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: null,
          error: "Invalid shift ID",
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      date,
      departmentId,
      shiftTypeId,
      description,
      assignedInstructorIds = [],
    } = body;

    // バリデーション
    if (!(date && departmentId && shiftTypeId)) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: null,
          error: "Required fields: date, departmentId, shiftTypeId",
        },
        { status: 400 }
      );
    }

    // 既存のシフトが存在するかチェック
    const existingShift = await prisma.shift.findUnique({
      where: { id },
    });

    if (!existingShift) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: null,
          error: "Resource not found",
        },
        { status: 404 }
      );
    }

    // トランザクションでシフト更新と割り当て更新
    const result = await prisma.$transaction(async (tx) => {
      // シフト更新
      const updatedShift = await tx.shift.update({
        where: { id },
        data: {
          date: new Date(date),
          departmentId: Number.parseInt(departmentId),
          shiftTypeId: Number.parseInt(shiftTypeId),
          description: description || null,
        },
        include: {
          department: true,
          shiftType: true,
        },
      });

      // 既存の割り当てを削除
      await tx.shiftAssignment.deleteMany({
        where: { shiftId: id },
      });

      // 新しい割り当てを作成
      const assignmentPromises = assignedInstructorIds.map(
        (instructorId: number) =>
          tx.shiftAssignment.create({
            data: {
              shiftId: id,
              instructorId,
            },
            include: {
              instructor: true,
            },
          })
      );

      const assignments = await Promise.all(assignmentPromises);

      return { shift: updatedShift, assignments };
    });

    // レスポンス用データを整形
    const shiftWithStats = {
      id: result.shift.id,
      date: result.shift.date.toISOString().split("T")[0],
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

    return NextResponse.json({
      success: true,
      data: shiftWithStats,
      message: "Shift operation completed successfully",
      error: null,
    });
  } catch (error) {
    console.error("Shift PUT error:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: null,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<Params> }
) {
  const authResult = await authenticateFromRequest(request);
  if (!authResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: "Authentication required",
        data: null,
        message: null,
      },
      { status: 401 }
    );
  }
  try {
    const params = await context.params;
    const id = Number.parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: null,
          error: "Invalid shift ID",
        },
        { status: 400 }
      );
    }

    // 既存のシフトが存在するかチェック
    const existingShift = await prisma.shift.findUnique({
      where: { id },
    });

    if (!existingShift) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: null,
          error: "Resource not found",
        },
        { status: 404 }
      );
    }

    // トランザクションでシフトと割り当てを削除
    await prisma.$transaction(async (tx) => {
      // 関連する割り当てを削除（ON DELETE CASCADEが設定されているが明示的に削除）
      await tx.shiftAssignment.deleteMany({
        where: { shiftId: id },
      });

      // シフトを削除
      await tx.shift.delete({
        where: { id },
      });
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Shift DELETE error:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: null,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
