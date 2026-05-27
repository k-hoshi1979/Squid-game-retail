import type { Metadata } from "next";
import { JerseyDetailView } from "@/components/jerseys/JerseyDetailView";
import { JerseyPageShell } from "@/components/jerseys/JerseyPageShell";
import {
  fetchJerseyInventory,
  fetchTodayRentalCount,
  fetchUnreturnedRentals,
} from "@/lib/retail/jerseys";
import { formatBusinessDateJa, getBusinessDateString } from "@/lib/retail/businessDate";

export const metadata: Metadata = { title: "ジャージ詳細" };
export const dynamic = "force-dynamic";

export default async function JerseyDetailPage() {
  const businessDate = getBusinessDateString();
  const [groups, todayCount, unreturned] = await Promise.all([
    fetchJerseyInventory(),
    fetchTodayRentalCount(),
    fetchUnreturnedRentals(),
  ]);

  return (
    <JerseyPageShell title="ジャージ詳細">
      <JerseyDetailView
        businessDateLabel={formatBusinessDateJa(businessDate)}
        todayCount={todayCount}
        groups={groups}
        unreturned={unreturned}
      />
    </JerseyPageShell>
  );
}
