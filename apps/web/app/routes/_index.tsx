import type { MetaFunction } from "@remix-run/cloudflare";

export const meta: MetaFunction = () => {
  return [
    { title: "Snow School Scheduler" },
    { name: "description", content: "スキー・スノーボードスクールのシフト管理システム" },
  ];
};

export default function Index() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-16">
        <header className="flex flex-col items-center gap-9">
          <h1 className="leading text-2xl font-bold text-gray-800 dark:text-gray-100">
            Snow School Scheduler
          </h1>
          <div className="h-[144px] w-[434px]">
            <div className="flex h-full w-full items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500">
              スキー・スノーボードスクール<br />
              シフト管理システム
            </div>
          </div>
        </header>
      </div>
    </div>
  );
}