// Format a date/time value as 'YYYY-MM-DD HH:mm:ss' in local time
// Accepts Date | string | number; returns '' for invalid/empty values
export function formatDateTime(
  input: Date | string | number | null | undefined,
): string {
  if (input == null) return ''
  const d = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(d.getTime())) return ''

  const pad = (n: number) => (n < 10 ? `0${n}` : String(n))
  const y = d.getFullYear()
  const M = pad(d.getMonth() + 1)
  const D = pad(d.getDate())
  const h = pad(d.getHours())
  const m = pad(d.getMinutes())
  const s = pad(d.getSeconds())
  return `${y}-${M}-${D} ${h}:${m}:${s}`
}

