import type { BaselineMetrics, MarketReport } from "./types";

export interface PlatformMetricsSummary {
  views: number | null;
  clicks: number | null;
  saves: number | null;
  ctr: number | null;
  rawViews?: number | null;
  rawClicks?: number | null;
}

export interface ReportTotals {
  totalViews: number | null;
  totalClicks: number | null;
  totalSaves: number | null;
  overallCtr: number | null;
  byPlatform: {
    realtor: PlatformMetricsSummary;
    rew: PlatformMetricsSummary;
    facebook: PlatformMetricsSummary;
    google: PlatformMetricsSummary;
  };
}

export interface ReportDeltas {
  viewsGain: number | null;
  clicksGain: number | null;
  savesGain: number | null;
  ctrDelta: number | null;
}

/**
 * Calculates Click-Through Rate (CTR) as a percentage.
 * Formula: (clicks / views) * 100, rounded to 2 decimal places.
 *
 * Rules:
 * - If either clicks or views is NULL (not supplied), returns NULL.
 * - If views <= 0, returns NULL (division by zero / not applicable).
 * - If clicks === 0 and views > 0, returns 0.00 (confirmed zero CTR).
 */
export function calculateCTR(
  clicks: number | null | undefined,
  views: number | null | undefined
): number | null {
  if (clicks === null || clicks === undefined || views === null || views === undefined) {
    return null;
  }
  if (clicks < 0 || views <= 0) {
    return null;
  }
  const ctr = (clicks / views) * 100;
  return Math.round(ctr * 100) / 100;
}

/**
 * Calculates Report Totals across Realtor.ca, REW.ca, Facebook, and Google.
 * Handles relist baseline subtraction for cumulative platforms (REW, Facebook, Google)
 * while Realtor.ca starts fresh from 0 with each new MLS cycle.
 */
export function calculateReportTotals(
  report: Partial<MarketReport>,
  baseline?: BaselineMetrics | null,
  isRelist = false
): ReportTotals {
  // Realtor.ca: fresh MLS on relist, no baseline subtraction
  const realtorViews = report.realtor_views ?? null;
  const realtorClicks = report.realtor_clicks ?? null;
  const realtorSaves = report.realtor_saves ?? null;
  const realtorCtr = calculateCTR(realtorClicks, realtorViews);

  // REW.ca: cumulative on aggregator, subtracts baseline if relisted
  const rawRewViews = report.rew_views ?? null;
  const rawRewClicks = report.rew_clicks ?? null;
  const rewViews =
    isRelist && baseline?.rew_views !== undefined && baseline?.rew_views !== null && rawRewViews !== null
      ? Math.max(0, rawRewViews - baseline.rew_views)
      : rawRewViews;
  const rewClicks =
    isRelist && baseline?.rew_clicks !== undefined && baseline?.rew_clicks !== null && rawRewClicks !== null
      ? Math.max(0, rawRewClicks - baseline.rew_clicks)
      : rawRewClicks;
  const rewCtr = calculateCTR(rewClicks, rewViews);

  // Facebook Ads: cumulative campaign, subtracts baseline if relisted
  const rawFbViews = report.facebook_views ?? null;
  const rawFbClicks = report.facebook_clicks ?? null;
  const fbViews =
    isRelist && baseline?.facebook_views !== undefined && baseline?.facebook_views !== null && rawFbViews !== null
      ? Math.max(0, rawFbViews - baseline.facebook_views)
      : rawFbViews;
  const fbClicks =
    isRelist && baseline?.facebook_clicks !== undefined && baseline?.facebook_clicks !== null && rawFbClicks !== null
      ? Math.max(0, rawFbClicks - baseline.facebook_clicks)
      : rawFbClicks;
  const fbCtr = calculateCTR(fbClicks, fbViews);

  // Google Ads: cumulative campaign, subtracts baseline if relisted
  const rawGoogleViews = report.google_views ?? null;
  const rawGoogleClicks = report.google_clicks ?? null;
  const googleViews =
    isRelist && baseline?.google_views !== undefined && baseline?.google_views !== null && rawGoogleViews !== null
      ? Math.max(0, rawGoogleViews - baseline.google_views)
      : rawGoogleViews;
  const googleClicks =
    isRelist && baseline?.google_clicks !== undefined && baseline?.google_clicks !== null && rawGoogleClicks !== null
      ? Math.max(0, rawGoogleClicks - baseline.google_clicks)
      : rawGoogleClicks;
  const googleCtr = calculateCTR(googleClicks, googleViews);

  // Aggregate totals
  const viewsList = [realtorViews, rewViews, fbViews, googleViews].filter(
    (v): v is number => v !== null && v !== undefined
  );
  const clicksList = [realtorClicks, rewClicks, fbClicks, googleClicks].filter(
    (c): c is number => c !== null && c !== undefined
  );

  const totalViews = viewsList.length > 0 ? viewsList.reduce((acc, v) => acc + v, 0) : null;
  const totalClicks = clicksList.length > 0 ? clicksList.reduce((acc, c) => acc + c, 0) : null;
  const totalSaves = realtorSaves;
  const overallCtr = calculateCTR(totalClicks, totalViews);

  return {
    totalViews,
    totalClicks,
    totalSaves,
    overallCtr,
    byPlatform: {
      realtor: {
        views: realtorViews,
        clicks: realtorClicks,
        saves: realtorSaves,
        ctr: realtorCtr,
      },
      rew: {
        views: rewViews,
        clicks: rewClicks,
        saves: null,
        ctr: rewCtr,
        rawViews: rawRewViews,
        rawClicks: rawRewClicks,
      },
      facebook: {
        views: fbViews,
        clicks: fbClicks,
        saves: null,
        ctr: fbCtr,
        rawViews: rawFbViews,
        rawClicks: rawFbClicks,
      },
      google: {
        views: googleViews,
        clicks: googleClicks,
        saves: null,
        ctr: googleCtr,
        rawViews: rawGoogleViews,
        rawClicks: rawGoogleClicks,
      },
    },
  };
}

/**
 * Calculates deltas between current report totals and previous report totals.
 */
export function calculateDeltas(
  current: ReportTotals,
  previous?: ReportTotals | null
): ReportDeltas {
  if (!previous) {
    return {
      viewsGain: current.totalViews,
      clicksGain: current.totalClicks,
      savesGain: current.totalSaves,
      ctrDelta: current.overallCtr,
    };
  }

  const viewsGain =
    current.totalViews !== null && previous.totalViews !== null
      ? current.totalViews - previous.totalViews
      : null;

  const clicksGain =
    current.totalClicks !== null && previous.totalClicks !== null
      ? current.totalClicks - previous.totalClicks
      : null;

  const savesGain =
    current.totalSaves !== null && previous.totalSaves !== null
      ? current.totalSaves - previous.totalSaves
      : null;

  const ctrDelta =
    current.overallCtr !== null && previous.overallCtr !== null
      ? Math.round((current.overallCtr - previous.overallCtr) * 100) / 100
      : null;

  return {
    viewsGain,
    clicksGain,
    savesGain,
    ctrDelta,
  };
}

/**
 * Generates an executive summary first draft following DWA rules:
 * 1. Never generate numbers that differ from calculated numbers.
 * 2. High views alone do NOT mean strong interest.
 *    If views are high but CTR is low and saves are flat:
 *    "Traffic volume is healthy across digital channels, but conversion to saves and qualified inquiries remains light. Buyer interest is currently moderate/cautious."
 * 3. If saves are high (e.g. >= 5 saves or CTR >= 3%):
 *    State that buyer engagement is strong.
 * 4. Keep summary to 2-3 short paragraphs:
 *    - Overview of total exposure & top platform
 *    - Engagement / conversion analysis (CTR & saves)
 *    - Recommended next step (monitor, price review, or creative refresh)
 */
export function generateExecutiveSummary(params: {
  milestoneDays: number;
  totals: ReportTotals;
  deltas?: ReportDeltas | null;
  isRelist?: boolean;
  address?: string;
}): string {
  const { milestoneDays, totals, deltas, isRelist = false, address } = params;
  const views = totals.totalViews ?? 0;
  const clicks = totals.totalClicks ?? 0;
  const saves = totals.totalSaves ?? 0;
  const ctr = totals.overallCtr ?? 0;

  // 1. Identify top performing platform
  const platforms = [
    { name: "Realtor.ca", views: totals.byPlatform.realtor.views ?? 0 },
    { name: "REW.ca", views: totals.byPlatform.rew.views ?? 0 },
    { name: "Facebook Ads", views: totals.byPlatform.facebook.views ?? 0 },
    { name: "Google Ads", views: totals.byPlatform.google.views ?? 0 },
  ].sort((a, b) => b.views - a.views);

  const topPlatform = platforms[0]?.views > 0 ? platforms[0] : null;

  // Paragraph 1: Overview of total exposure & top platform
  let p1 = isRelist
    ? `Since relisting${address ? ` for ${address}` : ""}, the Day-${milestoneDays} marketing cycle has generated ${views.toLocaleString()} net new views and ${clicks.toLocaleString()} clicks across active digital channels (overall CTR of ${ctr}%).`
    : `Over the Day-${milestoneDays} reporting period${address ? ` for ${address}` : ""}, the listing accumulated ${views.toLocaleString()} total views and ${clicks.toLocaleString()} clicks (overall CTR of ${ctr}%).`;

  if (topPlatform && topPlatform.views > 0) {
    p1 += ` Exposure was driven primarily by ${topPlatform.name} with ${topPlatform.views.toLocaleString()} views.`;
  }

  // Paragraph 2: Engagement / conversion analysis (CTR & saves)
  let p2 = "";
  const isHighExposure = views >= 5000;
  const isLowCtr = ctr < 2.0;
  const isFlatSaves = saves <= 1;

  if (isHighExposure && isLowCtr && isFlatSaves) {
    p2 = "Traffic volume is healthy across digital channels, but conversion to saves and qualified inquiries remains light. Buyer interest is currently moderate/cautious.";
  } else if (saves >= 5 || (ctr >= 3.0 && clicks >= 30)) {
    p2 = `Buyer engagement is strong, marked by ${saves} Realtor.ca saves and an above-average click-through rate of ${ctr}%, reflecting active prospect interest in the listing.`;
  } else {
    p2 = `Engagement is steady across active portals with ${clicks.toLocaleString()} total click-throughs (${ctr}% CTR) and ${saves} Realtor.ca saves recorded to date.`;
  }

  if (deltas && deltas.viewsGain !== null && deltas.viewsGain !== undefined && deltas.viewsGain !== views) {
    const gainDirection = deltas.viewsGain >= 0 ? "added" : "decreased by";
    p2 += ` The listing ${gainDirection} ${Math.abs(deltas.viewsGain).toLocaleString()} views compared to the previous reporting milestone.`;
  }

  // Paragraph 3: Recommended next step
  let p3 = "";
  if (isHighExposure && isLowCtr && isFlatSaves && milestoneDays >= 21) {
    p3 = "Recommended next step: Conduct a strategic price and positioning review alongside direct showing feedback, and refresh digital feature graphics to stimulate deeper buyer conversion.";
  } else if (milestoneDays <= 14) {
    p3 = "Recommended next step: Continue active digital syndication across Realtor.ca and social campaigns, monitoring engagement velocity as market awareness builds.";
  } else {
    p3 = "Recommended next step: Maintain current ad distribution and evaluate upcoming showing feedback to determine whether collateral adjustments are warranted.";
  }

  return `${p1}\n\n${p2}\n\n${p3}`;
}
