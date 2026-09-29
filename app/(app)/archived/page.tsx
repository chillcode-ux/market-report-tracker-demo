"use client";

import React from "react";
import Link from "next/link";
import { useDemoStore } from "@/lib/store";
import { displayDate } from "@/lib/dates";
import { ReactivateButton } from "@/components/reactivate-button";
import { Archive, ArrowRight } from "lucide-react";

export default function ArchivedPage() {
  const { listings, completions } = useDemoStore();
  const rows = listings.filter((l) => !l.tracking_enabled || l.status !== "Active");

  return (
    <>
      <div className="mb-6">
        <p className="label">Historical Records</p>
        <h1 className="text-2xl font-bold md:text-3xl text-slate-900">Archived Listings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Listings where active report tracking is paused, pending, or closed
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="card p-12 text-center shadow-sm">
          <Archive size={36} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-lg font-bold text-slate-900">No archived listings</h3>
          <p className="text-sm text-slate-500 mt-1">
            All current listings in the demo have active milestone tracking turned on.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((l) => {
            const completedForThis = completions.filter((c) => c.listing_id === l.id);
            const last = completedForThis.sort(
              (a, b) => b.milestone_days - a.milestone_days
            )[0];

            return (
              <div
                className="card flex flex-col gap-4 p-4 md:flex-row md:items-center shadow-sm hover:border-slate-300 transition"
                key={l.id}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="label font-mono">MLS {l.mls_number}</span>
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-semibold ${
                        l.status === "Sold"
                          ? "bg-purple-100 text-purple-800"
                          : l.status === "Pending"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {l.status}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      Tracking Paused
                    </span>
                  </div>

                  <b className="text-base text-slate-900">{l.address}</b>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Original Listed Date: {displayDate(l.listed_date, "MMMM d, yyyy")}
                    {l.agent ? ` · Agent: ${l.agent}` : ""}
                  </p>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs md:min-w-[200px]">
                  <span className="label text-[10px]">Last Completed Milestone</span>
                  <div className="font-semibold text-slate-800 mt-0.5">
                    {last
                      ? `${last.milestone_days}-Day Report (${displayDate(last.completed_at.slice(0, 10))})`
                      : "No reports filed"}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link className="btn-secondary text-xs" href={`/listings/${l.id}`}>
                    <span>View Timeline</span>
                    <ArrowRight size={14} />
                  </Link>
                  <ReactivateButton id={l.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
