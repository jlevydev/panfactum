export function dateToUnixSeconds(date: Date): number;
export function dateToUnixSeconds(date: Date | null): number | null;
export function dateToUnixSeconds (date: Date | null): number | null {
  if (date === null) {
    return null
  }
  return Math.floor(date.getTime() / 1000)
}
