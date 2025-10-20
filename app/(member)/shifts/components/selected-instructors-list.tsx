"use client";

import { X } from "lucide-react";

type Instructor = {
  id: number;
  lastName: string;
  firstName: string;
  lastNameKana?: string;
  firstNameKana?: string;
};

type SelectedInstructorsListProps = {
  instructors: Instructor[];
  onRemove: (id: number) => void;
};

export function SelectedInstructorsList({
  instructors,
  onRemove,
}: SelectedInstructorsListProps) {
  if (instructors.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-700 dark:bg-blue-950">
      <div className="mb-2 font-medium text-blue-800 text-sm dark:text-blue-200">
        選択済み（{instructors.length}名）
      </div>
      <div className="flex flex-wrap gap-2">
        {instructors.map((instructor) => (
          <div
            className="flex items-center gap-1 rounded-full border border-blue-300 bg-blue-100 px-3 py-1 text-blue-800 text-sm dark:border-blue-600 dark:bg-blue-900 dark:text-blue-100"
            key={instructor.id}
          >
            <span>
              {instructor.lastName} {instructor.firstName}
            </span>
            <button
              className="rounded-full p-0.5 transition-colors hover:bg-blue-200 dark:hover:bg-blue-800"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(instructor.id);
              }}
              type="button"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
