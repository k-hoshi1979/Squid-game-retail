import type { Metadata } from "next";
import { JerseyPageShell } from "@/components/jerseys/JerseyPageShell";
import { OperationLogList } from "@/components/logs/OperationLogList";
import { formatBusinessDateJa, getBusinessDateString } from "@/lib/retail/businessDate";
import { fetchOperationLogs } from "@/lib/retail/operationLogs";

export const metadata: Metadata = { title: "操作ログ" };
export const dynamic = "force-dynamic";

export default async function LogsPage() {
  const businessDate = getBusinessDateString();
  const logs = await fetchOperationLogs(businessDate);

  return (
    <JerseyPageShell title="操作ログ">
      <OperationLogList
        logs={logs}
        dateLabel={formatBusinessDateJa(businessDate)}
      />
    </JerseyPageShell>
  );
}
