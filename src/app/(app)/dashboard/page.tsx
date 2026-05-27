import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { DashboardNotice } from "@/components/dashboard/DashboardNotice";
import { fetchDashboardStats } from "@/lib/retail/dashboard";
import { formatBusinessDateJa } from "@/lib/retail/businessDate";

export const metadata: Metadata = { title: "ダッシュボード" };

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await fetchDashboardStats();

  return (
    <>
      <Header title="ダッシュボード" description="RETAIL業務の当日サマリ" />
      <Suspense fallback={null}>
        <DashboardNotice />
      </Suspense>
      <DashboardView
        dateLabel={formatBusinessDateJa(stats.businessDate)}
        jerseyNormalCount={stats.jerseyNormalCount}
        jerseySnsCount={stats.jerseySnsCount}
        jerseyTotalCount={stats.jerseyTotalCount}
        unreturnedCount={stats.unreturnedCount}
        needsCleaningCount={stats.needsCleaningCount}
        ibWeekday={stats.ibWeekday}
        ibHoliday={stats.ibHoliday}
        ibVipCount={stats.ibVipCount}
        recentLogCount={stats.recentLogCount}
      />
    </>
  );
}
