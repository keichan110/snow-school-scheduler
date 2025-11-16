"use client";

import {
  CalendarX,
  CheckCircle,
  Copy,
  Eye,
  EyeSlash,
  Plus,
  UserCheck,
} from "@phosphor-icons/react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { checkActiveInvitation } from "../_lib/api";
import type {
  InvitationFormData,
  InvitationStats,
  InvitationTokenWithStats,
} from "../_lib/types";
import {
  useCreateInvitation,
  useDeleteInvitation,
} from "../_lib/use-invitations";
import InvitationModal from "./invitation-modal";
import InvitationWarningModal from "./invitation-warning-modal";

const CLIPBOARD_SUCCESS_TIMEOUT_MS = 2000;

type InvitationsContentProps = {
  initialData: InvitationTokenWithStats[];
};

type InvitationRowProps = {
  invitation: InvitationTokenWithStats;
  copiedToken: string | null;
  onOpenModal: (invitation: InvitationTokenWithStats) => void;
  onCopyUrl: (token: string) => void;
};

function InvitationRow({
  invitation,
  copiedToken,
  onOpenModal,
  onCopyUrl,
}: InvitationRowProps) {
  const status = getInvitationStatus(invitation);
  const StatusIcon = STATUS_ICON[status];
  const statusStyles = STATUS_STYLES[status];
  const isInactiveLabel = status !== "active";

  return (
    <TableRow
      className={`transition-colors ${statusStyles.row} ${isInactiveLabel ? "opacity-60" : ""}`}
      key={invitation.token}
    >
      <TableCell>
        <StatusIcon
          className={`h-5 w-5 ${statusStyles.icon}`}
          weight="regular"
        />
      </TableCell>
      <TableCell
        className="cursor-pointer"
        onClick={() => onOpenModal(invitation)}
      >
        <p
          className={`line-clamp-2 font-medium text-sm ${statusStyles.text} ${
            isInactiveLabel ? "line-through" : ""
          }`}
        >
          {invitation.description || "説明なし"}
        </p>
      </TableCell>
      <TableCell
        className="cursor-pointer"
        onClick={() => onOpenModal(invitation)}
      >
        <span
          className={`font-mono text-sm ${statusStyles.text} ${
            isInactiveLabel ? "line-through" : ""
          }`}
        >
          {invitation.usageCount}
        </span>
      </TableCell>
      <TableCell
        className="cursor-pointer"
        onClick={() => onOpenModal(invitation)}
      >
        {invitation.expiresAt ? (
          <span
            className={`text-sm ${statusStyles.text} ${
              isInactiveLabel ? "line-through" : ""
            }`}
          >
            {format(new Date(invitation.expiresAt), "MM/dd", {
              locale: ja,
            })}
          </span>
        ) : (
          <span className="text-muted-foreground text-sm">なし</span>
        )}
      </TableCell>
      <TableCell
        className="cursor-pointer"
        onClick={() => onOpenModal(invitation)}
      >
        <span
          className={`text-muted-foreground text-sm ${
            isInactiveLabel ? "line-through" : ""
          }`}
        >
          {format(new Date(invitation.createdAt), "MM/dd HH:mm", {
            locale: ja,
          })}
        </span>
      </TableCell>
      <TableCell className="text-center">
        {status === "active" ? (
          <Button
            className="h-8 w-8 p-0"
            onClick={(event) => {
              event.stopPropagation();
              onCopyUrl(invitation.token);
            }}
            size="sm"
            title="招待URLをコピー"
            variant="outline"
          >
            {copiedToken === invitation.token ? (
              <CheckCircle className="h-4 w-4 text-green-600" weight="fill" />
            ) : (
              <Copy className="h-4 w-4" weight="regular" />
            )}
          </Button>
        ) : (
          <span className="text-muted-foreground text-xs">-</span>
        )}
      </TableCell>
    </TableRow>
  );
}

function sortInvitations(
  invitations: InvitationTokenWithStats[]
): InvitationTokenWithStats[] {
  return [...invitations].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function filterInvitations(
  invitations: InvitationTokenWithStats[],
  showActiveOnly: boolean
): InvitationTokenWithStats[] {
  if (!showActiveOnly) {
    return invitations;
  }

  const now = Date.now();
  return invitations.filter((invitation) => {
    if (!invitation.isActive) {
      return false;
    }

    if (
      invitation.expiresAt &&
      new Date(invitation.expiresAt).getTime() < now
    ) {
      return false;
    }

    return true;
  });
}

function calculateStats(
  invitations: InvitationTokenWithStats[]
): InvitationStats {
  const now = Date.now();

  let active = 0;
  let expired = 0;

  for (const invitation of invitations) {
    if (!invitation.isActive) {
      continue;
    }

    const isExpired = invitation.expiresAt
      ? new Date(invitation.expiresAt).getTime() < now
      : false;

    if (isExpired) {
      expired += 1;
      continue;
    }

    active += 1;
  }

  const used = invitations.filter((invitation) => !invitation.isActive).length;

  return {
    total: invitations.length,
    active,
    expired,
    used,
  };
}

type InvitationStatus = "active" | "expired" | "inactive";

function getInvitationStatus(
  invitation: InvitationTokenWithStats
): InvitationStatus {
  if (!invitation.isActive) {
    return "inactive";
  }

  if (
    invitation.expiresAt &&
    new Date(invitation.expiresAt).getTime() < Date.now()
  ) {
    return "expired";
  }

  return "active";
}

const STATUS_ICON = {
  active: UserCheck,
  expired: CalendarX,
  inactive: EyeSlash,
} satisfies Record<InvitationStatus, typeof UserCheck>;

const STATUS_STYLES = {
  active: {
    row: "bg-green-50/30 hover:bg-green-50/50 dark:bg-green-900/5 dark:hover:bg-green-900/10",
    icon: "text-green-600 dark:text-green-400",
    text: "text-foreground",
  },
  expired: {
    row: "bg-red-50/30 hover:bg-red-50/50 dark:bg-red-900/5 dark:hover:bg-red-900/10",
    icon: "text-red-600 dark:text-red-400",
    text: "text-foreground",
  },
  inactive: {
    row: "bg-gray-50/30 hover:bg-gray-50/50 dark:bg-gray-900/5 dark:hover:bg-gray-900/10",
    icon: "text-gray-600 dark:text-gray-400",
    text: "text-foreground",
  },
} satisfies Record<
  InvitationStatus,
  { row: string; icon: string; text: string }
>;

export default function InvitationsContent({
  initialData,
}: InvitationsContentProps) {
  const router = useRouter();
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvitation, setEditingInvitation] =
    useState<InvitationTokenWithStats | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [existingActiveInvitation, setExistingActiveInvitation] =
    useState<InvitationTokenWithStats | null>(null);
  const [pendingFormData, setPendingFormData] =
    useState<InvitationFormData | null>(null);

  const sortedInvitations = useMemo(
    () => sortInvitations(initialData),
    [initialData]
  );

  const filteredInvitations = useMemo(
    () => filterInvitations(sortedInvitations, showActiveOnly),
    [sortedInvitations, showActiveOnly]
  );

  const stats = useMemo(
    () => calculateStats(sortedInvitations),
    [sortedInvitations]
  );

  const createInvitationMutation = useCreateInvitation();
  const deleteInvitationMutation = useDeleteInvitation();

  const handleOpenModal = useCallback(
    (invitation?: InvitationTokenWithStats) => {
      setEditingInvitation(invitation ?? null);
      setIsModalOpen(true);
    },
    []
  );

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingInvitation(null);
  }, []);

  const handleActiveFilterChange = useCallback((checked: boolean) => {
    setShowActiveOnly(checked);
  }, []);

  const executeInvitationCreation = useCallback(
    async (formData: InvitationFormData) => {
      const requestData = {
        description: formData.description,
        expiresAt: formData.expiresAt.toISOString(),
        role: "MEMBER" as const,
      };

      const result = await createInvitationMutation.mutateAsync(requestData);

      if (result.success) {
        // Server Componentを再実行してサーバーから最新データを取得
        router.refresh();
      }
    },
    [createInvitationMutation, router]
  );

  const handleSave = useCallback(
    async (data: InvitationFormData) => {
      const activeInvitation = await checkActiveInvitation();

      if (activeInvitation) {
        setExistingActiveInvitation(activeInvitation);
        setPendingFormData(data);
        setWarningModalOpen(true);
        return;
      }

      await executeInvitationCreation(data);
    },
    [executeInvitationCreation]
  );

  const handleConfirmReplacement = useCallback(async () => {
    if (!pendingFormData) {
      return;
    }

    await executeInvitationCreation(pendingFormData);

    setWarningModalOpen(false);
    setPendingFormData(null);
    setExistingActiveInvitation(null);
  }, [executeInvitationCreation, pendingFormData]);

  const handleCancelReplacement = useCallback(() => {
    setWarningModalOpen(false);
    setPendingFormData(null);
    setExistingActiveInvitation(null);
  }, []);

  const handleDeactivate = useCallback(
    async (token: string) => {
      await deleteInvitationMutation.mutateAsync(token);

      // Server Componentを再実行してサーバーから最新データを取得
      router.refresh();
    },
    [deleteInvitationMutation, router]
  );

  const handleCopyInvitationUrl = useCallback(async (token: string) => {
    try {
      const baseUrl = window.location.origin;
      const invitationUrl = `${baseUrl}/login?invite=${encodeURIComponent(token)}`;

      await navigator.clipboard.writeText(invitationUrl);

      setCopiedToken(token);
      window.setTimeout(
        () => setCopiedToken(null),
        CLIPBOARD_SUCCESS_TIMEOUT_MS
      );
    } catch {
      // Clipboard write may fail due to browser permissions or security context
      // Silently ignore the error as this is a non-critical feature
    }
  }, []);

  const handleCloseWarningModal = useCallback(() => {
    if (createInvitationMutation.isPending) {
      return;
    }

    handleCancelReplacement();
  }, [handleCancelReplacement, createInvitationMutation.isPending]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-8 lg:px-8">
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 font-bold text-2xl text-foreground md:text-3xl">
              招待管理
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              新規メンバー招待用URLの作成・管理を行います
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 md:mb-6">
        <Card className="mx-auto w-full max-w-md md:mx-0">
          <CardContent className="px-3 py-2">
            <div className="flex items-center justify-center divide-x divide-border">
              <div className="flex items-center gap-2 px-4 py-1">
                <UserCheck
                  className="h-4 w-4 text-green-600 dark:text-green-400"
                  weight="regular"
                />
                <div className="font-bold text-base text-green-600 dark:text-green-400">
                  {stats.active}
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-1">
                <CalendarX
                  className="h-4 w-4 text-red-600 dark:text-red-400"
                  weight="regular"
                />
                <div className="font-bold text-base text-red-600 dark:text-red-400">
                  {stats.expired}
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-1">
                <EyeSlash
                  className="h-4 w-4 text-amber-600 dark:text-amber-400"
                  weight="regular"
                />
                <div className="font-bold text-amber-600 text-base dark:text-amber-400">
                  {stats.used}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white shadow-lg dark:bg-gray-900">
        <div className="space-y-4 border-b p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg">招待一覧</h2>
            <Button
              className="flex items-center gap-2"
              onClick={() => handleOpenModal()}
            >
              <Plus className="h-4 w-4" />
              新規作成
            </Button>
          </div>

          <div className="flex items-center justify-end">
            <div className="flex items-center space-x-2">
              <Switch
                checked={showActiveOnly}
                id="active-only"
                onCheckedChange={handleActiveFilterChange}
              />
              <Label
                className="flex cursor-pointer items-center gap-1"
                htmlFor="active-only"
              >
                {showActiveOnly ? (
                  <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <EyeSlash className="h-4 w-4 text-gray-500" />
                )}
                有効のみ表示
              </Label>
            </div>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-white dark:bg-gray-900">
              <TableHead className="w-12" />
              <TableHead className="min-w-[200px]">説明</TableHead>
              <TableHead className="min-w-[80px]">使用回数</TableHead>
              <TableHead className="min-w-[120px]">有効期限</TableHead>
              <TableHead className="min-w-[120px]">作成日時</TableHead>
              <TableHead className="w-20 text-center">URL</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvitations.length === 0 ? (
              <TableRow>
                <TableCell
                  className="py-8 text-center text-muted-foreground"
                  colSpan={6}
                >
                  {showActiveOnly
                    ? "有効な招待がありません"
                    : "招待が作成されていません"}
                </TableCell>
              </TableRow>
            ) : (
              filteredInvitations.map((invitation) => (
                <InvitationRow
                  copiedToken={copiedToken}
                  invitation={invitation}
                  key={invitation.token}
                  onCopyUrl={handleCopyInvitationUrl}
                  onOpenModal={handleOpenModal}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <InvitationModal
        invitation={editingInvitation}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onDeactivate={handleDeactivate}
        onSave={handleSave}
      />

      {existingActiveInvitation && (
        <InvitationWarningModal
          existingInvitation={existingActiveInvitation}
          isOpen={warningModalOpen}
          isSubmitting={createInvitationMutation.isPending}
          onClose={handleCloseWarningModal}
          onConfirm={handleConfirmReplacement}
        />
      )}
    </div>
  );
}
