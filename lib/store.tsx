"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getInitialDemoData } from "./demo-data";
import type { Completion, Listing, ListingStatus, MarketReport } from "./types";
import { toast } from "sonner";

const STORAGE_KEY_LISTINGS = "mrt_demo_listings_v2";
const STORAGE_KEY_COMPLETIONS = "mrt_demo_completions_v2";
const STORAGE_KEY_REPORTS = "mrt_demo_reports_v2";

interface DemoStoreContextType {
  listings: Listing[];
  completions: Completion[];
  marketReports: MarketReport[];
  isHydrated: boolean;
  completeReport: (listingId: string, milestone: number, notes?: string) => Promise<boolean>;
  saveReport: (report: Partial<MarketReport>, markCompleted?: boolean) => Promise<boolean>;
  addListing: (data: {
    mls_number: string;
    address: string;
    listed_date: string;
    status: ListingStatus;
    tracking_enabled: boolean;
    price?: number | null;
    cycle_number?: number;
    agent?: string | null;
    notes?: string | null;
  }) => Promise<boolean>;
  updateListing: (id: string, updates: Partial<Listing>) => Promise<boolean>;
  reactivateListing: (id: string) => Promise<boolean>;
  resetDemo: () => void;
}

const DemoStoreContext = createContext<DemoStoreContextType | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<{
    listings: Listing[];
    completions: Completion[];
    marketReports: MarketReport[];
  }>(() => getInitialDemoData());

  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      const savedListings = localStorage.getItem(STORAGE_KEY_LISTINGS);
      const savedCompletions = localStorage.getItem(STORAGE_KEY_COMPLETIONS);
      const savedReports = localStorage.getItem(STORAGE_KEY_REPORTS);

      if (savedListings && savedCompletions) {
        setData({
          listings: JSON.parse(savedListings),
          completions: JSON.parse(savedCompletions),
          marketReports: savedReports ? JSON.parse(savedReports) : getInitialDemoData().marketReports,
        });
      } else {
        const initial = getInitialDemoData();
        localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(initial.listings));
        localStorage.setItem(STORAGE_KEY_COMPLETIONS, JSON.stringify(initial.completions));
        localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(initial.marketReports));
        setData(initial);
      }
    } catch {
      setData(getInitialDemoData());
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save changes to localStorage
  const persist = (
    newListings: Listing[],
    newCompletions: Completion[],
    newReports: MarketReport[]
  ) => {
    try {
      localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(newListings));
      localStorage.setItem(STORAGE_KEY_COMPLETIONS, JSON.stringify(newCompletions));
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(newReports));
    } catch (e) {
      console.warn("Could not persist demo state to localStorage:", e);
    }
    setData({
      listings: newListings,
      completions: newCompletions,
      marketReports: newReports,
    });
  };

  const completeReport = async (listingId: string, milestone: number, notes?: string) => {
    const existing = data.completions.find(
      (c) => c.listing_id === listingId && c.milestone_days === milestone
    );
    if (existing) {
      toast.info(`${milestone}-Day report was already completed.`);
      return false;
    }

    const newComp: Completion = {
      id: `comp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      listing_id: listingId,
      milestone_days: milestone,
      completed_at: new Date().toISOString(),
      notes: notes || null,
      created_at: new Date().toISOString(),
    };

    const newCompletions = [newComp, ...data.completions];
    persist(data.listings, newCompletions, data.marketReports);
    toast.success(`${milestone}-Day Market Report marked complete!`);
    return true;
  };

  const saveReport = async (
    reportPayload: Partial<MarketReport>,
    markCompleted = true
  ): Promise<boolean> => {
    if (!reportPayload.listing_id || !reportPayload.milestone_days) {
      toast.error("Missing listing or milestone for report");
      return false;
    }

    const reportId =
      reportPayload.id ||
      `rep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const fullReport: MarketReport = {
      id: reportId,
      listing_id: reportPayload.listing_id,
      milestone_days: Number(reportPayload.milestone_days),
      report_date: reportPayload.report_date || new Date().toISOString().slice(0, 10),
      realtor_views: reportPayload.realtor_views ?? null,
      realtor_clicks: reportPayload.realtor_clicks ?? null,
      realtor_saves: reportPayload.realtor_saves ?? null,
      rew_views: reportPayload.rew_views ?? null,
      rew_clicks: reportPayload.rew_clicks ?? null,
      facebook_views: reportPayload.facebook_views ?? null,
      facebook_clicks: reportPayload.facebook_clicks ?? null,
      google_views: reportPayload.google_views ?? null,
      google_clicks: reportPayload.google_clicks ?? null,
      executive_summary: reportPayload.executive_summary?.trim() || null,
      notes: reportPayload.notes?.trim() || null,
      created_at: reportPayload.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newReports = [
      fullReport,
      ...data.marketReports.filter(
        (r) =>
          r.id !== reportId &&
          !(
            r.listing_id === fullReport.listing_id &&
            r.milestone_days === fullReport.milestone_days
          )
      ),
    ];

    let newCompletions = data.completions;
    if (markCompleted) {
      const existingComp = newCompletions.find(
        (c) =>
          c.listing_id === fullReport.listing_id &&
          c.milestone_days === fullReport.milestone_days
      );
      if (!existingComp) {
        newCompletions = [
          {
            id: `comp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            listing_id: fullReport.listing_id,
            milestone_days: fullReport.milestone_days,
            completed_at: `${fullReport.report_date}T12:00:00.000Z`,
            notes:
              fullReport.executive_summary?.slice(0, 80) ||
              "Market report completed with analytics",
            created_at: new Date().toISOString(),
          },
          ...newCompletions,
        ];
      }
    }

    persist(data.listings, newCompletions, newReports);
    toast.success(
      `Day ${fullReport.milestone_days} Market Report saved successfully!`
    );
    return true;
  };

  const addListing = async (newListingData: {
    mls_number: string;
    address: string;
    listed_date: string;
    status: ListingStatus;
    tracking_enabled: boolean;
    price?: number | null;
    cycle_number?: number;
    agent?: string | null;
    notes?: string | null;
  }) => {
    const now = new Date().toISOString();
    const newListing: Listing = {
      id: `listing-${Date.now()}`,
      mls_number: newListingData.mls_number,
      address: newListingData.address,
      listed_date: newListingData.listed_date,
      status: newListingData.status,
      tracking_enabled: newListingData.tracking_enabled,
      price: newListingData.price || null,
      cycle_number: newListingData.cycle_number || 1,
      is_current: true,
      agent: newListingData.agent || null,
      notes: newListingData.notes || null,
      created_at: now,
      updated_at: now,
    };

    const newListings = [newListing, ...data.listings];
    persist(newListings, data.completions, data.marketReports);
    toast.success(`Listing ${newListing.address} added! Deadlines calculated.`);
    return true;
  };

  const updateListing = async (id: string, updates: Partial<Listing>) => {
    const newListings = data.listings.map((l) =>
      l.id === id ? { ...l, ...updates, updated_at: new Date().toISOString() } : l
    );
    persist(newListings, data.completions, data.marketReports);
    toast.success("Listing updated successfully.");
    return true;
  };

  const reactivateListing = async (id: string) => {
    const newListings = data.listings.map((l) =>
      l.id === id
        ? { ...l, tracking_enabled: true, updated_at: new Date().toISOString() }
        : l
    );
    persist(newListings, data.completions, data.marketReports);
    toast.success("Listing reactivated for report tracking.");
    return true;
  };

  const resetDemo = () => {
    try {
      localStorage.removeItem(STORAGE_KEY_LISTINGS);
      localStorage.removeItem(STORAGE_KEY_COMPLETIONS);
      localStorage.removeItem(STORAGE_KEY_REPORTS);
    } catch {}
    const initial = getInitialDemoData();
    persist(initial.listings, initial.completions, initial.marketReports);
    toast.success("Demo reset to original sample state.");
  };

  return (
    <DemoStoreContext.Provider
      value={{
        listings: data.listings,
        completions: data.completions,
        marketReports: data.marketReports,
        isHydrated,
        completeReport,
        saveReport,
        addListing,
        updateListing,
        reactivateListing,
        resetDemo,
      }}
    >
      {children}
    </DemoStoreContext.Provider>
  );
}

export function useDemoStore() {
  const ctx = useContext(DemoStoreContext);
  if (!ctx) {
    throw new Error("useDemoStore must be used within a DemoProvider");
  }
  return ctx;
}
