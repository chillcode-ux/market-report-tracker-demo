export type ListingStatus = "Active" | "Pending" | "Sold" | "Cancelled" | "Expired";

export type Listing = {
  id: string;
  mls_number: string;
  address: string;
  listed_date: string;
  status: ListingStatus;
  tracking_enabled: boolean;
  agent: string | null;
  notes: string | null;
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

export type DeadlineState = "overdue" | "today" | "tomorrow" | "upcoming" | "completed";

export type ReportItem = {
  listing: Listing;
  milestone: number;
  reportDate: string;
  reviewDate: string;
  state: DeadlineState;
  completion?: Completion;
};
