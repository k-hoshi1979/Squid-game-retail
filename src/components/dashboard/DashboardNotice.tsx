"use client";

import { useSearchParams } from "next/navigation";

export function DashboardNotice() {
  const params = useSearchParams();
  const rented = params.get("rented");
  const ibAdded = params.get("ibAdded");
  const ibEdited = params.get("ibEdited");

  if (rented) {
    return (
      <div className="mx-4 sm:mx-6 mt-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300">
        貸出完了（注文ID: {decodeURIComponent(rented)}）
      </div>
    );
  }

  if (ibAdded) {
    return (
      <div className="mx-4 sm:mx-6 mt-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300">
        IBチケットを追加しました
      </div>
    );
  }

  if (ibEdited) {
    return (
      <div className="mx-4 sm:mx-6 mt-4 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300">
        IBチケットの合計値を修正しました
      </div>
    );
  }

  return null;
}
