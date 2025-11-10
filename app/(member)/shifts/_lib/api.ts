import type {
  ApiResponse,
  CreateShiftData,
  Department,
  Shift,
  ShiftQueryParams,
  ShiftType,
} from "./types";

const API_BASE = "/api" as const;

// 日付計算用の定数
const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
const WEEKLY_VIEW_MAX_DAYS = 7;

// 名前解析用の正規表現
const WHITESPACE_REGEX = /\s+/;

// 汎用APIエラーハンドラ
class ApiError extends Error {
  readonly statusCode?: number | undefined;
  readonly originalError?: unknown;

  constructor(
    message: string,
    statusCode?: number | undefined,
    originalError?: unknown
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.originalError = originalError;
  }
}

// Generic fetch helper with error handling
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);

    if (!response.ok) {
      throw new ApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }

    return (await response.json()) as ApiResponse<T>;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError("Network error occurred", undefined, error);
  }
}

// Generic API response handler
function handleApiResponse<T>(result: ApiResponse<T>): T {
  if (!result.success) {
    throw new ApiError(result.error || "API request failed");
  }

  if (result.data === null || result.data === undefined) {
    throw new ApiError("No data returned from server");
  }

  return result.data;
}

export async function fetchShifts(params?: ShiftQueryParams): Promise<Shift[]> {
  // 新しいusecase APIエンドポイントを使用
  // dateFromとdateToが両方ある場合、月次ビューか週次ビューか判定
  if (!(params?.dateFrom && params.dateTo)) {
    throw new ApiError("dateFrom and dateTo are required");
  }

  // 日付範囲から適切なエンドポイントを判定
  const dateFrom = new Date(params.dateFrom);
  const dateTo = new Date(params.dateTo);
  const daysDiff = Math.ceil(
    (dateTo.getTime() - dateFrom.getTime()) / MILLISECONDS_PER_DAY
  );

  let endpoint: string;
  const searchParams = new URLSearchParams();

  // 7日間なら週次ビュー、それ以外は月次ビュー
  if (daysDiff <= WEEKLY_VIEW_MAX_DAYS) {
    endpoint = "/usecases/shifts/weekly-view";
    searchParams.append("dateFrom", params.dateFrom);
  } else {
    endpoint = "/usecases/shifts/monthly-view";
    const year = dateFrom.getFullYear();
    const month = dateFrom.getMonth() + 1;
    searchParams.append("year", year.toString());
    searchParams.append("month", month.toString());
  }

  // CalendarViewResponse型でレスポンスを取得
  const response = await fetch(`${API_BASE}${endpoint}?${searchParams}`);

  if (!response.ok) {
    throw new ApiError(
      `HTTP ${response.status}: ${response.statusText}`,
      response.status
    );
  }

  const result = (await response.json()) as {
    success: boolean;
    data: {
      shifts: Array<{
        id: number;
        date: string;
        department: {
          id: number;
          name: string;
          code: string;
        };
        shiftType: {
          id: number;
          name: string;
        };
        assignedInstructors: Array<{
          id: number;
          displayName: string;
        }>;
        stats: {
          assignedCount: number;
          hasNotes: boolean;
        };
        description: string | null;
      }>;
    } | null;
    error?: string | null;
  };

  if (!(result.success && result.data)) {
    throw new ApiError(result.error || "Failed to fetch shifts");
  }

  // CalendarViewResponseのshiftsをShift[]型に変換
  const shifts: Shift[] = result.data.shifts.map((shift) => {
    return {
      id: shift.id,
      date: shift.date,
      departmentId: shift.department.id,
      shiftTypeId: shift.shiftType.id,
      description: shift.description,
      createdAt: "", // usecase APIはcreatedAtを返さないため空文字
      updatedAt: "", // usecase APIはupdatedAtを返さないため空文字
      department: {
        id: shift.department.id,
        name: shift.department.name,
        createdAt: "",
        updatedAt: "",
      },
      shiftType: {
        id: shift.shiftType.id,
        name: shift.shiftType.name,
        isActive: true, // usecase APIはisActiveを返さないためtrueと仮定
        createdAt: "",
        updatedAt: "",
      },
      assignments: shift.assignedInstructors.map((instructor, index) => {
        // displayNameを姓名に分離（スペースで分割、失敗時は全体を姓とする）
        const nameParts = instructor.displayName.trim().split(WHITESPACE_REGEX);
        const lastName = nameParts[0] || "";
        const firstName = nameParts[1] || "";

        return {
          id: index, // アサインメントIDは返されないため、仮のIDを使用
          shiftId: shift.id,
          instructorId: instructor.id,
          assignedAt: "",
          instructor: {
            id: instructor.id,
            lastName,
            firstName,
            status: "ACTIVE", // usecase APIはstatusを返さないためACTIVEと仮定
          },
        };
      }),
      assignedCount: shift.stats.assignedCount,
    };
  });

  return shifts;
}

export async function createShift(data: CreateShiftData): Promise<Shift> {
  const result = await apiRequest<Shift>("/shifts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return handleApiResponse(result);
}

export async function fetchDepartments(): Promise<Department[]> {
  const result = await apiRequest<Department[]>("/departments");
  return handleApiResponse(result);
}

export async function fetchShiftTypes(): Promise<ShiftType[]> {
  const result = await apiRequest<ShiftType[]>("/shift-types");
  return handleApiResponse(result);
}

// Export error class for external use
export { ApiError };
