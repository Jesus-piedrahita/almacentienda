export function toApiStartDate(date: string): string {
  return `${date}T00:00:00`;
}

export function toApiEndDate(date: string): string {
  return `${date}T23:59:59`;
}
