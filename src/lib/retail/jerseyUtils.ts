import type { JerseyRentalType, JerseySize } from "@/types/database";

export const SIZES: JerseySize[] = ["S", "M", "L"];

export function buildSessionStartAt(
  businessDate: string,
  hour: number,
  minute: number,
): string {
  const h = String(hour).padStart(2, "0");
  const m = String(minute).padStart(2, "0");
  return `${businessDate}T${h}:${m}:00+09:00`;
}

export function formatTimeJst(iso: string): string {
  return new Date(iso).toLocaleTimeString("ja-JP", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function rentalTypeLabel(type: JerseyRentalType): string {
  return type === "normal" ? "通常" : "SNS";
}
