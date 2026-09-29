"use client";

import { useMemo, useState } from "react";
import { X, FileText, Sparkles, Edit3 } from "lucide-react";
import type { Listing, MarketReport } from "@/lib/types";
import { calculateDeltas, calculateReportTotals } from "@/lib/metrics";
import { displayDate } from "@/lib/dates";
import { ReportModal } from "./report-modal";

interface ReportDetailViewProps {
  report: MarketReport;
  listing: Listing;
  previousReport?: MarketReport | null;
  onClose: () => void;
}

export function ReportDetailView({
  report,
  listing,
  previousReport,
  onClose,
}: ReportDetailViewProps) {
  const [isEditing, setIsEditing] = useState(false);

  const isRelist = (listing.cycle_number || 1) > 1;
  const baseline = listing.baseline_metrics;

  const currentTotals = useMemo(() => {
    return calculateReportTotals(report, baseline, isRelist);
  }, [report, baseline, isRelist]);

  const prevTotals = useMemo(() => {
    if (!previousReport) return null;
    return calculateReportTotals(previousReport, baseline, isRelist);
  }, [previousReport, baseline, isRelist]);

  const deltas = useMemo(() => {
    return calculateDeltas(currentTotals, prevTotals);
  }, [currentTotals, prevTotals]);

  const formatNum = (val: number | null | undefined) => {
    if (val === null || val === undefined) return <span className="text-slate-400 font-normal">—</span>;
    return <span className="text-slate-900 font-bold">{val.toLocaleString()}</span>;
  };

  if (isEditing) {
    return (
      <ReportModal
        listing={listing}
        initialMilestone={report.milestone_days}
        existingReport={report}
        previousReport={previousReport}
        onClose={() => {
          setIsEditing(false);
          onClose();
        }}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${report.milestone_days}-Day Market Report Details`}
        onMouseDown={(e) => e.stopPropagation()}
        className="card my-6 w-full max-w-2xl p-6 shadow-2xl bg-white max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2 text-forest">
              <FileText size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">
                {isRelist ? `Cycle #${listing.cycle_number || 2} Relist Milestone` : "Market Report Record"}
              </span>
            </div>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              {report.milestone_days}-Day Market Report
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 font-medium">
              Report Date: <b>{displayDate(report.report_date, "MMMM d, yyyy")}</b> · {listing.address}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Calculated Performance KPIs */}
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/80 p-4">
          <div className="flex items-center justify-between text-xs font-bold text-forest uppercase">
            <span>{isRelist ? "Net Performance Since Relist" : "Cycle Performance Totals"}</span>
            {isRelist && <span className="text-[11px] text-amber-700">Baseline Subtracted</span>}
          </div>

          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="rounded-lg bg-white p-2.5 border border-emerald-100">
              <span className="text-[10px] text-slate-500 uppercase">
                {isRelist ? "Views Since Relist" : "Total Views"}
              </span>
              <div className="text-xl font-black text-slate-900">
                {currentTotals.totalViews !== null ? currentTotals.totalViews.toLocaleString() : "—"}
              </div>
              {deltas.viewsGain !== null && previousReport && (
                <span className="text-[10px] text-emerald-700 font-semibold">
                  +{deltas.viewsGain.toLocaleString()} vs prev
                </span>
              )}
            </div>

            <div className="rounded-lg bg-white p-2.5 border border-emerald-100">
              <span className="text-[10px] text-slate-500 uppercase">
                {isRelist ? "Clicks Since Relist" : "Total Clicks"}
              </span>
              <div className="text-xl font-black text-slate-900">
                {currentTotals.totalClicks !== null ? currentTotals.totalClicks.toLocaleString() : "—"}
              </div>
              {deltas.clicksGain !== null && previousReport && (
                <span className="text-[10px] text-emerald-700 font-semibold">
                  +{deltas.clicksGain.toLocaleString()} vs prev
                </span>
              )}
            </div>

            <div className="rounded-lg bg-white p-2.5 border border-emerald-100">
              <span className="text-[10px] text-slate-500 uppercase">Overall CTR</span>
              <div className="text-xl font-black text-forest">
                {currentTotals.overallCtr !== null ? `${currentTotals.overallCtr}%` : "—"}
              </div>
              {deltas.ctrDelta !== null && previousReport && (
                <span className="text-[10px] text-slate-500 font-semibold">
                  {deltas.ctrDelta >= 0 ? `+${deltas.ctrDelta}%` : `${deltas.ctrDelta}%`}
                </span>
              )}
            </div>

            <div className="rounded-lg bg-white p-2.5 border border-emerald-100">
              <span className="text-[10px] text-slate-500 uppercase">Total Saves</span>
              <div className="text-xl font-black text-slate-900">
                {currentTotals.totalSaves !== null ? currentTotals.totalSaves : "—"}
              </div>
              {deltas.savesGain !== null && previousReport && (
                <span className="text-[10px] text-emerald-700 font-semibold">
                  {deltas.savesGain >= 0 ? `+${deltas.savesGain}` : deltas.savesGain}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Portal Metrics Table */}
        <div className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Syndication Breakdown by Portal
          </h3>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold uppercase text-slate-600 border-b border-slate-200">
                  <th className="py-2.5 px-3">Platform</th>
                  <th className="py-2.5 px-3 text-right">Views</th>
                  <th className="py-2.5 px-3 text-right">Clicks</th>
                  <th className="py-2.5 px-3 text-right">CTR</th>
                  <th className="py-2.5 px-3 text-right">Saves</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">Realtor.ca</td>
                  <td className="py-2.5 px-3 text-right">{formatNum(currentTotals.byPlatform.realtor.views)}</td>
                  <td className="py-2.5 px-3 text-right">{formatNum(currentTotals.byPlatform.realtor.clicks)}</td>
                  <td className="py-2.5 px-3 text-right font-medium text-forest">
                    {currentTotals.byPlatform.realtor.ctr !== null ? `${currentTotals.byPlatform.realtor.ctr}%` : "—"}
                  </td>
                  <td className="py-2.5 px-3 text-right">{formatNum(currentTotals.byPlatform.realtor.saves)}</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">REW.ca</td>
                  <td className="py-2.5 px-3 text-right">{formatNum(currentTotals.byPlatform.rew.views)}</td>
                  <td className="py-2.5 px-3 text-right">{formatNum(currentTotals.byPlatform.rew.clicks)}</td>
                  <td className="py-2.5 px-3 text-right font-medium text-forest">
                    {currentTotals.byPlatform.rew.ctr !== null ? `${currentTotals.byPlatform.rew.ctr}%` : "—"}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-400">—</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">Facebook Ads</td>
                  <td className="py-2.5 px-3 text-right">{formatNum(currentTotals.byPlatform.facebook.views)}</td>
                  <td className="py-2.5 px-3 text-right">{formatNum(currentTotals.byPlatform.facebook.clicks)}</td>
                  <td className="py-2.5 px-3 text-right font-medium text-forest">
                    {currentTotals.byPlatform.facebook.ctr !== null ? `${currentTotals.byPlatform.facebook.ctr}%` : "—"}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-400">—</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">Google Ads</td>
                  <td className="py-2.5 px-3 text-right">{formatNum(currentTotals.byPlatform.google.views)}</td>
                  <td className="py-2.5 px-3 text-right">{formatNum(currentTotals.byPlatform.google.clicks)}</td>
                  <td className="py-2.5 px-3 text-right font-medium text-forest">
                    {currentTotals.byPlatform.google.ctr !== null ? `${currentTotals.byPlatform.google.ctr}%` : "—"}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-400">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="mt-5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            <Sparkles size={14} className="text-emerald-600" />
            <span>Executive Narrative Summary</span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-xs leading-relaxed text-slate-800 whitespace-pre-line font-normal">
            {report.executive_summary || "No executive summary provided for this reporting period."}
          </div>
        </div>

        {/* Notes */}
        {report.notes && (
          <div className="mt-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Internal Notes</span>
            <div className="mt-1 rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700">
              {report.notes}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <Edit3 size={14} />
            <span>Edit Metrics & Summary</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="btn-primary text-xs"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
