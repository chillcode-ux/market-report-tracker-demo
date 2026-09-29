"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import type { Listing } from "@/lib/types";
import { displayDate, getDaysOnMarket, getNextReport } from "@/lib/dates";
import { ListingForm } from "./listing-form";
import { useDemoStore } from "@/lib/store";

export function ListingsView({ initialAdd = false }: { initialAdd?: boolean }) {
  const { listings, completions } = useDemoStore();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [tracking, setTracking] = useState("All");
  const [sort, setSort] = useState("review");
  const [editing, setEditing] = useState<Listing | undefined>();
  const [adding, setAdding] = useState(initialAdd);

  const filtered = useMemo(
    () =>
      listings
        .filter(
          (l) =>
            (l.address + l.mls_number).toLowerCase().includes(query.toLowerCase()) &&
            (status === "All" || l.status === status) &&
            (tracking === "All" || String(l.tracking_enabled) === tracking)
        )
        .sort((a, b) =>
          sort === "listed"
            ? b.listed_date.localeCompare(a.listed_date)
            : (getNextReport(a, completions)?.reviewDate || "9999").localeCompare(
                getNextReport(b, completions)?.reviewDate || "9999"
              )
        ),
    [listings, completions, query, status, tracking, sort]
  );

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label">Portfolio Inventory</p>
          <h1 className="text-2xl font-bold md:text-3xl text-slate-900">Listings</h1>
        </div>
        <button className="btn-primary" onClick={() => setAdding(true)}>
          <Plus size={18} />
          Add Listing
        </button>
      </div>

      {/* Filters Bar */}
      <div className="card mb-5 grid gap-3 p-4 md:grid-cols-4">
        <label className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            className="field pl-9"
            placeholder="Search address or MLS..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>

        <select className="field" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="All">All Statuses</option>
          {["Active", "Pending", "Sold", "Cancelled", "Expired"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select className="field" value={tracking} onChange={(e) => setTracking(e.target.value)}>
          <option value="All">All Tracking States</option>
          <option value="true">Tracking ON (Active)</option>
          <option value="false">Tracking OFF (Paused)</option>
        </select>

        <select className="field" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="review">Sort: Next Final Review</option>
          <option value="listed">Sort: Listed Date (Newest)</option>
        </select>
      </div>

      {/* Desktop Table */}
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:block">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 border-b border-slate-200">
            <tr>
              {[
                "MLS",
                "Address",
                "Listed Date",
                "DOM",
                "Status",
                "Next Report",
                "Final Review",
                "Tracking",
                "Actions",
              ].map((h) => (
                <th className="px-4 py-3 font-semibold" key={h}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => {
              const next = getNextReport(l, completions);
              return (
                <tr className="border-t border-slate-100 hover:bg-slate-50/70 transition" key={l.id}>
                  <td className="px-4 py-3 font-mono text-xs text-slate-600">{l.mls_number}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{l.address}</td>
                  <td className="px-4 py-3 text-slate-600">{displayDate(l.listed_date)}</td>
                  <td className="px-4 py-3 text-slate-600">{getDaysOnMarket(l.listed_date)} DOM</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold ${
                        l.status === "Active"
                          ? "bg-emerald-50 text-emerald-700"
                          : l.status === "Pending"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {next ? (
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                        {next.milestone}-Day
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-700 font-medium">
                    {next ? displayDate(next.reviewDate) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <b className={l.tracking_enabled ? "text-emerald-600" : "text-slate-400"}>
                      {l.tracking_enabled ? "ON" : "OFF"}
                    </b>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      className="text-forest hover:underline font-semibold"
                      href={`/listings/${l.id}`}
                    >
                      View
                    </Link>
                    <button
                      className="ml-3 text-forest hover:underline font-semibold"
                      onClick={() => setEditing(l)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-3 lg:hidden">
        {filtered.map((l) => {
          const next = getNextReport(l, completions);
          return (
            <div className="card p-4 shadow-sm" key={l.id}>
              <div className="flex justify-between items-start">
                <div>
                  <b className="text-base text-slate-900">{l.address}</b>
                  <p className="text-xs text-slate-500">MLS {l.mls_number}</p>
                </div>
                <b className={l.tracking_enabled ? "text-emerald-600 text-xs" : "text-slate-400 text-xs"}>
                  {l.tracking_enabled ? "TRACKING ON" : "TRACKING OFF"}
                </b>
              </div>

              <div className="my-3 grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500">Market Info:</span>
                  <p className="font-semibold text-slate-800">
                    {getDaysOnMarket(l.listed_date)} DOM · {l.status}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Next Milestone:</span>
                  <p className="font-semibold text-slate-800">
                    {next ? `${next.milestone}-Day (${displayDate(next.reviewDate)})` : "None"}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Link className="btn-secondary text-xs flex-1" href={`/listings/${l.id}`}>
                  View Timeline
                </Link>
                <button
                  className="btn-secondary text-xs flex-1"
                  onClick={() => setEditing(l)}
                >
                  Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {(adding || editing) && (
        <ListingForm
          listing={editing}
          onClose={() => {
            setAdding(false);
            setEditing(undefined);
          }}
        />
      )}
    </>
  );
}
