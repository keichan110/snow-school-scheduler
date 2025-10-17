// Actions
export {
  createInstructorAction,
  deleteInstructorAction,
  updateInstructorAction,
} from "./actions";

// Queries (Read)
export {
  type InstructorsQueryKey,
  instructorsQueryKeys,
  useInstructorsQuery,
} from "./api/queries";

// Queries (Write)
export {
  instructorKeys,
  useCreateInstructor,
  useDeleteInstructor,
  useUpdateInstructor,
} from "./queries/use-instructors";

// Schemas
export type {
  CreateInstructorInput,
  UpdateInstructorInput,
} from "./schemas";
