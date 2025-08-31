'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Users,
  UserCheck,
  Clock,
  Copy,
  Trash,
  Eye,
  EyeSlash,
  CalendarX,
} from '@phosphor-icons/react';
import InvitationModal from './InvitationModal';
import {
  fetchInvitations,
  createInvitation,
  deactivateInvitation,
  generateInvitationUrl,
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        if (invitation.maxUses && invitation.usageCount >= invitation.maxUses) return false;
        return true;
      });
    }

    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setFilteredInvitations(filtered);
  }, [invitations, showActiveOnly]);

  const updateStats = useCallback(() => {
    const now = new Date();
    const total = invitations.length;

    let active = 0;
    let expired = 0;
    let used = 0;

    invitations.forEach((invitation) => {
      if (!invitation.isActive) return;

      const isExpired = invitation.expiresAt && new Date(invitation.expiresAt) < now;
      const isMaxUsed = invitation.maxUses && invitation.usageCount >= invitation.maxUses;

      if (isExpired) {
        expired++;
      } else if (isMaxUsed) {
        used++;
      } else {
        active++;
      }
    });

    setStats({ total, active, expired, used });
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

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = async (data: InvitationFormData) => {
    try {
      const requestData: CreateInvitationRequest = {
        description: data.description,
        maxUses: data.maxUses,
      };

      if (data.expiresAt) {
        requestData.expiresAt = data.expiresAt.toISOString();
      }

      const created = await createInvitation(requestData);
      setInvitations((prev) => [created, ...prev]);
    } catch (error) {
      throw error;
    }
  };

  const handleCopyUrl = async (token: string) => {
    const url = generateInvitationUrl(token);
    try {
      await navigator.clipboard.writeText(url);
      console.log('招待URLをコピーしました:', url);
    } catch {
      console.error('URLのコピーに失敗しました');
    }
  };

  const handleDeactivate = async (token: string) => {
    try {
      await deactivateInvitation(token);
      setInvitations((prev) =>
        prev.map((inv) => (inv.token === token ? { ...inv, isActive: false } : inv))
      );
    } catch {
      console.error('招待の無効化に失敗しました');
    }
  };

  const getStatusColor = (invitation: InvitationTokenWithStats) => {
    if (!invitation.isActive) return 'text-gray-500';

    const now = new Date();
    const isExpired = invitation.expiresAt && new Date(invitation.expiresAt) < now;
    const isMaxUsed = invitation.maxUses && invitation.usageCount >= invitation.maxUses;

    if (isExpired || isMaxUsed) return 'text-red-500';
    return 'text-green-500';
  };

  const getStatusText = (invitation: InvitationTokenWithStats) => {
    if (!invitation.isActive) return '無効';

    const now = new Date();
    const isExpired = invitation.expiresAt && new Date(invitation.expiresAt) < now;
    const isMaxUsed = invitation.maxUses && invitation.usageCount >= invitation.maxUses;

    if (isExpired) return '期限切れ';
    if (isMaxUsed) return '使用完了';
    return '有効';
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

      <div className="mb-4 md:mb-6">
        <Card className="mx-auto w-full max-w-2xl md:mx-0">
          <CardContent className="px-4 py-3">
            <div className="grid grid-cols-4 divide-x divide-border">
              <div className="flex flex-col items-center gap-1 px-2">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {stats.total}
                </div>
                <div className="text-xs text-muted-foreground">総数</div>
              </div>

              <div className="flex flex-col items-center gap-1 px-2">
                <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {stats.active}
                </div>
                <div className="text-xs text-muted-foreground">有効</div>
              </div>

              <div className="flex flex-col items-center gap-1 px-2">
                <CalendarX className="h-5 w-5 text-red-600 dark:text-red-400" />
                <div className="text-lg font-bold text-red-600 dark:text-red-400">
                  {stats.expired}
                </div>
                <div className="text-xs text-muted-foreground">期限切れ</div>
              </div>

              <div className="flex flex-col items-center gap-1 px-2">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
                  {stats.used}
                </div>
                <div className="text-xs text-muted-foreground">使用完了</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white shadow-lg dark:bg-gray-900">
        <div className="space-y-4 border-b p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">招待一覧</h2>
            <Button onClick={handleOpenModal} className="flex items-center gap-2">
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
              <TableHead className="min-w-[100px]">ステータス</TableHead>
              <TableHead className="min-w-[200px]">説明</TableHead>
              <TableHead className="min-w-[80px]">使用回数</TableHead>
              <TableHead className="min-w-[120px]">有効期限</TableHead>
              <TableHead className="min-w-[120px]">作成日時</TableHead>
              <TableHead className="min-w-[120px]">操作</TableHead>
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
              filteredInvitations.map((invitation) => (
                <TableRow key={invitation.token} className="hover:bg-muted/50">
                  <TableCell>
                    <span className={`font-medium ${getStatusColor(invitation)}`}>
                      {getStatusText(invitation)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <p className="line-clamp-2 text-sm">{invitation.description || '説明なし'}</p>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="font-mono">{invitation.usageCount}</span>
                      {invitation.maxUses && (
                        <span className="text-muted-foreground">/{invitation.maxUses}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {invitation.expiresAt ? (
                      <span className="text-sm">
                        {format(new Date(invitation.expiresAt), 'MM/dd', { locale: ja })}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">なし</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(invitation.createdAt), 'MM/dd HH:mm', { locale: ja })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyUrl(invitation.token)}
                        className="h-8 w-8 p-0"
                        title="URLをコピー"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>

                      {invitation.isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (
                              window.confirm(
                                'この招待を無効化しますか？\nこの操作は取り消せません。'
                              )
                            ) {
                              handleDeactivate(invitation.token);
                            }
                          }}
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-100 hover:text-red-700 dark:text-red-400"
                          title="無効化"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <InvitationModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSave} />
    </div>
  );
}
