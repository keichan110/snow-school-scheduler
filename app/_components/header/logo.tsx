"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

/**
 * アプリケーションロゴコンポーネント
 * 全てのHeaderで共通して使用されるロゴ表示
 */
export function Logo() {
  const router = useRouter();

  const handlePrefetch = useCallback(
    (href: string) => {
      if (!href) {
        return;
      }
      router.prefetch(href);
    },
    [router]
  );

  return (
    <Link
      className="flex items-center space-x-2"
      href="/"
      onFocus={() => handlePrefetch("/")}
      onMouseEnter={() => handlePrefetch("/")}
      prefetch
    >
      <div className="flex items-center justify-center">
        <Image
          alt="logo"
          className="h-8 w-8"
          height={32}
          src="/icon.svg"
          width={32}
        />
      </div>
      <div className="flex items-center">
        <h1 className="font-bold text-foreground text-xl">Fuyugyō</h1>
      </div>
    </Link>
  );
}
