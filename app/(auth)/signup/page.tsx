"use client";

import { Loader2, Shield, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LineLoginButton } from "@/components/ui/line-login-button";
import { useAuth } from "@/contexts/auth-context";

/**
 * サインアップページ
 * 招待トークンを利用したLINE認証による新規登録機能を提供
 * URLパラメータから招待コードを自動取得して使用
 */
export default function SignupPage() {
  const router = useRouter();
  const { status, user } = useAuth();
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [hasInvite, setHasInvite] = useState(false);

  /**
   * 既に認証済みの場合はホームページにリダイレクト
   */
  useEffect(() => {
    if (status === "authenticated" && user) {
      router.push("/");
    }
  }, [status, user, router]);

  /**
   * URLパラメータから招待トークンを取得
   */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const inviteParam = urlParams.get("invite");

      if (inviteParam) {
        setInviteToken(inviteParam);
        setHasInvite(true);
      }
    }
  }, []);

  /**
   * LINE認証による新規登録開始
   */
  const handleLineSignup = () => {
    try {
      setIsSigningUp(true);
      setError(null);

      // 招待トークンがある場合はURLパラメータとして追加
      const loginUrl = inviteToken
        ? `/api/auth/line/login?invite=${encodeURIComponent(inviteToken)}`
        : "/api/auth/line/login";

      // 直接APIエンドポイントにナビゲート（302リダイレクトを受け入れる）
      window.location.href = loginUrl;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "新規登録に失敗しました";
      setError(errorMessage);
      setIsSigningUp(false);
    }
  };

  /**
   * 認証中の場合は読み込み画面を表示
   */
  if (status === "loading") {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">認証状態を確認しています...</p>
        </div>
      </div>
    );
  }

  /**
   * 認証済みの場合は何も表示しない（リダイレクト処理中）
   */
  if (status === "authenticated") {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">
            ホームページにリダイレクトしています...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* メインログインカード */}
        <Card className="border-0 bg-card/50 shadow-lg backdrop-blur-sm">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <CardTitle className="font-bold text-2xl">新規登録</CardTitle>
              <CardDescription className="text-center">
                {hasInvite ? (
                  <>
                    <span className="font-medium text-lg text-primary">
                      ようこそ！
                    </span>
                    <br />
                    スキー・スノーボードスクール
                    <br />
                    シフト管理システムへ招待されています
                  </>
                ) : (
                  <>
                    スキー・スノーボードスクール
                    <br />
                    シフト管理システム
                  </>
                )}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 招待情報表示 */}
            {hasInvite && (
              <Alert className="border-primary/20 bg-primary/5">
                <Users className="h-4 w-4" />
                <AlertDescription>
                  <strong>招待を受け取りました</strong>
                  <br />
                  LINEアカウントで新規登録してシステムをご利用いただけます。
                </AlertDescription>
              </Alert>
            )}

            {/* エラー表示 */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* LINE新規登録ボタン */}
            {isSigningUp ? (
              <Button
                className="w-full bg-[#06C755] text-white disabled:opacity-50"
                disabled
                size="lg"
              >
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                登録中...
              </Button>
            ) : (
              <LineLoginButton
                className="w-full"
                onClick={handleLineSignup}
                size="lg"
                text="Sign up"
              />
            )}

            {/* 説明テキスト */}
            <div className="space-y-2 text-center text-muted-foreground text-sm">
              <p>
                {hasInvite
                  ? "招待コードの入力は不要です。LINEアカウントで新規登録してご利用いただけます。"
                  : "LINEアカウントで新規登録することで、シフト管理機能をご利用いただけます。"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 注意事項 */}
        <div className="text-center text-muted-foreground text-xs">
          <p>
            新規登録することで、
            <br />
            <a
              className="text-primary hover:underline"
              href="/terms"
              rel="noopener noreferrer"
              target="_blank"
            >
              利用規約
            </a>
            と
            <a
              className="text-primary hover:underline"
              href="/privacy"
              rel="noopener noreferrer"
              target="_blank"
            >
              プライバシーポリシー
            </a>
            に同意したものとみなします。
          </p>
        </div>
      </div>
    </div>
  );
}
