import holiday_jp from "@holiday-jp/holiday_jp";

export type DayKind = "weekday" | "holiday";

/** 土日 + 日本の祝日 → 休日、それ以外 → 平日 */
export function getDayKind(dateStr: string): DayKind {
  const d = new Date(`${dateStr}T12:00:00+09:00`);
  const dow = d.getDay();
  if (dow === 0 || dow === 6) return "holiday";
  if (holiday_jp.isHoliday(d)) return "holiday";
  return "weekday";
}

export function dayKindLabel(kind: DayKind): string {
  return kind === "holiday" ? "休日" : "平日";
}
