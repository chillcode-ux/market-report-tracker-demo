"use client";

import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import { BarChart3, Sparkles, X, Info } from "lucide-react";
import type { Listing, MarketReport } from "@/lib/types";
import {
  calculateDeltas,
  calculateReportTotals,
  generateExecutiveSummary,
} from "@/lib/metrics";
import { getReportDate, getReviewDate, displayDate } from "@/lib/dates";
import { useDemoStore } from "@/lib/store";

const formatPrice = (price?: number | null) => {
  if (!price) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
};

interface ReportModalProps {
  listing: Listing;
  initialMilestone?: number;
  existingReport?: MarketReport | null;
  previousReport?: MarketReport | null;
  onClose: () => void;
}

export function ReportModal({
  listing,
  initialMilestone = 7,
  existingReport,
  previousReport,
  onClose,
}: ReportModalProps) {
  const { saveReport } = useDemoStore();
  const [busy, setBusy] = useState(false);

  const isRelist = (listing.cycle_number || 1) > 1;
  const baseline = listing.baseline_metrics;

  const [milestone, setMilestone] = useState(
    existingReport ? String(existingReport.milestone_days) : String(initialMilestone)
  );

  const defaultDate = existingReport
    ? existingReport.report_date
    : getReportDate(listing.listed_date, parseInt(milestone, 10) || 7);

  const [reportDate, setReportDate] = useState(defaultDate);

  const currentReviewDate = getReviewDate(reportDate);

  // Platform Inputs: Realtor.ca
  const [realtorViews, setRealtorViews] = useState(
    existingReport?.realtor_views !== undefined && existingReport?.realtor_views !== null
      ? String(existingReport.realtor_views)
      : ""
  );
  const [realtorClicks, setRealtorClicks] = useState(
    existingReport?.realtor_clicks !== undefined && existingReport?.realtor_clicks !== null
      ? String(existingReport.realtor_clicks)
      : ""
  );
  const [realtorSaves, setRealtorSaves] = useState(
    existingReport?.realtor_saves !== undefined && existingReport?.realtor_saves !== null
      ? String(existingReport.realtor_saves)
      : ""
  );

  // REW.ca
  const [rewViews, setRewViews] = useState(
    existingReport?.rew_views !== undefined && existingReport?.rew_views !== null
      ? String(existingReport.rew_views)
      : ""
  );
  const [rewClicks, setRewClicks] = useState(
    existingReport?.rew_clicks !== undefined && existingReport?.rew_clicks !== null
      ? String(existingReport.rew_clicks)
      : ""
  );

  // Facebook Ads
  const [fbViews, setFbViews] = useState(
    existingReport?.facebook_views !== undefined && existingReport?.facebook_views !== null
      ? String(existingReport.facebook_views)
      : ""
  );
  const [fbClicks, setFbClicks] = useState(
    existingReport?.facebook_clicks !== undefined && existingReport?.facebook_clicks !== null
      ? String(existingReport.facebook_clicks)
      : ""
  );

  // Google Ads
  const [googleViews, setGoogleViews] = useState(
    existingReport?.google_views !== undefined && existingReport?.google_views !== null
      ? String(existingReport.google_views)
      : ""
  );
  const [googleClicks, setGoogleClicks] = useState(
    existingReport?.google_clicks !== undefined && existingReport?.google_clicks !== null
      ? String(existingReport.google_clicks)
      : ""
  );

  // Narrative inputs
  const [executiveSummary, setExecutiveSummary] = useState(existingReport?.executive_summary || "");
  const [notes, setNotes] = useState(existingReport?.notes || "");

  const parseNumber = (val: string): number | null => {
    const trimmed = val.trim();
    if (trimmed === "") return null;
    const n = parseInt(trimmed, 10);
    return isNaN(n) ? null : n;
  };

  // Live Calculations
  const liveTotals = useMemo(() => {
    const reportData: Partial<MarketReport> = {
      realtor_views: parseNumber(realtorViews),
      realtor_clicks: parseNumber(realtorClicks),
      realtor_saves: parseNumber(realtorSaves),
      rew_views: parseNumber(rewViews),
      rew_clicks: parseNumber(rewClicks),
      facebook_views: parseNumber(fbViews),
      facebook_clicks: parseNumber(fbClicks),
      google_views: parseNumber(googleViews),
      google_clicks: parseNumber(googleClicks),
    };

    return calculateReportTotals(reportData, baseline, isRelist);
  }, [
    realtorViews,
    realtorClicks,
    realtorSaves,
    rewViews,
    rewClicks,
    fbViews,
    fbClicks,
    googleViews,
    googleClicks,
    baseline,
    isRelist,
  ]);

  const prevTotals = useMemo(() => {
    if (!previousReport) return null;
    return calculateReportTotals(previousReport, baseline, isRelist);
  }, [previousReport, baseline, isRelist]);

  const liveDeltas = useMemo(() => {
    return calculateDeltas(liveTotals, prevTotals);
  }, [liveTotals, prevTotals]);

  // Executive Summary Generation
  function handleGenerateSummary() {
    const draft = generateExecutiveSummary({
      milestoneDays: parseInt(milestone, 10) || 7,
      totals: liveTotals,
      deltas: liveDeltas,
      isRelist,
      address: listing.address,
    });
    setExecutiveSummary(draft);
    toast.success("Executive summary drafted based on calculated metrics!");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);

    try {
      const milestoneDays = parseInt(milestone, 10) || 7;

      const reportPayload: Partial<MarketReport> = {
        id: existingReport?.id,
        listing_id: listing.id,
        milestone_days: milestoneDays,
        report_date: reportDate,
        realtor_views: parseNumber(realtorViews),
        realtor_clicks: parseNumber(realtorClicks),
        realtor_saves: parseNumber(realtorSaves),
        rew_views: parseNumber(rewViews),
        rew_clicks: parseNumber(rewClicks),
        facebook_views: parseNumber(fbViews),
        facebook_clicks: parseNumber(fbClicks),
        google_views: parseNumber(googleViews),
        google_clicks: parseNumber(googleClicks),
        executive_summary: executiveSummary.trim() || null,
        notes: notes.trim() || null,
      };

      await saveReport(reportPayload, true);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to save market report");
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onMouseDown={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onMouseDown={(e) => e.stopPropagation()}
        className="card my-6 w-full max-w-2xl p-6 shadow-2xl bg-white max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2 text-forest">
              <BarChart3 size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">
                {isRelist ? `Cycle #${listing.cycle_number || 2} Relist Report` : "Market Report Entry"}
              </span>
            </div>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              {existingReport ? "Edit" : "Create"} Market Report
            </h2>
            <p className="mt-0.5 text-sm font-semibold text-slate-800">
              {listing.address} · MLS {listing.mls_number}
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

        {/* Prefilled Property & Milestone Metadata Grid */}
        <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Property Address</span>
              <div className="font-bold text-slate-900 truncate" title={listing.address}>{listing.address}</div>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">MLS & Cycle</span>
              <div className="font-bold text-slate-900">{listing.mls_number} · Cycle #{listing.cycle_number || 1}</div>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Listed Date</span>
              <div className="font-bold text-slate-900">{displayDate(listing.listed_date, "MMM d, yyyy")}</div>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">List Price</span>
              <div className="font-bold text-forest">{listing.price ? formatPrice(listing.price) : "—"}</div>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Milestone</span>
              <div className="font-bold text-slate-900">{milestone}-Day Report</div>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Final Review Date</span>
              <div className="font-bold text-slate-900">{displayDate(currentReviewDate, "MMM d, yyyy")}</div>
            </div>
            <div className="sm:col-span-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Official Report Date</span>
              <div className="font-bold text-slate-900">{displayDate(reportDate, "MMM d, yyyy")}</div>
            </div>
          </div>
        </div>

        {/* Milestone & Date */}
        <div className="grid gap-3 sm:grid-cols-2 mb-4">
          <label>
            <span className="label">Milestone</span>
            <select
              id="report-milestone-select"
              className="field mt-1"
              value={milestone}
              onChange={(e) => {
                setMilestone(e.target.value);
                setReportDate(getReportDate(listing.listed_date, parseInt(e.target.value, 10) || 7));
              }}
            >
              {[7, 14, 21, 30, 45, 60, 75, 90, 120, 150, 180].map((m) => (
                <option key={m} value={m}>
                  Day {m} Report
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="label">Report Date</span>
            <input
              id="report-date-input"
              className="field mt-1"
              type="date"
              required
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
            />
          </label>
        </div>

        {/* Relist Notice if applicable */}
        {isRelist && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900 flex items-start gap-2">
            <Info size={16} className="mt-0.5 shrink-0 text-amber-600" />
            <div>
              <b>Relist Cycle Active:</b> Net activity since relist is automatically calculated by subtracting baseline counts ({baseline?.rew_views ? `${baseline.rew_views.toLocaleString()} REW views` : "no REW baseline set"}). Realtor.ca metrics start fresh with the new MLS.
            </div>
          </div>
        )}

        {/* Platform Sections Grid */}
        <div className="space-y-3">
          {/* Section 1: Realtor.ca */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">1. Realtor.ca</span>
              <span className="text-[11px] text-slate-500 font-medium">Resets on new MLS</span>
            </div>
            <div className="mt-2.5 grid grid-cols-3 gap-3">
              <label>
                <span className="text-xs font-semibold text-slate-600">Views</span>
                <input
                  id="input-realtor-views"
                  className="field mt-1 text-xs"
                  type="number"
                  min="0"
                  placeholder="—"
                  value={realtorViews}
                  onChange={(e) => setRealtorViews(e.target.value)}
                />
              </label>
              <label>
                <span className="text-xs font-semibold text-slate-600">Clicks</span>
                <input
                  id="input-realtor-clicks"
                  className="field mt-1 text-xs"
                  type="number"
                  min="0"
                  placeholder="—"
                  value={realtorClicks}
                  onChange={(e) => setRealtorClicks(e.target.value)}
                />
              </label>
              <label>
                <span className="text-xs font-semibold text-slate-600">Saves (Intent)</span>
                <input
                  id="input-realtor-saves"
                  className="field mt-1 text-xs"
                  type="number"
                  min="0"
                  placeholder="—"
                  value={realtorSaves}
                  onChange={(e) => setRealtorSaves(e.target.value)}
                />
              </label>
            </div>
          </div>

          {/* Section 2: REW.ca */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">2. REW.ca</span>
              {isRelist && baseline?.rew_views !== undefined && baseline?.rew_views !== null && (
                <span className="text-[11px] text-amber-700 font-medium">
                  Baseline: {baseline.rew_views.toLocaleString()} views
                </span>
              )}
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-3">
              <label>
                <span className="text-xs font-semibold text-slate-600">Current Cumulative Views</span>
                <input
                  id="input-rew-views"
                  className="field mt-1 text-xs"
                  type="number"
                  min="0"
                  placeholder="—"
                  value={rewViews}
                  onChange={(e) => setRewViews(e.target.value)}
                />
              </label>
              <label>
                <span className="text-xs font-semibold text-slate-600">Current Cumulative Clicks</span>
                <input
                  id="input-rew-clicks"
                  className="field mt-1 text-xs"
                  type="number"
                  min="0"
                  placeholder="—"
                  value={rewClicks}
                  onChange={(e) => setRewClicks(e.target.value)}
                />
              </label>
            </div>
            {isRelist && (
              <div className="mt-2.5 grid grid-cols-3 gap-2 rounded-lg bg-amber-50/70 p-2 text-xs border border-amber-200/60 text-center">
                <div>
                  <span className="text-[10px] uppercase text-slate-500 font-semibold">Current Total</span>
                  <div className="font-bold text-slate-900">{parseNumber(rewViews)?.toLocaleString() ?? "—"}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-amber-800 font-semibold">Relist Baseline</span>
                  <div className="font-bold text-amber-900">{baseline?.rew_views?.toLocaleString() ?? "0"}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-emerald-700 font-semibold">Since Relist (Net)</span>
                  <div className="font-bold text-emerald-800">{liveTotals.byPlatform.rew.views?.toLocaleString() ?? "—"}</div>
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Facebook Ads */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">3. Facebook Ads</span>
              {isRelist && baseline?.facebook_views ? (
                <span className="text-[11px] text-amber-700 font-medium">
                  Baseline: {baseline.facebook_views.toLocaleString()} views
                </span>
              ) : null}
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-3">
              <label>
                <span className="text-xs font-semibold text-slate-600">Current Views</span>
                <input
                  id="input-fb-views"
                  className="field mt-1 text-xs"
                  type="number"
                  min="0"
                  placeholder="—"
                  value={fbViews}
                  onChange={(e) => setFbViews(e.target.value)}
                />
              </label>
              <label>
                <span className="text-xs font-semibold text-slate-600">Current Clicks</span>
                <input
                  id="input-fb-clicks"
                  className="field mt-1 text-xs"
                  type="number"
                  min="0"
                  placeholder="—"
                  value={fbClicks}
                  onChange={(e) => setFbClicks(e.target.value)}
                />
              </label>
            </div>
            {isRelist && (
              <div className="mt-2.5 grid grid-cols-3 gap-2 rounded-lg bg-amber-50/70 p-2 text-xs border border-amber-200/60 text-center">
                <div>
                  <span className="text-[10px] uppercase text-slate-500 font-semibold">Current Total</span>
                  <div className="font-bold text-slate-900">{parseNumber(fbViews)?.toLocaleString() ?? "—"}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-amber-800 font-semibold">Relist Baseline</span>
                  <div className="font-bold text-amber-900">{baseline?.facebook_views?.toLocaleString() ?? "0"}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-emerald-700 font-semibold">Since Relist (Net)</span>
                  <div className="font-bold text-emerald-800">{liveTotals.byPlatform.facebook.views?.toLocaleString() ?? "—"}</div>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Google Ads */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-slate-900">4. Google Ads</span>
            </div>
            <div className="mt-2.5 grid grid-cols-2 gap-3">
              <label>
                <span className="text-xs font-semibold text-slate-600">Current Views</span>
                <input
                  id="input-google-views"
                  className="field mt-1 text-xs"
                  type="number"
                  min="0"
                  placeholder="—"
                  value={googleViews}
                  onChange={(e) => setGoogleViews(e.target.value)}
                />
              </label>
              <label>
                <span className="text-xs font-semibold text-slate-600">Current Clicks</span>
                <input
                  id="input-google-clicks"
                  className="field mt-1 text-xs"
                  type="number"
                  min="0"
                  placeholder="—"
                  value={googleClicks}
                  onChange={(e) => setGoogleClicks(e.target.value)}
                />
              </label>
            </div>
          </div>
        </div>

        {/* Section 5: Live Calculated Summary */}
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5">
          <div className="flex items-center justify-between text-xs font-bold text-forest">
            <span>LIVE CALCULATED SUMMARY</span>
            <span>{isRelist ? "ACTIVITY SINCE RELIST" : "CAMPAIGN TOTALS"}</span>
          </div>

          <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="rounded-lg bg-white p-2 border border-emerald-100">
              <span className="text-[10px] text-slate-500 uppercase">
                {isRelist ? "Views Since Relist" : "Total Views"}
              </span>
              <div id="live-total-views" className="text-lg font-black text-slate-900">
                {liveTotals.totalViews !== null ? liveTotals.totalViews.toLocaleString() : "—"}
              </div>
              {liveDeltas.viewsGain !== null && previousReport && (
                <span className="text-[10px] text-emerald-700 font-semibold">
                  +{liveDeltas.viewsGain.toLocaleString()} vs prev
                </span>
              )}
            </div>

            <div className="rounded-lg bg-white p-2 border border-emerald-100">
              <span className="text-[10px] text-slate-500 uppercase">
                {isRelist ? "Clicks Since Relist" : "Total Clicks"}
              </span>
              <div id="live-total-clicks" className="text-lg font-black text-slate-900">
                {liveTotals.totalClicks !== null ? liveTotals.totalClicks.toLocaleString() : "—"}
              </div>
              {liveDeltas.clicksGain !== null && previousReport && (
                <span className="text-[10px] text-emerald-700 font-semibold">
                  +{liveDeltas.clicksGain.toLocaleString()} vs prev
                </span>
              )}
            </div>

            <div className="rounded-lg bg-white p-2 border border-emerald-100">
              <span className="text-[10px] text-slate-500 uppercase">Overall CTR</span>
              <div id="live-overall-ctr" className="text-lg font-black text-forest">
                {liveTotals.overallCtr !== null ? `${liveTotals.overallCtr}%` : "—"}
              </div>
              {liveDeltas.ctrDelta !== null && previousReport && (
                <span className="text-[10px] text-slate-500 font-semibold">
                  {liveDeltas.ctrDelta >= 0 ? `+${liveDeltas.ctrDelta}%` : `${liveDeltas.ctrDelta}%`}
                </span>
              )}
            </div>

            <div className="rounded-lg bg-white p-2 border border-emerald-100">
              <span className="text-[10px] text-slate-500 uppercase">Total Saves</span>
              <div id="live-total-saves" className="text-lg font-black text-slate-900">
                {liveTotals.totalSaves !== null ? liveTotals.totalSaves : "—"}
              </div>
            </div>
          </div>

          {previousReport && (
            <div className="mt-3 flex flex-wrap items-center justify-between border-t border-emerald-200/80 pt-2 text-[11px] text-slate-600">
              <span>
                Comparing against <b>Day {previousReport.milestone_days} Report</b> ({displayDate(previousReport.report_date)}):
              </span>
              <span className="font-semibold text-slate-900">
                {liveDeltas.viewsGain !== null && `${liveDeltas.viewsGain >= 0 ? `+${liveDeltas.viewsGain.toLocaleString()}` : liveDeltas.viewsGain.toLocaleString()} Views`}
                {liveDeltas.clicksGain !== null && ` · ${liveDeltas.clicksGain >= 0 ? `+${liveDeltas.clicksGain.toLocaleString()}` : liveDeltas.clicksGain.toLocaleString()} Clicks`}
                {liveDeltas.ctrDelta !== null && ` · ${liveDeltas.ctrDelta >= 0 ? `+${liveDeltas.ctrDelta}%` : `${liveDeltas.ctrDelta}%`} CTR`}
              </span>
            </div>
          )}
        </div>

        {/* Section 6: Executive Summary */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="label">6. Executive Summary</span>
            <button
              id="generate-summary-btn"
              type="button"
              onClick={handleGenerateSummary}
              className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1.5 font-bold text-forest hover:bg-forest/10 transition"
            >
              <Sparkles size={13} className="text-emerald-600" />
              <span>Generate Summary</span>
            </button>
          </div>
          <textarea
            id="executive-summary-textarea"
            rows={4}
            className="field text-xs leading-relaxed"
            placeholder="Click 'Generate Summary' to auto-draft summary text based on calculated metrics, or write your own..."
            value={executiveSummary}
            onChange={(e) => setExecutiveSummary(e.target.value)}
          />
        </div>

        {/* Section 7: Notes */}
        <div className="mt-3">
          <span className="label">7. Notes</span>
          <textarea
            id="report-notes-textarea"
            rows={2}
            className="field mt-1 text-xs"
            placeholder="Internal tracking notes (e.g. campaign adjustments, price discussions, showing comments)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs"
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary text-xs flex items-center gap-1.5"
            disabled={busy}
          >
            <BarChart3 size={14} />
            <span>{busy ? "Saving..." : existingReport ? "Update Report" : "Save Report & Mark Milestone"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
