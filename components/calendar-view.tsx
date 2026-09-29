"use client";

import React, { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useDemoStore } from "@/lib/store";
import { dateKey, displayDate, getReportsInRange, getTodayKey, parseDate } from "@/lib/dates";
import { StatusBadge } from "./status-badge";
import { CompleteButton } from "./complete-button";
import Link from "next/link";

const weekdays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

const eventStyles = {
  overdue: "border-red-200 bg-red-50 text-red-900",
  today: "border-orange-300 bg-orange-50 text-orange-950 font-semibold",
  tomorrow: "border-amber-200 bg-amber-50 text-amber-950",
  upcoming: "border-blue-200 bg-blue-50 text-blue-950",
  completed: "border-emerald-300 bg-emerald-100 text-emerald-950 opacity-80",
};

export function CalendarView() {
  const { listings, completions } = useDemoStore();
  const today = getTodayKey();
  const [focus, setFocus] = useState(today);
  const [showCompleted, setShowCompleted] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthStart = startOfMonth(parseDate(focus));
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 });

  const start = dateKey(gridStart);
  const end = dateKey(gridEnd);
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const currentMonth = focus.slice(0, 7);

  const reports = useMemo(
    () =>
      listings
        .filter((l) => l.tracking_enabled)
        .flatMap((l) => getReportsInRange(l, completions, start, end, today))
        .filter((r) => showCompleted || r.state !== "completed")
        .sort((a, b) => a.listing.address.localeCompare(b.listing.address)),
    [listings, completions, start, end, today, showCompleted]
  );

  const selectedReports = selectedDate
    ? reports.filter((r) => r.reviewDate === selectedDate)
    : [];

  function move(amount: number) {
    setFocus(dateKey(addMonths(monthStart, amount)));
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">Operations Calendar</p>
          <h1 className="text-2xl font-bold md:text-3xl text-slate-900">
            {displayDate(focus, "MMMM yyyy")}
          </h1>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 select-none cursor-pointer">
          <input
            type="checkbox"
            className="rounded border-slate-300 text-forest focus:ring-forest"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
          />
          Show completed milestones
        </label>
      </div>

      {/* Calendar Controls */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          className="btn-secondary p-2"
          aria-label="Previous month"
          onClick={() => move(-1)}
        >
          <ChevronLeft size={18} />
        </button>
        <button
          className="btn-secondary text-xs font-semibold px-3"
          onClick={() => {
            setFocus(today);
            setSelectedDate(today);
          }}
        >
          Today
        </button>
        <button
          className="btn-secondary p-2"
          aria-label="Next month"
          onClick={() => move(1)}
        >
          <ChevronRight size={18} />
        </button>
        <span className="ml-2 text-xs text-slate-500">
          Click any date block to inspect its scheduled reviews.
        </span>
      </div>

      {/* Desktop Calendar Grid */}
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {weekdays.map((day) => (
            <div
              key={day}
              className="px-2 py-2 text-center text-xs font-bold tracking-wider text-slate-500"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day) => {
            const key = dateKey(day);
            const items = reports.filter((r) => r.reviewDate === key);
            const outside = key.slice(0, 7) !== currentMonth;
            const isToday = key === today;

            return (
              <button
                type="button"
                onClick={() => setSelectedDate(key)}
                key={key}
                className={`min-h-36 border-b border-r border-slate-100 p-1.5 text-left transition hover:bg-slate-50/90 focus:z-10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-forest ${
                  outside ? "bg-slate-50/50" : "bg-white"
                } ${isToday ? "bg-emerald-50/40 ring-2 ring-inset ring-forest" : ""}`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-full text-xs ${
                      isToday
                        ? "bg-forest font-bold text-white shadow"
                        : outside
                        ? "text-slate-400"
                        : "font-semibold text-slate-700"
                    }`}
                  >
                    {displayDate(key, "d")}
                  </span>
                  {isToday && (
                    <span className="text-[10px] font-extrabold text-forest uppercase tracking-wider bg-forest/10 px-1 rounded">
                      TODAY
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  {items.map((r) => (
                    <div
                      key={`${r.listing.id}-${r.milestone}`}
                      className={`block rounded border px-1.5 py-1 text-xs transition ${
                        eventStyles[r.state]
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate font-bold text-[11px]">
                          {r.listing.address}
                        </span>
                        {r.state === "completed" && (
                          <span className="shrink-0 text-[10px] font-bold text-emerald-800">
                            ✓
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between gap-1 text-[10px] opacity-85">
                        <span>{r.milestone}-Day</span>
                        <span>Rpt {displayDate(r.reportDate, "MMM d")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Calendar Feed */}
      <div className="space-y-3 md:hidden">
        {days
          .filter((day) => {
            const key = dateKey(day);
            return (
              key.slice(0, 7) === currentMonth &&
              (reports.some((r) => r.reviewDate === key) || key === today)
            );
          })
          .map((day) => {
            const key = dateKey(day);
            const items = reports.filter((r) => r.reviewDate === key);
            const isToday = key === today;

            return (
              <button
                type="button"
                onClick={() => setSelectedDate(key)}
                className={`card block w-full p-4 text-left shadow-sm ${
                  isToday ? "ring-2 ring-forest bg-emerald-50/30" : ""
                }`}
                key={key}
              >
                <div className="mb-3 flex justify-between items-center">
                  <b className="text-slate-900">{displayDate(key, "EEEE, MMMM d")}</b>
                  {isToday && (
                    <span className="text-xs font-bold text-forest bg-forest/10 px-2 py-0.5 rounded">
                      TODAY
                    </span>
                  )}
                </div>

                {items.length === 0 ? (
                  <p className="text-xs text-slate-400">No review deadlines today</p>
                ) : (
                  <div className="space-y-2">
                    {items.map((r) => (
                      <div
                        className={`rounded-lg border p-2.5 ${eventStyles[r.state]}`}
                        key={`${r.listing.id}-${r.milestone}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <b className="text-xs">{r.listing.address}</b>
                          {r.state === "completed" && (
                            <span className="shrink-0 text-xs font-bold">✓ Done</span>
                          )}
                        </div>
                        <p className="text-[11px] mt-0.5">
                          {r.milestone}-Day Report · Official {displayDate(r.reportDate)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </button>
            );
          })}
      </div>

      {reports.length === 0 && (
        <div className="mt-6 text-center text-slate-500 card p-8">
          No final review deadlines scheduled for this month.
        </div>
      )}

      {/* Date Inspection Modal */}
      {selectedDate && (
        <div
          className="fixed inset-0 z-40 grid place-items-center bg-black/50 p-4 backdrop-blur-sm animate-fadeIn"
          onMouseDown={() => setSelectedDate(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Reports for ${displayDate(selectedDate, "MMMM d, yyyy")}`}
            className="card max-h-[85vh] w-full max-w-2xl overflow-y-auto p-5 md:p-6 shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4 border-b pb-3">
              <div>
                <p className="label">Final Review Deadlines</p>
                <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                  {displayDate(selectedDate, "EEEE, MMMM d, yyyy")}
                </h2>
                {selectedDate === today && (
                  <p className="mt-1 text-xs font-bold text-forest bg-forest/10 inline-block px-2 py-0.5 rounded">
                    TODAY&apos;S DEADLINES
                  </p>
                )}
              </div>
              <button
                className="rounded-lg p-2 hover:bg-slate-100 text-slate-500"
                aria-label="Close"
                onClick={() => setSelectedDate(null)}
              >
                <X size={20} />
              </button>
            </div>

            {selectedReports.length === 0 ? (
              <div className="rounded-lg bg-slate-50 p-8 text-center text-slate-500 border border-slate-200">
                No final review deadlines on this date.
              </div>
            ) : (
              <div className="space-y-3">
                {selectedReports.map((r) => (
                  <article
                    className={`rounded-xl border p-4 ${eventStyles[r.state]}`}
                    key={`${r.listing.id}-${r.milestone}`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <b className="text-base text-slate-900">{r.listing.address}</b>
                          <StatusBadge state={r.state} />
                        </div>
                        <p className="text-xs text-slate-600">
                          MLS {r.listing.mls_number} · {r.milestone}-Day Market Report
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs bg-white/60 p-2 rounded-lg border border-slate-200/60">
                        <div>
                          <span className="label text-[10px]">Final Review</span>
                          <div className="font-bold text-slate-900">
                            {displayDate(r.reviewDate, "MMM d")}
                          </div>
                        </div>
                        <div className="border-l border-slate-200 pl-3">
                          <span className="label text-[10px]">Official Report</span>
                          <div className="font-bold text-slate-900">
                            {displayDate(r.reportDate, "MMM d")}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200/50 pt-3">
                      <Link className="btn-secondary text-xs" href={`/listings/${r.listing.id}`}>
                        View Timeline
                      </Link>
                      {r.state !== "completed" && (
                        <div className="flex-1 min-w-[180px]">
                          <CompleteButton
                            listingId={r.listing.id}
                            address={r.listing.address}
                            milestone={r.milestone}
                            reviewDate={r.reviewDate}
                            reportDate={r.reportDate}
                          />
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
