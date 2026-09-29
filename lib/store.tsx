"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getInitialDemoData } from "./demo-data";
import type { Completion, Listing, ListingStatus } from "./types";
import { toast } from "sonner";

const STORAGE_KEY_LISTINGS = "mrt_demo_listings_v1";
const STORAGE_KEY_COMPLETIONS = "mrt_demo_completions_v1";

interface DemoStoreContextType {
  listings: Listing[];
  completions: Completion[];
  isHydrated: boolean;
  completeReport: (listingId: string, milestone: number, notes?: string) => Promise<boolean>;
  addListing: (data: {
    mls_number: string;
    address: string;
    listed_date: string;
    status: ListingStatus;
    tracking_enabled: boolean;
    agent?: string | null;
    notes?: string | null;
  }) => Promise<boolean>;
  updateListing: (id: string, updates: Partial<Listing>) => Promise<boolean>;
  reactivateListing: (id: string) => Promise<boolean>;
  resetDemo: () => void;
}

const DemoStoreContext = createContext<DemoStoreContextType | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<{ listings: Listing[]; completions: Completion[] }>(() =>
    getInitialDemoData()
  );
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    try {
      const savedListings = localStorage.getItem(STORAGE_KEY_LISTINGS);
      const savedCompletions = localStorage.getItem(STORAGE_KEY_COMPLETIONS);

      if (savedListings && savedCompletions) {
        setData({
          listings: JSON.parse(savedListings),
          completions: JSON.parse(savedCompletions),
        });
      } else {
        const initial = getInitialDemoData();
        localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(initial.listings));
        localStorage.setItem(STORAGE_KEY_COMPLETIONS, JSON.stringify(initial.completions));
        setData(initial);
      }
    } catch {
      // Fallback to initial dynamic data
      setData(getInitialDemoData());
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save changes to localStorage
  const persist = (newListings: Listing[], newCompletions: Completion[]) => {
    try {
      localStorage.setItem(STORAGE_KEY_LISTINGS, JSON.stringify(newListings));
      localStorage.setItem(STORAGE_KEY_COMPLETIONS, JSON.stringify(newCompletions));
    } catch (e) {
      console.warn("Could not persist demo state to localStorage:", e);
    }
    setData({ listings: newListings, completions: newCompletions });
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
    persist(data.listings, newCompletions);
    toast.success(`${milestone}-Day Market Report marked complete!`);
    return true;
  };

  const addListing = async (newListingData: {
    mls_number: string;
    address: string;
    listed_date: string;
    status: ListingStatus;
    tracking_enabled: boolean;
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
      agent: newListingData.agent || null,
      notes: newListingData.notes || null,
      created_at: now,
      updated_at: now,
    };

    const newListings = [newListing, ...data.listings];
    persist(newListings, data.completions);
    toast.success(`Listing ${newListing.address} added! Deadlines calculated.`);
    return true;
  };

  const updateListing = async (id: string, updates: Partial<Listing>) => {
    const newListings = data.listings.map((l) =>
      l.id === id ? { ...l, ...updates, updated_at: new Date().toISOString() } : l
    );
    persist(newListings, data.completions);
    toast.success("Listing updated successfully.");
    return true;
  };

  const reactivateListing = async (id: string) => {
    const newListings = data.listings.map((l) =>
      l.id === id ? { ...l, tracking_enabled: true, updated_at: new Date().toISOString() } : l
    );
    persist(newListings, data.completions);
    toast.success("Listing reactivated for report tracking.");
    return true;
  };

  const resetDemo = () => {
    try {
      localStorage.removeItem(STORAGE_KEY_LISTINGS);
      localStorage.removeItem(STORAGE_KEY_COMPLETIONS);
    } catch {}
    const initial = getInitialDemoData();
    persist(initial.listings, initial.completions);
    toast.success("Demo reset to original sample state.");
  };

  return (
    <DemoStoreContext.Provider
      value={{
        listings: data.listings,
        completions: data.completions,
        isHydrated,
        completeReport,
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
