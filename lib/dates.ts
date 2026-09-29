import { addDays, differenceInCalendarDays, endOfWeek, format, isBefore, isEqual, parseISO, startOfWeek } from "date-fns";
import type { Completion, DeadlineState, Listing, ReportItem } from "./types";

export const APP_TIME_ZONE = "America/Vancouver";
export const BASE_MILESTONES = [7, 14, 21, 30, 45, 60, 90, 120, 150, 180] as const;

export const parseDate = (value: string) => {
  if (value.includes("/")) {
    const parts = value.split("/");
    if (parts.length === 3) {
      // Handle MM/DD/YYYY
      const [m, d, y] = parts;
      return parseISO(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}T12:00:00`);
    }
  }
  return parseISO(`${value}T12:00:00`);
};

export const dateKey = (date: Date) => format(date, "yyyy-MM-dd");

export function getTodayKey(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;

  if (y && m && day) {
    return `${y}-${m}-${day}`;
  }
  return format(now, "yyyy-MM-dd");
}

export function getMilestones(throughDays: number): number[] {
  const limit = Math.max(180, throughDays);
  const values = [...BASE_MILESTONES] as number[];
  for (let day = 210; day <= limit; day += 30) {
    values.push(day);
  }
  return values;
}

export const getReportDate = (listedDate: string, milestone: number) =>
  dateKey(addDays(parseDate(listedDate), milestone));

export const getReviewDate = (reportDate: string) =>
  dateKey(addDays(parseDate(reportDate), -1));

export const getDaysOnMarket = (listedDate: string, today = getTodayKey()) =>
  Math.max(0, differenceInCalendarDays(parseDate(today), parseDate(listedDate)));

export function getDeadlineStatus(reviewDate: string, today = getTodayKey()): DeadlineState {
  const review = parseDate(reviewDate);
  const current = parseDate(today);
  const tomorrow = addDays(current, 1);

  if (isBefore(review, current)) return "overdue";
  if (isEqual(review, current)) return "today";
  if (isEqual(review, tomorrow)) return "tomorrow";
  return "upcoming";
}

export function getReportTimeline(
  listing: Listing,
  completions: Completion[],
  futureCount = 5,
  today = getTodayKey()
): ReportItem[] {
  const completed = new Map(
    completions.filter((c) => c.listing_id === listing.id).map((c) => [c.milestone_days, c])
  );
  const dom = getDaysOnMarket(listing.listed_date, today);
  const milestones = getMilestones(dom + futureCount * 30 + 210);
  const pastOrComplete = milestones.filter((m) => m <= dom + 1 || completed.has(m));
  const remaining = milestones.filter((m) => !completed.has(m) && m > dom + 1).slice(0, futureCount);

  return [...new Set([...pastOrComplete, ...remaining])]
    .sort((a, b) => a - b)
    .map((m) => {
      const reportDate = getReportDate(listing.listed_date, m);
      const reviewDate = getReviewDate(reportDate);
      const completion = completed.get(m);
      return {
        listing,
        milestone: m,
        reportDate,
        reviewDate,
        state: completion ? "completed" : getDeadlineStatus(reviewDate, today),
        completion,
      };
    });
}

export function getReportsInRange(
  listing: Listing,
  completions: Completion[],
  start: string,
  end: string,
  today = getTodayKey()
): ReportItem[] {
  const completed = new Map(
    completions.filter((c) => c.listing_id === listing.id).map((c) => [c.milestone_days, c])
  );
  const through = Math.max(180, differenceInCalendarDays(parseDate(end), parseDate(listing.listed_date)) + 1);

  return getMilestones(through)
    .map((milestone) => {
      const reportDate = getReportDate(listing.listed_date, milestone);
      const reviewDate = getReviewDate(reportDate);
      const completion = completed.get(milestone);
      return {
        listing,
        milestone,
        reportDate,
        reviewDate,
        state: completion ? ("completed" as const) : getDeadlineStatus(reviewDate, today),
        completion,
      };
    })
    .filter((report) => report.reviewDate >= start && report.reviewDate <= end);
}

export function getNextReport(listing: Listing, completions: Completion[], today = getTodayKey()) {
  return getReportTimeline(listing, completions, 8, today).find((r) => r.state !== "completed");
}

export function activeReports(
  listings: Listing[],
  completions: Completion[],
  today = getTodayKey(),
  futureDays = 14
) {
  return listings
    .filter((l) => l.tracking_enabled)
    .flatMap((l) => getReportTimeline(l, completions, 8, today))
    .filter(
      (r) =>
        r.state !== "completed" &&
        differenceInCalendarDays(parseDate(r.reviewDate), parseDate(today)) <= futureDays
    )
    .sort((a, b) => a.reviewDate.localeCompare(b.reviewDate));
}

export const weekBounds = (dateKeyValue: string) => ({
  start: dateKey(startOfWeek(parseDate(dateKeyValue), { weekStartsOn: 1 })),
  end: dateKey(endOfWeek(parseDate(dateKeyValue), { weekStartsOn: 1 })),
});

export const displayDate = (value: string, pattern = "MMM d") =>
  format(parseDate(value), pattern);
