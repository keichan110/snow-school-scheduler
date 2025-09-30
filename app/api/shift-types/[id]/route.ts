import { type NextRequest, NextResponse } from "next/server";
import { authenticateFromRequest } from "@/lib/auth/middleware";
import { prisma } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: Params) {
  try {
    const { id } = await context.params;
    const shiftTypeId = Number.parseInt(id);

    if (isNaN(shiftTypeId)) {
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

    const shiftType = await prisma.shiftType.findUnique({
      where: {
        id: shiftTypeId,
      },
    });

    if (!shiftType) {
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

    return NextResponse.json(shiftType);
  } catch (error) {
    console.error("ShiftTypes GET API error:", error);
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

export async function PUT(request: NextRequest, context: Params) {
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
    const { id } = await context.params;
    const shiftTypeId = Number.parseInt(id);

    if (isNaN(shiftTypeId)) {
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

    const body = await request.json();
    const { name, isActive = true } = body;

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: null,
          error: "Validation failed",
        },
        { status: 400 }
      );
    }

    // Check if shift type exists
    const existingShiftType = await prisma.shiftType.findUnique({
      where: {
        id: shiftTypeId,
      },
    });

    if (!existingShiftType) {
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

    const shiftType = await prisma.shiftType.update({
      where: {
        id: shiftTypeId,
      },
      data: {
        name,
        isActive,
      },
    });

    return NextResponse.json(shiftType);
  } catch (error) {
    console.error("ShiftTypes PUT API error:", error);
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
