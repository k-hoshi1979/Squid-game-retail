const TZ = "Asia/Tokyo";

/** 営業日（JST 0時切り替え）を YYYY-MM-DD で返す */
export function getBusinessDateString(at: Date = new Date()): string {
  return at.toLocaleDateString("en-CA", { timeZone: TZ });
}

/** ダッシュボード表示用: 2026年5月24日 */
export function formatBusinessDateJa(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${y}年${m}月${d}日`;
}
