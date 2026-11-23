export function getTodayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseISOParts(isoDate: string): [number, number, number] | null {
  const parts = isoDate.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return null;
  }
  return [parts[0], parts[1], parts[2]];
}

export function toISODate(year: number, month1to12: number, day: number): string {
  const y = String(year).padStart(4, '0');
  const m = String(month1to12).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function offsetDaysISO(baseISO: string, deltaDays: number): string {
  const parsed = parseISOParts(baseISO);
  if (!parsed) return baseISO;
  const utc = Date.UTC(parsed[0], parsed[1] - 1, parsed[2] + deltaDays);
  const d = new Date(utc);
  return toISODate(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

export function getDaysInMonth(year: number, month1to12: number): number {
  return new Date(Date.UTC(year, month1to12, 0)).getUTCDate();
}

/**
 * Retourne 0 pour Lundi ... 6 pour Dimanche (sans decalage de fuseau horaire)
 */
export function getWeekdayMondayFirst(
  year: number,
  month1to12: number,
  day: number
): number {
  const jsDay = new Date(Date.UTC(year, month1to12 - 1, day)).getUTCDay(); // 0=Dim..6=Sam
  return (jsDay + 6) % 7;
}

const MOIS_FR = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

export function formatMonthYearFR(year: number, month1to12: number): string {
  const label = MOIS_FR[month1to12 - 1] || '';
  return `${label} ${year}`;
}

export function formatDateFR(isoDate?: string): string {
  if (!isoDate) return '-';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const [year, month, day] = parts;
  if (!year || !month || !day) return isoDate;
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
}

export function formatNombre(
  value: number | null | undefined,
  decimals = 0
): string {
  if (value === null || value === undefined || Number.isNaN(value) || !Number.isFinite(value)) {
    return '-';
  }
  const factor = Math.pow(10, decimals);
  const rounded = Math.round(value * factor) / factor;
  const isNegative = rounded < 0;
  const abs = Math.abs(rounded);
  const fixed = abs.toFixed(decimals);
  const [intPart, decPart] = fixed.split('.');
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const sign = isNegative && rounded !== 0 ? '-' : '';
  if (decimals > 0 && decPart) {
    return `${sign}${formattedInt},${decPart}`;
  }
  return `${sign}${formattedInt}`;
}

export function formatFCFA(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value) || !Number.isFinite(value)) {
    return '-';
  }
  const rounded = Math.round(value);
  const isNegative = rounded < 0;
  const abs = Math.abs(rounded);
  const formatted = String(abs).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return isNegative && rounded !== 0
    ? `-${formatted} FCFA`
    : `${formatted} FCFA`;
}

export function formatPourcent(
  ratio: number | null | undefined,
  decimals = 1
): string {
  if (ratio === null || ratio === undefined || Number.isNaN(ratio) || !Number.isFinite(ratio)) {
    return '-';
  }
  return `${formatNombre(ratio * 100, decimals)} %`;
}

export function generateId(prefix = 'id'): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function parsePositiveInt(raw: string): number {
  const cleaned = raw.replace(/\s+/g, '').replace(/[^\d]/g, '');
  if (!cleaned) return 0;
  const parsed = parseInt(cleaned, 10);
  return Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
}
