import type { InstructorFormData, InstructorWithCertifications } from "./types";

export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  message: string | null;
  error: string | null;
};

export async function fetchInstructors(): Promise<
  InstructorWithCertifications[]
> {
  const response = await fetch("/api/instructors");
  const result: ApiResponse<InstructorWithCertifications[]> =
    await response.json();

  if (!(result.success && result.data)) {
    throw new Error(result.error || "Failed to fetch instructors");
  }

  return result.data;
}

export async function createInstructor(
  data: InstructorFormData
): Promise<InstructorWithCertifications> {
  const requestData = {
    lastName: data.lastName,
    firstName: data.firstName,
    lastNameKana: data.lastNameKana || null,
    firstNameKana: data.firstNameKana || null,
    status: mapStatusToApi(data.status),
    notes: data.notes || null,
    certificationIds: data.certificationIds || [],
  };

  const response = await fetch("/api/instructors", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  });

  const result: ApiResponse<InstructorWithCertifications> =
    await response.json();

  if (!(result.success && result.data)) {
    throw new Error(result.error || "Failed to create instructor");
  }

  return result.data;
}

export async function updateInstructor(
  id: number,
  data: InstructorFormData
): Promise<InstructorWithCertifications> {
  const requestData = {
    lastName: data.lastName,
    firstName: data.firstName,
    lastNameKana: data.lastNameKana || null,
    firstNameKana: data.firstNameKana || null,
    status: mapStatusToApi(data.status),
    notes: data.notes || null,
    certificationIds: data.certificationIds || [],
  };

  const response = await fetch(`/api/instructors/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  });

  const result: ApiResponse<InstructorWithCertifications> =
    await response.json();

  if (!(result.success && result.data)) {
    throw new Error(result.error || "Failed to update instructor");
  }

  return result.data;
}

// ステータスをAPIフォーマットにマッピング
function mapStatusToApi(
  status: "active" | "inactive" | "retired"
): "ACTIVE" | "INACTIVE" | "RETIRED" {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "inactive":
      return "INACTIVE";
    case "retired":
      return "RETIRED";
    default:
      return "ACTIVE";
  }
}
