const bdtFormatter = new Intl.NumberFormat('en-BD', {
  style: 'currency',
  currency: 'BDT',
  currencyDisplay: 'narrowSymbol',
  maximumFractionDigits: 0,
})

/** Formats a whole-taka integer amount as e.g. "৳4,250". */
export function formatBDT(amount: number): string {
  // Intl's BDT narrow symbol isn't consistently "৳" across environments —
  // pin it explicitly rather than trust locale data.
  return bdtFormatter.format(amount).replace(/^(BDT|Tk|৳)\s?/, '৳')
}

/** Rounded percentage discount between an original and sale price. */
export function discountPercent(compareAtPrice: number, price: number): number {
  if (compareAtPrice <= 0 || price >= compareAtPrice) return 0
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
}
