import { type NextRequest, NextResponse } from "next/server";
import { authenticateFromRequest } from "@/lib/auth/middleware";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
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
    const searchParams = request.nextUrl.searchParams;
    const departmentId = searchParams.get("departmentId");
    const shiftTypeId = searchParams.get("shiftTypeId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

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
      where.departmentId = Number.parseInt(departmentId, 10);
    }

    if (shiftTypeId) {
      where.shiftTypeId = Number.parseInt(shiftTypeId, 10);
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
      orderBy: [
        { date: "asc" },
        { departmentId: "asc" },
        { shiftTypeId: "asc" },
      ],
    });

    // ShiftWithStats形式に変換
    const shiftsWithStats = shifts.map((shift) => ({
      id: shift.id,
      date: shift.date.toISOString().split("T")[0], // date形式
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
