import type {
  ApiResponse,
  CreateShiftData,
  Department,
  Shift,
  ShiftQueryParams,
  ShiftType,
} from "./types";

const API_BASE = "/api" as const;

// Generic API error handler
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
  const searchParams = new URLSearchParams();

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    }
  }

  const result = await apiRequest<Shift[]>(`/shifts?${searchParams}`);
  return handleApiResponse(result);
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
