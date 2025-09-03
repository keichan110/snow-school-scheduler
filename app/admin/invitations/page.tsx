'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  UserCheck,
  Eye,
  EyeSlash,
  CalendarX,
  Copy,
  CheckCircle,
} from '@phosphor-icons/react';
import InvitationModal from './InvitationModal';
import InvitationWarningModal from './InvitationWarningModal';
import {
  fetchInvitations,
  createInvitation,
  deactivateInvitation,
  checkActiveInvitation,
} from './api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import type {
  InvitationTokenWithStats,
  InvitationFormData,
  InvitationStats,
  CreateInvitationRequest,
} from './types';

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<InvitationTokenWithStats[]>([]);
  const [filteredInvitations, setFilteredInvitations] = useState<InvitationTokenWithStats[]>([]);
  const [showActiveOnly, setShowActiveOnly] = useState<boolean>(true);
  const [stats, setStats] = useState<InvitationStats>({
    total: 0,
    active: 0,
    expired: 0,
    used: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvitation, setEditingInvitation] = useState<InvitationTokenWithStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [existingActiveInvitation, setExistingActiveInvitation] =
    useState<InvitationTokenWithStats | null>(null);
  const [pendingFormData, setPendingFormData] = useState<InvitationFormData | null>(null);

  const loadInvitations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchInvitations();
      setInvitations(data);
    } catch (error) {
      console.error('Failed to load invitations:', error);
      setError(error instanceof Error ? error.message : 'データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilter = useCallback(() => {
    let filtered = [...invitations];

    if (showActiveOnly) {
      const now = new Date();
      filtered = filtered.filter((invitation) => {
        if (!invitation.isActive) return false;
        if (invitation.expiresAt && new Date(invitation.expiresAt) < now) return false;
        return true;
      });
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setFilteredInvitations(filtered);
  }, [invitations, showActiveOnly]);

  const updateStats = useCallback(() => {
    const now = new Date();
    const total = invitations.length;
    const inactive = invitations.filter((invitation) => !invitation.isActive).length;

    let active = 0;
    let expired = 0;

    invitations.forEach((invitation) => {
      if (!invitation.isActive) return;

      const isExpired = invitation.expiresAt && new Date(invitation.expiresAt) < now;

      if (isExpired) {
        expired++;
      } else {
        active++;
      }
    });

    setStats({ total, active, expired, used: inactive });
  }, [invitations]);

  useEffect(() => {
    loadInvitations();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [applyFilter]);

  useEffect(() => {
    updateStats();
  }, [updateStats]);

  const handleActiveFilterChange = (checked: boolean) => {
    setShowActiveOnly(checked);
  };

  const handleOpenModal = (invitation?: InvitationTokenWithStats) => {
    setEditingInvitation(invitation || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingInvitation(null);
  };

  const handleSave = async (data: InvitationFormData) => {
    try {
      const activeInvitation = await checkActiveInvitation();

      if (activeInvitation) {
        setExistingActiveInvitation(activeInvitation);
        setPendingFormData(data);
        setWarningModalOpen(true);
        return; // ユーザー確認待ち
      }
      await executeInvitationCreation(data);
    } catch (error) {
      throw error;
    }
  };

  const executeInvitationCreation = async (data: InvitationFormData) => {
    const requestData: CreateInvitationRequest = {
      description: data.description,
      expiresAt: data.expiresAt.toISOString(),
    };

    await createInvitation(requestData);
    await loadInvitations(); // 既存招待の無効化を反映
  };

  const handleConfirmReplacement = async () => {
    if (!pendingFormData) return;

    try {
      await executeInvitationCreation(pendingFormData);
      setWarningModalOpen(false);
      setPendingFormData(null);
      setExistingActiveInvitation(null);
    } catch (error) {
      throw error;
    }
  };

  const handleCancelReplacement = () => {
    setWarningModalOpen(false);
    setPendingFormData(null);
    setExistingActiveInvitation(null);
  };


  const handleCopyInvitationUrl = async (token: string) => {
    try {
      const baseUrl = window.location.origin;
      const invitationUrl = `${baseUrl}/login?invite=${encodeURIComponent(token)}`;
      await navigator.clipboard.writeText(invitationUrl);
      setCopiedToken(token);
      setTimeout(() => setCopiedToken(null), 2000);
    } catch (error) {
      console.error('クリップボードへのコピーに失敗しました:', error);
    }
  };

  const handleDeactivate = async (token: string) => {
    try {
      await deactivateInvitation(token);
      // 無効化後はサーバーから最新データを再読み込み
      await loadInvitations();
    } catch {
      console.error('招待の無効化に失敗しました');
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-8 lg:px-8">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
            <p className="text-muted-foreground">データを読み込んでいます...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-8 lg:px-8">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="mb-4 text-destructive">{error}</p>
            <Button onClick={loadInvitations}>再試行</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 md:py-8 lg:px-8">
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-bold text-foreground md:text-3xl">招待管理</h1>
            <p className="text-sm text-muted-foreground md:text-base">
              新規メンバー招待用URLの作成・管理を行います
            </p>
          </div>
        </div>
      </div>

      {/* 統計情報 */}
      <div className="mb-4 md:mb-6">
        <Card className="mx-auto w-full max-w-md md:mx-0">
          <CardContent className="px-3 py-2">
            <div className="flex items-center justify-center divide-x divide-border">
              <div className="flex items-center gap-2 px-4 py-1">
                <UserCheck
                  className="h-4 w-4 text-green-600 dark:text-green-400"
                  weight="regular"
                />
                <div className="text-base font-bold text-green-600 dark:text-green-400">
                  {stats.active}
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-1">
                <CalendarX className="h-4 w-4 text-red-600 dark:text-red-400" weight="regular" />
                <div className="text-base font-bold text-red-600 dark:text-red-400">
                  {stats.expired}
                </div>
              </div>

              <div className="flex items-center gap-2 px-4 py-1">
                <EyeSlash className="h-4 w-4 text-amber-600 dark:text-amber-400" weight="regular" />
                <div className="text-base font-bold text-amber-600 dark:text-amber-400">
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
            <h2 className="text-lg font-semibold">招待一覧</h2>
            <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              新規作成
            </Button>
          </div>

          <div className="flex items-center justify-end">
            <div className="flex items-center space-x-2">
              <Switch
                id="active-only"
                checked={showActiveOnly}
                onCheckedChange={handleActiveFilterChange}
              />
              <Label htmlFor="active-only" className="flex cursor-pointer items-center gap-1">
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
              <TableHead className="w-12"></TableHead>
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
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  {showActiveOnly ? '有効な招待がありません' : '招待が作成されていません'}
                </TableCell>
              </TableRow>
            ) : (
              filteredInvitations.map((invitation) => {
                const now = new Date();
                const isExpired = invitation.expiresAt && new Date(invitation.expiresAt) < now;
                const isInactive = !invitation.isActive;


                let statusStyles;
                let StatusIcon;
                if (isInactive) {
                  statusStyles = {
                    row: 'bg-gray-50/30 hover:bg-gray-50/50 dark:bg-gray-900/5 dark:hover:bg-gray-900/10',
                    icon: 'text-gray-600 dark:text-gray-400',
                    text: 'text-foreground',
                  };
                  StatusIcon = EyeSlash;
                } else if (isExpired) {
                  statusStyles = {
                    row: 'bg-red-50/30 hover:bg-red-50/50 dark:bg-red-900/5 dark:hover:bg-red-900/10',
                    icon: 'text-red-600 dark:text-red-400',
                    text: 'text-foreground',
                  };
                  StatusIcon = CalendarX;
                } else {
                  statusStyles = {
                    row: 'bg-green-50/30 hover:bg-green-50/50 dark:bg-green-900/5 dark:hover:bg-green-900/10',
                    icon: 'text-green-600 dark:text-green-400',
                    text: 'text-foreground',
                  };
                  StatusIcon = UserCheck;
                }

                return (
                  <TableRow
                    key={invitation.token}
                    className={`transition-colors ${statusStyles.row} ${
                      isInactive || isExpired ? 'opacity-60' : ''
                    }`}
                  >
                    <TableCell>
                      <StatusIcon className={`h-5 w-5 ${statusStyles.icon}`} weight="regular" />
                    </TableCell>
                    <TableCell
                      className="cursor-pointer"
                      onClick={() => handleOpenModal(invitation)}
                    >
                      <p
                        className={`line-clamp-2 text-sm font-medium ${statusStyles.text} ${
                          isInactive || isExpired ? 'line-through' : ''
                        }`}
                      >
                        {invitation.description || '説明なし'}
                      </p>
                    </TableCell>
                    <TableCell
                      className="cursor-pointer"
                      onClick={() => handleOpenModal(invitation)}
                    >
                      <span
                        className={`font-mono text-sm ${statusStyles.text} ${
                          isInactive || isExpired ? 'line-through' : ''
                        }`}
                      >
                        {invitation.usageCount}
                      </span>
                    </TableCell>
                    <TableCell
                      className="cursor-pointer"
                      onClick={() => handleOpenModal(invitation)}
                    >
                      {invitation.expiresAt ? (
                        <span
                          className={`text-sm ${statusStyles.text} ${
                            isInactive || isExpired ? 'line-through' : ''
                          }`}
                        >
                          {format(new Date(invitation.expiresAt), 'MM/dd', { locale: ja })}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">なし</span>
                      )}
                    </TableCell>
                    <TableCell
                      className="cursor-pointer"
                      onClick={() => handleOpenModal(invitation)}
                    >
                      <span
                        className={`text-sm text-muted-foreground ${
                          isInactive || isExpired ? 'line-through' : ''
                        }`}
                      >
                        {format(new Date(invitation.createdAt), 'MM/dd HH:mm', { locale: ja })}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {invitation.isActive && !isExpired ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyInvitationUrl(invitation.token);
                          }}
                          className="h-8 w-8 p-0"
                          title="招待URLをコピー"
                        >
                          {copiedToken === invitation.token ? (
                            <CheckCircle className="h-4 w-4 text-green-600" weight="fill" />
                          ) : (
                            <Copy className="h-4 w-4" weight="regular" />
                          )}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <InvitationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        invitation={editingInvitation}
        onDeactivate={handleDeactivate}
      />


      {existingActiveInvitation && (
        <InvitationWarningModal
          isOpen={warningModalOpen}
          onClose={handleCancelReplacement}
          onConfirm={handleConfirmReplacement}
          existingInvitation={existingActiveInvitation}
        />
      )}
    </div>
  );
}
