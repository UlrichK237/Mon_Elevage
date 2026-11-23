export function getTodayISO(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function offsetDaysISO(baseISO: string, deltaDays: number): string {
  const parts = baseISO.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return baseISO;
  }
  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  date.setDate(date.getDate() + deltaDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
