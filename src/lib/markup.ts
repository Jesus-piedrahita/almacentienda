function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

export function priceFromMarkup(cost: number, markupPct: number): number | null {
  if (cost <= 0 || !Number.isFinite(cost) || !Number.isFinite(markupPct)) {
    return null;
  }

  return roundToTwoDecimals(cost * (1 + markupPct / 100));
}

export function markupFromPrice(cost: number, price: number): number | null {
  if (cost <= 0 || !Number.isFinite(cost) || !Number.isFinite(price)) {
    return null;
  }

  return roundToTwoDecimals(((price - cost) / cost) * 100);
}

export function formatMarkup(markup: number | null): string {
  if (markup === null) {
    return '';
  }

  return Number.isInteger(markup) ? String(markup) : markup.toFixed(2);
}
