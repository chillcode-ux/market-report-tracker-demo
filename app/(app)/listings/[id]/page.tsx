"use client";

import React, { use } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { useDemoStore } from "@/lib/store";
import { displayDate, getDaysOnMarket, getReportTimeline } from "@/lib/dates";
import { StatusBadge } from "@/components/status-badge";
import { CompleteButton } from "@/components/complete-button";

export default function ListingDetailPage({
  params,
}: {
  params: { id: string } | Promise<{ id: string }>;
}) {
  // Handle both resolved and promise params (Next.js 13/14/15 compatibility)
  const resolvedParams = "then" in params ? use(params) : params;
  const { id } = resolvedParams;

  const { listings, completions } = useDemoStore();
  const listing = listings.find((l) => l.id === id);

  if (!listing) {
    return (
      <div className="card p-12 text-center shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">Listing Not Found</h2>
        <p className="mt-2 text-sm text-slate-500">
          The requested property record could not be found in demo memory.
        </p>
        <Link href="/listings" className="btn-primary mt-6">
          <ArrowLeft size={16} />
          Return to Listings
        </Link>
      </div>
    );
  }

  const timeline = getReportTimeline(listing, completions, 6);

  return (
    <>
      <Link
        href="/listings"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest hover:underline"
      >
        <ArrowLeft size={16} />
        Back to Listings Inventory
      </Link>

      {/* Property Overview Card */}
      <div className="card mt-4 p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="label font-mono">MLS {listing.mls_number}</span>
              <span
                className={`rounded px-2 py-0.5 text-xs font-bold ${
                  listing.status === "Active"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {listing.status}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{listing.address}</h1>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                listing.tracking_enabled
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-slate-100 text-slate-600 border border-slate-200"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  listing.tracking_enabled ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                }`}
              />
              Tracking {listing.tracking_enabled ? "ON" : "OFF"}
            </span>
          </div>
        </div>

        <div className="mt-5 grid gap-4 text-xs sm:grid-cols-2 md:grid-cols-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
            <span className="label">Original Listed Date</span>
            <div className="text-sm font-bold text-slate-900 mt-1">
              {displayDate(listing.listed_date, "MMMM d, yyyy")}
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
            <span className="label">Days on Market (DOM)</span>
            <div className="text-sm font-bold text-slate-900 mt-1">
              {getDaysOnMarket(listing.listed_date)} Days
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
            <span className="label">Listing Agent</span>
            <div className="text-sm font-bold text-slate-900 mt-1">
              {listing.agent || "Unassigned"}
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
            <span className="label">Milestones Completed</span>
            <div className="text-sm font-bold text-emerald-700 mt-1">
              {completions.filter((c) => c.listing_id === listing.id).length} Completed
            </div>
          </div>

          {listing.notes && (
            <div className="sm:col-span-2 md:col-span-4 bg-slate-50 p-3 rounded-lg border border-slate-200/80">
              <span className="label">Property Notes</span>
              <p className="text-xs text-slate-700 mt-1">{listing.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Report Timeline */}
      <div className="mb-4 mt-8 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Market Report Timeline</h2>
          <p className="text-xs text-slate-500">
            Recurring schedule automatically derived from the property&apos;s listed date
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {timeline.map((r) => {
          const isDone = r.state === "completed";
          return (
            <div
              className={`card flex flex-col gap-4 p-4 md:flex-row md:items-center shadow-sm transition ${
                isDone ? "bg-slate-50/70 border-slate-200 opacity-90" : "bg-white border-slate-200 hover:border-slate-300"
              }`}
              key={r.milestone}
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {isDone ? (
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  ) : (
                    <Circle size={18} className="text-slate-400 shrink-0" />
                  )}
                  <b className={`text-base ${isDone ? "text-slate-700" : "text-slate-900"}`}>
                    {r.milestone}-Day Market Report
                  </b>
                  <StatusBadge state={r.state} />
                </div>

                {r.completion ? (
                  <div className="text-xs text-slate-600 bg-emerald-50/80 border border-emerald-200/60 rounded px-2.5 py-1.5 mt-2 inline-block">
                    <span className="font-semibold text-emerald-800">
                      ✓ Completed on {displayDate(r.completion.completed_at.slice(0, 10), "MMMM d, yyyy")}
                    </span>
                    {r.completion.notes && (
                      <span className="text-slate-600 ml-1.5">— &quot;{r.completion.notes}&quot;</span>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 mt-1">
                    Scheduled automatic milestone based on {r.milestone} days from listed date.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200 md:min-w-[240px]">
                <div>
                  <span className="label text-[10px]">Final Review</span>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {displayDate(r.reviewDate, "MMM d, yyyy")}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {displayDate(r.reviewDate, "EEEE")}
                  </div>
                </div>
                <div className="border-l border-slate-200 pl-3">
                  <span className="label text-[10px]">Official Report</span>
                  <div className="font-bold text-slate-900 mt-0.5">
                    {displayDate(r.reportDate, "MMM d, yyyy")}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {displayDate(r.reportDate, "EEEE")}
                  </div>
                </div>
              </div>

              {!isDone && (
                <div className="md:min-w-[160px]">
                  <CompleteButton
                    listingId={listing.id}
                    address={listing.address}
                    milestone={r.milestone}
                    reviewDate={r.reviewDate}
                    reportDate={r.reportDate}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
