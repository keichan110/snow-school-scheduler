import {
  PersonSimpleSki,
  PersonSimpleSnowboard,
  SealCheck,
} from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent } from "@/components/ui/card";

/**
 * 資格統計データの型定義
 */
type CertificationStats = {
  /** 資格の総数 */
  total: number;
  /** アクティブな資格の数 */
  active: number;
  /** スキー部門の資格数 */
  ski: number;
  /** スノーボード部門の資格数 */
  snowboard: number;
};

/**
 * 資格統計表示コンポーネントのプロパティ
 */
type CertificationStatsProps = {
  /** 表示する統計データ */
  stats: CertificationStats;
};

/**
 * 資格統計表示コンポーネント
 *
 * @remarks
 * Server Component から渡された統計データを視覚的に表示します。
 * アクティブ数、スキー部門数、スノーボード部門数を色分けされたカードで表示します。
 *
 * @param props - コンポーネントのプロパティ
 * @returns 統計カードコンポーネント
 */
export function CertificationStats({ stats }: CertificationStatsProps) {
  return (
    <div className="mb-4 md:mb-6">
      <Card className="mx-auto w-full max-w-md md:mx-0">
        <CardContent className="px-3 py-2">
          <div className="flex items-center justify-center divide-x divide-border">
            <div className="flex items-center gap-2 px-4 py-1">
              <SealCheck
                className="h-4 w-4 text-green-600 dark:text-green-400"
                weight="regular"
              />
              <div className="font-bold text-base text-green-600 dark:text-green-400">
                {stats.active}
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-1">
              <PersonSimpleSki
                className="h-4 w-4 text-blue-600 dark:text-blue-400"
                weight="regular"
              />
              <div className="font-bold text-base text-blue-600 dark:text-blue-400">
                {stats.ski}
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-1">
              <PersonSimpleSnowboard
                className="h-4 w-4 text-amber-600 dark:text-amber-400"
                weight="regular"
              />
              <div className="font-bold text-amber-600 text-base dark:text-amber-400">
                {stats.snowboard}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
