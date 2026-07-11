/** Shared hero / listing → booking query params. */

export type BookingSearchParams = {
  destination?: string;
  from?: string;
  to?: string;
  travelers?: string;
  type?: string;
};

export function parseBookingSearchParams(
  searchParams: URLSearchParams
): BookingSearchParams {
  return {
    destination: searchParams.get("destination") || undefined,
    from: searchParams.get("from") || undefined,
    to: searchParams.get("to") || undefined,
    travelers: searchParams.get("travelers") || undefined,
    type: searchParams.get("type") || undefined,
  };
}

/** ISO date string → `YYYY-MM-DD` for `<input type="date">`. */
export function toDateInputValue(isoOrDate: string | Date | undefined): string {
  if (!isoOrDate) return "";
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function toDateFromParam(iso: string | undefined): Date | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/** Append from/to/travelers onto a path (keeps existing query if any). */
export function withBookingDates(
  path: string,
  params: Pick<BookingSearchParams, "from" | "to" | "travelers">
): string {
  const qs = new URLSearchParams();
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);
  if (params.travelers) qs.set("travelers", params.travelers);
  const q = qs.toString();
  if (!q) return path;
  return path.includes("?") ? `${path}&${q}` : `${path}?${q}`;
}
