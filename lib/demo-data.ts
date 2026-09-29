import { addDays } from "date-fns";
import { dateKey, getTodayKey, parseDate } from "./dates";
import type { Completion, Listing } from "./types";

export function getInitialDemoData(): { listings: Listing[]; completions: Completion[] } {
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
      agent: "Marcus Vance",
      notes: "First-week launch phase. Review initial syndication views.",
      created_at: ts(-6, 15),
      updated_at: ts(-1, 10),
    },
    {
      id: "demo-listing-008",
      mls_number: "DEMO-008",
      address: "14 Birchwood Crescent",
      listed_date: d(-56), // 56 DOM -> 60-Day Review in 3 days (THIS WEEK)
      status: "Active",
      tracking_enabled: true,
      agent: "Sarah Jenkins",
      notes: "Steady showing volume. Monthly check-in with sellers.",
      created_at: ts(-56, 12),
      updated_at: ts(-10, 15),
    },
  ];

  const completions: Completion[] = [
    // 118 Harbour View Drive completions for past 7, 14, 21, 30 days
    {
      id: "comp-001",
      listing_id: "demo-listing-001",
      milestone_days: 7,
      completed_at: ts(-37, 16),
      notes: "Initial 7-day launch report sent to sellers with view traffic.",
      created_at: ts(-37, 16),
    },
    {
      id: "comp-002",
      listing_id: "demo-listing-001",
      milestone_days: 14,
      completed_at: ts(-30, 15),
      notes: "Two-week summary including social campaign metrics.",
      created_at: ts(-30, 15),
    },
    {
      id: "comp-003",
      listing_id: "demo-listing-001",
      milestone_days: 21,
      completed_at: ts(-23, 14),
      notes: "Feedback review and competitive neighbourhood comps attached.",
      created_at: ts(-23, 14),
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
      completed_at: ts(-49, 14),
      notes: "Launch summary.",
      created_at: ts(-49, 14),
    },
    {
      id: "comp-012",
      listing_id: "demo-listing-008",
      milestone_days: 14,
      completed_at: ts(-42, 15),
      notes: "Bi-weekly report.",
      created_at: ts(-42, 15),
    },
    {
      id: "comp-013",
      listing_id: "demo-listing-008",
      milestone_days: 21,
      completed_at: ts(-35, 16),
      notes: "3-week analysis.",
      created_at: ts(-35, 16),
    },
    {
      id: "comp-014",
      listing_id: "demo-listing-008",
      milestone_days: 30,
      completed_at: ts(-26, 12),
      notes: "Monthly deep dive.",
      created_at: ts(-26, 12),
    },
    {
      id: "comp-015",
      listing_id: "demo-listing-008",
      milestone_days: 45,
      completed_at: ts(-11, 14),
      notes: "45-Day strategy update.",
      created_at: ts(-11, 14),
    },

    // 701 Oceanview Lane (Sold) past completions
    {
      id: "comp-016",
      listing_id: "demo-listing-005",
      milestone_days: 7,
      completed_at: ts(-88, 11),
      notes: "Launch milestone completed.",
      created_at: ts(-88, 11),
    },
    {
      id: "comp-017",
      listing_id: "demo-listing-005",
      milestone_days: 14,
      completed_at: ts(-81, 14),
      notes: "Offer negotiation report.",
      created_at: ts(-81, 14),
    },
  ];

  return { listings, completions };
}
