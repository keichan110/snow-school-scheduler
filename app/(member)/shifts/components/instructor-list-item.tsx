"use client";

import { Check } from "@phosphor-icons/react";
import { CertificationBadge } from "@/app/_components/shared/certification-badge";
import { cn } from "@/lib/utils";

type Certification = {
  id: number;
  name: string;
  shortName: string;
  organization: string;
  department: {
    id: number;
    name: string;
  };
};

type Instructor = {
  id: number;
  lastName: string;
  firstName: string;
  lastNameKana?: string;
  firstNameKana?: string;
  status: string;
  certifications: Certification[];
};

type InstructorListItemProps = {
  instructor: Instructor;
  isSelected: boolean;
  hasRequiredCertification: boolean;
  departmentCertifications: Certification[];
  onToggle: (id: number) => void;
};

export function InstructorListItem({
  instructor,
  isSelected,
  hasRequiredCertification,
  departmentCertifications,
  onToggle,
}: InstructorListItemProps) {
  return (
    <button
      className={cn(
        "flex cursor-pointer items-center justify-between p-3 transition-all duration-200",
        "border-gray-100 border-b last:border-b-0 hover:bg-blue-50 dark:border-gray-800 dark:hover:bg-blue-950",
        isSelected &&
          "border-blue-200 bg-blue-50 dark:border-blue-700 dark:bg-blue-950",
        !hasRequiredCertification && "opacity-60"
      )}
      key={instructor.id}
      onClick={() => onToggle(instructor.id)}
      type="button"
    >
      <div className="flex items-center space-x-3">
        <div
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all",
            isSelected
              ? "scale-110 border-blue-500 bg-blue-500 text-white dark:border-blue-400 dark:bg-blue-500"
              : "border-gray-300 hover:border-blue-300 dark:border-gray-500 dark:hover:border-blue-400"
          )}
        >
          {isSelected ? (
            <Check className="h-3 w-3" weight="bold" />
          ) : (
            <div className="h-2 w-2 rounded-full bg-transparent" />
          )}
        </div>
        <div>
          <div className="font-medium text-sm">
            {instructor.lastName} {instructor.firstName}
          </div>
          {instructor.lastNameKana && instructor.firstNameKana && (
            <div className="text-muted-foreground text-xs">
              {instructor.lastNameKana} {instructor.firstNameKana}
            </div>
          )}
        </div>
      </div>
      <div className="text-right">
        {hasRequiredCertification ? (
          <div className="flex flex-wrap justify-end gap-1">
            {departmentCertifications.map((cert) => (
              <CertificationBadge
                departmentName={cert.department.name}
                key={cert.id}
                shortName={cert.shortName}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-full border border-orange-200 bg-orange-100 px-2 py-1 text-orange-800 text-xs dark:border-orange-700 dark:bg-orange-900 dark:text-orange-100">
            認定なし
          </div>
        )}
      </div>
    </button>
  );
}
