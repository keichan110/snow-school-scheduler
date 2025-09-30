import type {
  CertificationFormData,
  CertificationWithDepartment,
  DepartmentData,
} from "./types";

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
  error: string | null;
}

export async function fetchDepartments(): Promise<DepartmentData[]> {
  const response = await fetch("/api/departments");
  const result: ApiResponse<DepartmentData[]> = await response.json();

  if (!(result.success && result.data)) {
    throw new Error(result.error || "Failed to fetch departments");
  }

  return result.data;
}

export async function fetchCertifications(): Promise<
  CertificationWithDepartment[]
> {
  const response = await fetch("/api/certifications");
  const result: ApiResponse<CertificationWithDepartment[]> =
    await response.json();

  if (!(result.success && result.data)) {
    throw new Error(result.error || "Failed to fetch certifications");
  }

  return result.data;
}

// Department名からIDを取得するヘルパー関数
export async function getDepartmentIdByType(
  departmentType: "ski" | "snowboard"
): Promise<number> {
  const departments = await fetchDepartments();

  const targetDepartment = departments.find((dept) => {
    const name = dept.name.toLowerCase();
    if (departmentType === "ski") {
      return name.includes("スキー") || name.includes("ski");
    }
    return name.includes("スノーボード") || name.includes("snowboard");
  });

  if (!targetDepartment) {
    // デフォルトで最初のdepartmentのIDを返す
    return departments[0]?.id || 1;
  }

  return targetDepartment.id;
}

export async function createCertification(
  data: CertificationFormData
): Promise<CertificationWithDepartment> {
  const departmentId = await getDepartmentIdByType(data.department);

  const requestData = {
    name: data.name,
    shortName: data.shortName || null,
    departmentId,
    organization: data.organization,
    description: data.description || null,
    isActive: data.status === "active",
  };

  const response = await fetch("/api/certifications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  });

  const result: ApiResponse<CertificationWithDepartment> =
    await response.json();

  if (!(result.success && result.data)) {
    throw new Error(result.error || "Failed to create certification");
  }

  return result.data;
}

export async function updateCertification(
  id: number,
  data: CertificationFormData
): Promise<CertificationWithDepartment> {
  const departmentId = await getDepartmentIdByType(data.department);

  const requestData = {
    name: data.name,
    shortName: data.shortName || null,
    departmentId,
    organization: data.organization,
    description: data.description || null,
    isActive: data.status === "active",
  };

  const response = await fetch(`/api/certifications/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  });

  const result: ApiResponse<CertificationWithDepartment> =
    await response.json();

  if (!(result.success && result.data)) {
    throw new Error(result.error || "Failed to update certification");
  }

  return result.data;
}
