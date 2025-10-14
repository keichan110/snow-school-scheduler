import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type Params = {
  id: string;
};

export async function GET(
  _request: NextRequest,
  context: { params: Promise<Params> }
) {
  try {
    const params = await context.params;
    const id = Number.parseInt(params.id, 10);

    if (Number.isNaN(id)) {
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
  } catch (_error) {
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
