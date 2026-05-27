import type { Metadata } from "next";
import { JerseyPageShell } from "@/components/jerseys/JerseyPageShell";
import { IbTicketAddForm } from "@/components/ib-tickets/IbTicketAddForm";
import { formatBusinessDateJa, getBusinessDateString } from "@/lib/retail/businessDate";
import { getDayKind } from "@/lib/retail/holiday";

export const metadata: Metadata = { title: "IBチケット購入：追加" };
export const dynamic = "force-dynamic";

export default async function IbTicketAddPage() {
  const businessDate = getBusinessDateString();
  const dayKind = getDayKind(businessDate);

  return (
    <JerseyPageShell title="IBチケット購入：追加">
      <IbTicketAddForm
        dateLabel={formatBusinessDateJa(businessDate)}
        dayKind={dayKind}
      />
    </JerseyPageShell>
  );
}
