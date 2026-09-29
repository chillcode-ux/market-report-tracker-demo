"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, CalendarDays, FileText, Plus } from "lucide-react";
import { CompleteButton } from "@/components/complete-button";
import { StatusBadge } from "@/components/status-badge";
import { ListingForm } from "@/components/listing-form";
import { ReportModal } from "@/components/report-modal";
import { ReportDetailView } from "@/components/report-detail-view";
import { useDemoStore } from "@/lib/store";
import { activeReports, displayDate, getTodayKey, weekBounds } from "@/lib/dates";
import type { DeadlineState, Listing, MarketReport } from "@/lib/types";

const cardAccent: Record<DeadlineState, string> = {
  overdue: "border-t-red-500",
  today: "border-t-orange-500",
  tomorrow: "border-t-amber-400",
  upcoming: "border-t-blue-500",
  completed: "border-t-emerald-500",
};

export default function Dashboard() {
  const { listings, completions, marketReports } = useDemoStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [recordingReport, setRecordingReport] = useState<{
    listing: Listing;
    milestone: number;
  } | null>(null);
  const [viewingReport, setViewingReport] = useState<{
    report: MarketReport;
    listing: Listing;
  } | null>(null);

  const today = getTodayKey();
  const reports = activeReports(listings, completions, today, 14);
  const week = weekBounds(today);

  const counts = {
    overdue: reports.filter((r) => r.state === "overdue").length,
    today: reports.filter((r) => r.state === "today").length,
    tomorrow: reports.filter((r) => r.state === "tomorrow").length,
    week: reports.filter((r) => r.reviewDate >= week.start && r.reviewDate <= week.end).length,
    active: listings.filter((l) => l.tracking_enabled).length,
  };

  const getExistingReport = (listingId: string, milestone: number) => {
    return marketReports.find(
      (m) => m.listing_id === listingId && m.milestone_days === milestone
    );
  };

  const getPreviousReport = (listingId: string, milestone: number) => {
    const priorReports = marketReports
      .filter((m) => m.listing_id === listingId && m.milestone_days < milestone)
      .sort((a, b) => b.milestone_days - a.milestone_days);
    return priorReports[0] || null;
  };

  return (
    <>
      {/* Top Banner & Header */}
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">{displayDate(today, "EEEE, MMMM d, yyyy")}</p>
          <h1 className="text-2xl font-bold md:text-3xl text-slate-900">Dashboard</h1>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} />
          Add Listing
        </button>
      </div>

      {/* 5 Priority Counters */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          ["Overdue", counts.overdue, "text-red-600"],
          ["Review Today", counts.today, "text-orange-600"],
          ["Tomorrow", counts.tomorrow, "text-amber-600"],
          ["This Week", counts.week, "text-blue-600"],
          ["Active Listings", counts.active, "text-forest"],
        ].map(([label, value, color]) => (
          <div className="card p-4 shadow-sm" key={String(label)}>
            <div className="label">{label}</div>
            <div className={`mt-2 text-3xl font-black ${color}`}>{value}</div>
          </div>
        ))}
      </section>

      {/* Needs Attention Section */}
      <div className="mb-4 mt-8 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Needs Attention</h2>
          <p className="text-xs text-slate-500">
            Market Reports requiring final review before official report publication
          </p>
        </div>
        <Link
          href="/calendar"
          className="flex items-center gap-1.5 text-sm font-semibold text-forest hover:underline"
        >
          <CalendarDays size={16} />
          View calendar
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="card p-10 text-center shadow-sm">
          <h3 className="text-xl font-bold text-slate-900">You&apos;re caught up!</h3>
          <p className="mt-1 text-sm text-slate-500">
            No Market Reports currently require review. All active milestones are complete.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reports.map((r) => {
            const existingRep = getExistingReport(r.listing.id, r.milestone);
            return (
              <article
                className={`card flex min-h-[340px] flex-col overflow-hidden border-t-4 p-5 shadow-sm transition hover:shadow-md ${
                  cardAccent[r.state]
                }`}
                key={`${r.listing.id}-${r.milestone}`}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <StatusBadge state={r.state} />
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                    {r.milestone}-DAY
                  </span>
                </div>

                <Link
                  href={`/listings/${r.listing.id}`}
                  className="group mb-1 flex items-start justify-between gap-2 text-lg font-bold leading-snug text-slate-900 hover:text-forest"
                >
                  <span>{r.listing.address}</span>
                  <ArrowRight
                    className="mt-0.5 shrink-0 opacity-40 transition group-hover:translate-x-0.5 group-hover:opacity-100"
                    size={18}
                  />
                </Link>

                <p className="mb-4 text-xs text-slate-500 font-medium">
                  MLS {r.listing.mls_number} · Market Report
                </p>

                <div className="mb-5 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 border border-slate-200/80">
                  <div>
                    <div className="label text-[10px]">Final Review</div>
                    <div className="mt-0.5 font-bold text-slate-900">
                      {displayDate(r.reviewDate, "MMM d")}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {displayDate(r.reviewDate, "EEEE")}
                    </div>
                  </div>
                  <div className="border-l border-slate-200 pl-3">
                    <div className="label text-[10px]">Official Report</div>
                    <div className="mt-0.5 font-bold text-slate-900">
                      {displayDate(r.reportDate, "MMM d")}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {displayDate(r.reportDate, "EEEE")}
                    </div>
                  </div>
                </div>

                {/* Action Buttons: Create Report / View Report & Quick Complete */}
                <div className="mt-auto space-y-2 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setRecordingReport({
                          listing: r.listing,
                          milestone: r.milestone,
                        })
                      }
                      className="btn-primary flex-1 text-xs py-2 px-3 font-bold flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <BarChart3 size={14} />
                      <span>{existingRep ? "Edit Report" : "Create Report"}</span>
                    </button>

                    {existingRep && (
                      <button
                        type="button"
                        onClick={() =>
                          setViewingReport({
                            report: existingRep,
                            listing: r.listing,
                          })
                        }
                        className="btn-secondary text-xs py-2 px-3 font-semibold flex items-center gap-1.5"
                        title="View Performance Analytics"
                      >
                        <FileText size={14} className="text-forest" />
                        <span>Metrics</span>
                      </button>
                    )}
                  </div>

                  <CompleteButton
                    listingId={r.listing.id}
                    address={r.listing.address}
                    milestone={r.milestone}
                    reviewDate={r.reviewDate}
                    reportDate={r.reportDate}
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}

      {showAddModal && <ListingForm onClose={() => setShowAddModal(false)} />}

      {/* Report Modal */}
      {recordingReport && (
        <ReportModal
          listing={recordingReport.listing}
          initialMilestone={recordingReport.milestone}
          existingReport={getExistingReport(
            recordingReport.listing.id,
            recordingReport.milestone
          )}
          previousReport={getPreviousReport(
            recordingReport.listing.id,
            recordingReport.milestone
          )}
          onClose={() => setRecordingReport(null)}
        />
      )}

      {/* Report Viewer Detail Modal */}
      {viewingReport && (
        <ReportDetailView
          report={viewingReport.report}
          listing={viewingReport.listing}
          previousReport={getPreviousReport(
            viewingReport.listing.id,
            viewingReport.report.milestone_days
          )}
          onClose={() => setViewingReport(null)}
        />
      )}
    </>
  );
}
