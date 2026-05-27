import type { Metadata } from "next";
import { JerseyPageShell } from "@/components/jerseys/JerseyPageShell";
import { IbTicketEditForm } from "@/components/ib-tickets/IbTicketEditForm";
import { formatBusinessDateJa, getBusinessDateString } from "@/lib/retail/businessDate";
import { fetchIbTicketDailyTotals } from "@/lib/retail/ibTickets";

export const metadata: Metadata = { title: "IBチケット購入：修正" };
export const dynamic = "force-dynamic";

export default async function IbTicketEditPage() {
  const businessDate = getBusinessDateString();
  const { totals } = await fetchIbTicketDailyTotals(businessDate);

  return (
    <JerseyPageShell title="IBチケット購入：修正">
      <IbTicketEditForm
        dateLabel={formatBusinessDateJa(businessDate)}
        initialTotals={totals}
      />
    </JerseyPageShell>
  );
}
