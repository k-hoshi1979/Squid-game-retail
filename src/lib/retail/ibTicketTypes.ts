import type { IbTicketType } from "@/types/database";

/** IB券種の固定単価（daily-report と同一） */
export const IB_UNIT_PRICE: Record<IbTicketType, number> = {
  gen_weekday: 4230,
  gen_holiday: 4430,
  child_weekday: 3630,
  child_holiday: 3830,
  gen_vip_weekday: 6230,
  gen_vip_holiday: 6430,
  child_vip_weekday: 5630,
  child_vip_holiday: 5830,
  vip: 2330,
};

export type IbTicketFieldDef = {
  ticketType: IbTicketType;
  label: string;
  totalKey: keyof IbTicketTotals;
  unitPrice: number;
};

export type IbTicketTotals = {
  gen_weekday_count: number;
  gen_holiday_count: number;
  child_weekday_count: number;
  child_holiday_count: number;
  gen_vip_weekday_count: number;
  gen_vip_holiday_count: number;
  child_vip_weekday_count: number;
  child_vip_holiday_count: number;
  vip_count: number;
};

export const EMPTY_IB_TOTALS: IbTicketTotals = {
  gen_weekday_count: 0,
  gen_holiday_count: 0,
  child_weekday_count: 0,
  child_holiday_count: 0,
  gen_vip_weekday_count: 0,
  gen_vip_holiday_count: 0,
  child_vip_weekday_count: 0,
  child_vip_holiday_count: 0,
  vip_count: 0,
};

/** 平日行（貸切VIP は平日/休日で料金同一のため独立） */
export const IB_WEEKDAY_FIELDS: IbTicketFieldDef[] = [
  { ticketType: "gen_weekday", label: "一般", totalKey: "gen_weekday_count", unitPrice: IB_UNIT_PRICE.gen_weekday },
  { ticketType: "child_weekday", label: "子供", totalKey: "child_weekday_count", unitPrice: IB_UNIT_PRICE.child_weekday },
  { ticketType: "gen_vip_weekday", label: "一般VIP", totalKey: "gen_vip_weekday_count", unitPrice: IB_UNIT_PRICE.gen_vip_weekday },
  { ticketType: "child_vip_weekday", label: "子供VIP", totalKey: "child_vip_weekday_count", unitPrice: IB_UNIT_PRICE.child_vip_weekday },
];

export const IB_HOLIDAY_FIELDS: IbTicketFieldDef[] = [
  { ticketType: "gen_holiday", label: "一般", totalKey: "gen_holiday_count", unitPrice: IB_UNIT_PRICE.gen_holiday },
  { ticketType: "child_holiday", label: "子供", totalKey: "child_holiday_count", unitPrice: IB_UNIT_PRICE.child_holiday },
  { ticketType: "gen_vip_holiday", label: "一般VIP", totalKey: "gen_vip_holiday_count", unitPrice: IB_UNIT_PRICE.gen_vip_holiday },
  { ticketType: "child_vip_holiday", label: "子供VIP", totalKey: "child_vip_holiday_count", unitPrice: IB_UNIT_PRICE.child_vip_holiday },
];

/** 貸切VIP（平日/休日に依存しない） */
export const IB_VIP_FIELD: IbTicketFieldDef = {
  ticketType: "vip",
  label: "貸切VIP",
  totalKey: "vip_count",
  unitPrice: IB_UNIT_PRICE.vip,
};

export function rowToTotals(row: IbTicketTotals | null | undefined): IbTicketTotals {
  if (!row) return { ...EMPTY_IB_TOTALS };
  return {
    gen_weekday_count: row.gen_weekday_count,
    gen_holiday_count: row.gen_holiday_count,
    child_weekday_count: row.child_weekday_count,
    child_holiday_count: row.child_holiday_count,
    gen_vip_weekday_count: row.gen_vip_weekday_count,
    gen_vip_holiday_count: row.gen_vip_holiday_count,
    child_vip_weekday_count: row.child_vip_weekday_count,
    child_vip_holiday_count: row.child_vip_holiday_count,
    vip_count: row.vip_count,
  };
}
