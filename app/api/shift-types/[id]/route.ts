import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: Params) {
  try {
    const { id } = await context.params;
    const shiftTypeId = parseInt(id);

    if (isNaN(shiftTypeId)) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: null,
          error: 'Resource not found',
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
          error: 'Resource not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(shiftType);
  } catch (error) {
    console.error('ShiftTypes GET API error:', error);
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

export async function PUT(request: Request, context: Params) {
  try {
    const { id } = await context.params;
    const shiftTypeId = parseInt(id);

    if (isNaN(shiftTypeId)) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: null,
          error: 'Resource not found',
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
          error: 'Validation failed',
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
          error: 'Resource not found',
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
    console.error('ShiftTypes PUT API error:', error);
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
