export type ListingStatus = "Active" | "Pending" | "Sold" | "Cancelled" | "Expired";

export type BaselineMetrics = {
  rew_views?: number | null;
  rew_clicks?: number | null;
  facebook_views?: number | null;
  facebook_clicks?: number | null;
  google_views?: number | null;
  google_clicks?: number | null;
};

export type Listing = {
  id: string;
  mls_number: string;
  address: string;
  listed_date: string;
  status: ListingStatus;
  tracking_enabled: boolean;
  agent: string | null;
  notes: string | null;
  price?: number | null;
  cycle_number?: number;
  is_current?: boolean;
  baseline_metrics?: BaselineMetrics | null;
  created_at: string;
  updated_at: string;
};

export type Completion = {
  id: string;
  listing_id: string;
  milestone_days: number;
  completed_at: string;
  notes: string | null;
  created_at: string;
};

export type DeadlineState =
  | "overdue"
  | "today"
  | "tomorrow"
  | "upcoming"
  | "completed";

export type MarketReport = {
  id: string;
  listing_id: string;
  milestone_days: number;
  report_date: string;

  realtor_views?: number | null;
  realtor_clicks?: number | null;
  realtor_saves?: number | null;

  rew_views?: number | null;
  rew_clicks?: number | null;

  facebook_views?: number | null;
  facebook_clicks?: number | null;

  google_views?: number | null;
  google_clicks?: number | null;

  executive_summary?: string | null;
  notes?: string | null;

  created_at?: string;
  updated_at?: string;
};

export type ReportItem = {
  listing: Listing;
  milestone: number;
  reportDate: string;
  reviewDate: string;
  state: DeadlineState;
  completion?: Completion;
  marketReport?: MarketReport;
};
