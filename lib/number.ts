export function toNumber(raw: any): number {
  if (raw == null) return 0
  if (typeof raw === 'number') return raw
  if (typeof raw === 'string') return parseFloat(raw) || 0
  if (typeof raw?.toNumber === 'function') return raw.toNumber()
  return Number(raw) || 0
}
