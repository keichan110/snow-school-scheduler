"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/app/_providers/auth";
import {
  getAvailableInstructors,
  getMyInstructorProfile,
} from "@/lib/actions/user-instructor-linkage";
import type {
  AuthenticatedUser,
  InstructorBasicInfo,
  UserInstructorProfile,
} from "@/types/actions";
import { HeaderMenuDrawer } from "./header/header-menu-drawer";
import { HeaderShell } from "./header/header-shell";
import { HeaderUserDropdown } from "./header/header-user-dropdown";

/**
 * 認証済みルート用Headerコンポーネント
 *
 * MEMBER以上の権限を持つユーザー向けに、権限に応じた機能を表示。
 * - MEMBER: ロゴ + ユーザードロップダウン
 * - MANAGER+: ロゴ + 管理メニューDrawer + ユーザードロップダウン
 *
 * サーバーから渡されたユーザー情報をフォールバックとしつつ、
 * クライアント側の認証状態変更(updateDisplayName, logout等)に即座に反応する。
 */
type HeaderAuthenticatedProps = {
  /** サーバー側で取得済みのユーザー情報(フォールバック用) */
  user: AuthenticatedUser;
};

export function HeaderAuthenticated({
  user: serverUser,
}: HeaderAuthenticatedProps) {
  // クライアント側の最新認証状態を購読
  const { user: clientUser } = useAuth();

  // クライアント状態が利用可能ならそちらを優先、なければサーバーデータを使用
  const currentUser = (clientUser ?? serverUser) as AuthenticatedUser;

  // インストラクター情報の状態管理
  const [instructorProfile, setInstructorProfile] =
    useState<UserInstructorProfile | null>(null);
  const [availableInstructors, setAvailableInstructors] = useState<
    InstructorBasicInfo[]
  >([]);

  // インストラクター情報の取得
  const fetchInstructorData = useCallback(async () => {
    const [profileResult, instructorsResult] = await Promise.all([
      getMyInstructorProfile(),
      getAvailableInstructors(),
    ]);

    if (profileResult.success) {
      setInstructorProfile(profileResult.data);
    }

    if (instructorsResult.success) {
      setAvailableInstructors(instructorsResult.data);
    }
  }, []);

  useEffect(() => {
    fetchInstructorData().catch(() => {
      // エラーは無視（必要に応じて通知UIを実装）
    });
  }, [fetchInstructorData]);

  // MANAGER以上の権限チェック
  const hasManagerAccess =
    currentUser.role === "MANAGER" || currentUser.role === "ADMIN";

  return (
    <HeaderShell
      leftSlot={
        hasManagerAccess ? <HeaderMenuDrawer user={currentUser} /> : undefined
      }
      rightSlot={
        <HeaderUserDropdown
          availableInstructors={availableInstructors}
          instructorProfile={instructorProfile}
          onRefreshInstructorData={fetchInstructorData}
          user={currentUser}
        />
      }
    />
  );
}
