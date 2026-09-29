import { addDays } from "date-fns";
import { dateKey, getTodayKey, parseDate } from "./dates";
import type { Completion, Listing, MarketReport } from "./types";

export function getInitialDemoData(): {
  listings: Listing[];
  completions: Completion[];
  marketReports: MarketReport[];
} {
  const todayKey = getTodayKey();
  const todayDate = parseDate(todayKey);

  const d = (offsetDays: number) => dateKey(addDays(todayDate, offsetDays));
  const ts = (offsetDays: number, hour = 14) =>
    `${d(offsetDays)}T${String(hour).padStart(2, "0")}:30:00.000Z`;

  const listings: Listing[] = [
    {
      id: "demo-listing-001",
      mls_number: "DEMO-001",
      address: "118 Harbour View Drive",
      listed_date: d(-44), // 44 DOM -> 45-Day Review TODAY, Report TOMORROW
      status: "Active",
      tracking_enabled: true,
      price: 1850000,
      cycle_number: 1,
      is_current: true,
      agent: "Sarah Jenkins",
      notes: "High-interest waterfront property. Client requested bi-weekly analytics summary.",
      created_at: ts(-44, 9),
      updated_at: ts(-14, 10),
    },
    {
      id: "demo-listing-002",
      mls_number: "DEMO-002",
      address: "42 Cedar Ridge Lane",
      listed_date: d(-31), // 31 DOM -> 30-Day Review was 2 days ago (OVERDUE)
      status: "Active",
      tracking_enabled: true,
      price: 925000,
      cycle_number: 1,
      is_current: true,
      agent: "David Chen",
      notes: "Price adjustment discussion scheduled. Needs comp report.",
      created_at: ts(-31, 11),
      updated_at: ts(-10, 16),
    },
    {
      id: "demo-listing-003",
      mls_number: "DEMO-003",
      address: "816 Pacific Grove Road",
      listed_date: d(-65),
      status: "Pending",
      tracking_enabled: false,
      price: 1240000,
      cycle_number: 1,
      is_current: false,
      agent: "Sarah Jenkins",
      notes: "Accepted conditional offer. Tracking paused pending subjects removal.",
      created_at: ts(-65, 8),
      updated_at: ts(-5, 12),
    },
    {
      id: "demo-listing-004",
      mls_number: "DEMO-004",
      address: "25 Maple Crest Way",
      listed_date: d(-12), // 12 DOM -> 14-Day Review TOMORROW
      status: "Active",
      tracking_enabled: true,
      price: 799000,
      cycle_number: 1,
      is_current: true,
      agent: "Marcus Vance",
      notes: "Initial open house completed. Seller active on marketing updates.",
      created_at: ts(-12, 14),
      updated_at: ts(-5, 9),
    },
    {
      id: "demo-listing-005",
      mls_number: "DEMO-005",
      address: "701 Oceanview Lane",
      listed_date: d(-95),
      status: "Sold",
      tracking_enabled: false,
      price: 1450000,
      cycle_number: 1,
      is_current: false,
      agent: "David Chen",
      notes: "Completed sale. Historical record preserved in archive.",
      created_at: ts(-95, 10),
      updated_at: ts(-20, 17),
    },
    {
      id: "demo-listing-006",
      mls_number: "DEMO-006",
      address: "93 Cedar Bay Road",
      listed_date: d(-17), // 17 DOM -> 21-Day Review in 3 days (THIS WEEK)
      status: "Active",
      tracking_enabled: true,
      price: 1150000,
      cycle_number: 1,
      is_current: true,
      agent: "Elena Rostova",
      notes: "New architectural photos uploaded. Social ad campaign active.",
      created_at: ts(-17, 13),
      updated_at: ts(-3, 11),
    },
    {
      id: "demo-listing-007",
      mls_number: "DEMO-007",
      address: "512 Mountain View Terrace",
      listed_date: d(-6), // 6 DOM -> 7-Day Review TODAY, Report TOMORROW
      status: "Active",
      tracking_enabled: true,
      price: 865000,
      cycle_number: 1,
      is_current: true,
      agent: "Marcus Vance",
      notes: "First-week launch phase. Review initial syndication views.",
      created_at: ts(-6, 15),
      updated_at: ts(-1, 10),
    },
    {
      id: "demo-listing-008",
      mls_number: "DEMO-008",
      address: "14 Birchwood Crescent",
      listed_date: d(-50), // Relisted property Cycle 2
      status: "Active",
      tracking_enabled: true,
      price: 689000,
      cycle_number: 2,
      is_current: true,
      baseline_metrics: {
        rew_views: 18500,
        rew_clicks: 420,
        facebook_views: 12000,
        facebook_clicks: 340,
        google_views: 9500,
        google_clicks: 210,
      },
      agent: "Elena Rostova",
      notes: "Cycle 2 Relist with price improvement ($720k -> $689k). Prior metrics carried forward as baseline.",
      created_at: ts(-50, 11),
      updated_at: ts(-5, 14),
    },
  ];

  const completions: Completion[] = [
    // 118 Harbour View Drive past completions
    {
      id: "comp-001",
      listing_id: "demo-listing-001",
      milestone_days: 7,
      completed_at: ts(-37, 14),
      notes: "Launch report sent to owners.",
      created_at: ts(-37, 14),
    },
    {
      id: "comp-002",
      listing_id: "demo-listing-001",
      milestone_days: 14,
      completed_at: ts(-30, 15),
      notes: "Bi-weekly marketing update completed.",
      created_at: ts(-30, 15),
    },
    {
      id: "comp-003",
      listing_id: "demo-listing-001",
      milestone_days: 21,
      completed_at: ts(-23, 16),
      notes: "Reviewed Facebook and Google traffic.",
      created_at: ts(-23, 16),
    },
    {
      id: "comp-004",
      listing_id: "demo-listing-001",
      milestone_days: 30,
      completed_at: ts(-14, 11),
      notes: "Full 30-day comprehensive market report delivered.",
      created_at: ts(-14, 11),
    },

    // 42 Cedar Ridge Lane past completions
    {
      id: "comp-005",
      listing_id: "demo-listing-002",
      milestone_days: 7,
      completed_at: ts(-24, 16),
      notes: "First-week open house recap sent to owners.",
      created_at: ts(-24, 16),
    },
    {
      id: "comp-006",
      listing_id: "demo-listing-002",
      milestone_days: 14,
      completed_at: ts(-17, 15),
      notes: "Showing feedback aggregated and shared.",
      created_at: ts(-17, 15),
    },
    {
      id: "comp-007",
      listing_id: "demo-listing-002",
      milestone_days: 21,
      completed_at: ts(-10, 14),
      notes: "Three-week review call conducted.",
      created_at: ts(-10, 14),
    },

    // 25 Maple Crest Way past completion
    {
      id: "comp-008",
      listing_id: "demo-listing-004",
      milestone_days: 7,
      completed_at: ts(-5, 17),
      notes: "7-Day report sent with weekend open house attendance.",
      created_at: ts(-5, 17),
    },

    // 93 Cedar Bay Road past completions
    {
      id: "comp-009",
      listing_id: "demo-listing-006",
      milestone_days: 7,
      completed_at: ts(-10, 16),
      notes: "Launch report delivered.",
      created_at: ts(-10, 16),
    },
    {
      id: "comp-010",
      listing_id: "demo-listing-006",
      milestone_days: 14,
      completed_at: ts(-3, 15),
      notes: "Second-week report reviewed and approved.",
      created_at: ts(-3, 15),
    },

    // 14 Birchwood Crescent past completions
    {
      id: "comp-011",
      listing_id: "demo-listing-008",
      milestone_days: 7,
      completed_at: ts(-43, 14),
      notes: "Post-relist 7-Day report sent.",
      created_at: ts(-43, 14),
    },
    {
      id: "comp-012",
      listing_id: "demo-listing-008",
      milestone_days: 14,
      completed_at: ts(-36, 15),
      notes: "14-Day review complete.",
      created_at: ts(-36, 15),
    },
    {
      id: "comp-013",
      listing_id: "demo-listing-008",
      milestone_days: 21,
      completed_at: ts(-29, 16),
      notes: "3-week analysis.",
      created_at: ts(-29, 16),
    },
    {
      id: "comp-014",
      listing_id: "demo-listing-008",
      milestone_days: 30,
      completed_at: ts(-20, 12),
      notes: "Monthly deep dive.",
      created_at: ts(-20, 12),
    },
  ];

  const marketReports: MarketReport[] = [
    {
      id: "rep-001",
      listing_id: "demo-listing-001",
      milestone_days: 30,
      report_date: d(-14),
      realtor_views: 4120,
      realtor_clicks: 185,
      realtor_saves: 42,
      rew_views: 12450,
      rew_clicks: 620,
      facebook_views: 28900,
      facebook_clicks: 1450,
      google_views: 18400,
      google_clicks: 980,
      executive_summary:
        "Over the Day-30 reporting period for 118 Harbour View Drive, the listing accumulated 63,870 total views and 3,235 clicks (overall CTR of 5.06%). Exposure was driven primarily by Facebook Ads with 28,900 views.\n\nBuyer engagement is strong, marked by 42 Realtor.ca saves and an above-average click-through rate of 5.06%, reflecting active prospect interest in the listing.\n\nRecommended next step: Maintain current ad distribution and evaluate upcoming showing feedback to determine whether collateral adjustments are warranted.",
      notes: "Waterfront feature campaign delivering top engagement across REW and Facebook.",
      created_at: ts(-14, 11),
      updated_at: ts(-14, 11),
    },
    {
      id: "rep-002",
      listing_id: "demo-listing-002",
      milestone_days: 21,
      report_date: d(-10),
      realtor_views: 1840,
      realtor_clicks: 42,
      realtor_saves: 1,
      rew_views: 6200,
      rew_clicks: 85,
      facebook_views: 14500,
      facebook_clicks: 160,
      google_views: 8900,
      google_clicks: 95,
      executive_summary:
        "Over the Day-21 reporting period for 42 Cedar Ridge Lane, the listing accumulated 31,440 total views and 382 clicks (overall CTR of 1.22%). Exposure was driven primarily by Facebook Ads with 14,500 views.\n\nTraffic volume is healthy across digital channels, but conversion to saves and qualified inquiries remains light. Buyer interest is currently moderate/cautious.\n\nRecommended next step: Conduct a strategic price and positioning review alongside direct showing feedback, and refresh digital feature graphics to stimulate deeper buyer conversion.",
      notes: "High ad impressions but low save conversion. Seller agreed to review feedback on Friday.",
      created_at: ts(-10, 14),
      updated_at: ts(-10, 14),
    },
    {
      id: "rep-003",
      listing_id: "demo-listing-008",
      milestone_days: 30,
      report_date: d(-20),
      realtor_views: 2200,
      realtor_clicks: 120,
      realtor_saves: 18,
      rew_views: 31000, // Cumulative: raw 31,000 - baseline 18,500 = 12,500 net
      rew_clicks: 650,  // Cumulative: raw 650 - baseline 420 = 230 net
      facebook_views: 24500, // Cumulative: raw 24,500 - baseline 12,000 = 12,500 net
      facebook_clicks: 720,  // Cumulative: raw 720 - baseline 340 = 380 net
      google_views: 18500,   // Cumulative: raw 18,500 - baseline 9,500 = 9,000 net
      google_clicks: 430,    // Cumulative: raw 430 - baseline 210 = 220 net
      executive_summary:
        "Since relisting for 14 Birchwood Crescent, the Day-30 marketing cycle has generated 36,200 net new views and 950 clicks across active digital channels (overall CTR of 2.62%). Exposure was driven primarily by REW.ca with 12,500 net views.\n\nBuyer engagement is strong, marked by 18 Realtor.ca saves and an above-average click-through rate of 2.62%, reflecting active prospect interest in the listing. The listing added 14,200 views compared to the previous reporting milestone.\n\nRecommended next step: Maintain current ad distribution and evaluate upcoming showing feedback to determine whether collateral adjustments are warranted.",
      notes: "Relist Cycle 2 performing significantly better than Cycle 1 following the price improvement.",
      created_at: ts(-20, 12),
      updated_at: ts(-20, 12),
    },
  ];

  return { listings, completions, marketReports };
}
