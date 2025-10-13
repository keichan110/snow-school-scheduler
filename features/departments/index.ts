// Actions
export {
  createDepartmentAction,
  deleteDepartmentAction,
  updateDepartmentAction,
} from "./actions";

// Queries (Write)
export {
  departmentKeys,
  useCreateDepartment,
  useDeleteDepartment,
  useUpdateDepartment,
} from "./queries/use-departments";

// Schemas
export type {
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from "./schemas";
