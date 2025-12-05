"use client";

import { Calendar } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useShiftsLink } from "@/lib/hooks/use-shifts-link";
import { ShiftCard } from "./shift-card";

type UpcomingShiftsSectionProps = {
  shifts: Array<{
    id: number;
    date: Date;
    department: {
      code: string;
      name: string;
    };
    shiftType: {
      name: string;
    };
  }>;
};

/**
 * インストラクター向け今後のシフト表示セクションコンポーネント
 *
 * @description
 * 認証ユーザーに紐づくインストラクターの今後のシフトをカルーセル形式で表示します。
 * Client Componentとして実装され、shadcn/uiのCarouselコンポーネントを使用しています。
 * シフトがない場合は空状態メッセージを表示します。
 *
 * 表示形式:
 * - デスクトップ: 一度に5つのシフトカードを表示（横並び）
 * - モバイル: 一度に1つのシフトカードを表示（スワイプで切り替え）
 * - 最後に「すべて表示」リンクカードを配置
 *
 * @component
 * @example
 * ```tsx
 * <UpcomingShiftsSection
 *   shifts={[
 *     {
 *       id: 1,
 *       date: new Date('2024-01-15'),
 *       department: { code: 'ski', name: 'スキー' },
 *       shiftType: { name: '午前' }
 *     }
 *   ]}
 * />
 * ```
 */
export function UpcomingShiftsSection({ shifts }: UpcomingShiftsSectionProps) {
  const shiftsLink = useShiftsLink();

  // シフトがない場合の表示
  if (shifts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <CardTitle>今後のシフト</CardTitle>
          </div>
          <CardDescription>直近の予定されたシフトを表示します</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            現在、予定されているシフトはありません
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <CardTitle>今後のシフト</CardTitle>
        </div>
        <CardDescription>直近の予定されたシフトを表示します</CardDescription>
      </CardHeader>
      <CardContent>
        <Carousel
          className="w-full px-12"
          opts={{
            align: "start",
            loop: false,
          }}
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {shifts.map((shift) => (
              <CarouselItem
                className="basis-full pl-2 md:basis-1/5 md:pl-4"
                key={shift.id}
              >
                <ShiftCard shift={shift} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-0" />
          <CarouselNext className="right-0" />
        </Carousel>
        {/* すべてのシフトを見るリンク */}
        <div className="px-12">
          <Link
            className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-muted px-4 py-2 text-muted-foreground text-sm transition-colors hover:bg-muted/80 hover:text-primary"
            href={shiftsLink}
          >
            <Calendar className="h-4 w-4" />
            すべて表示
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
