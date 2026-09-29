"use client";

import React, { FormEvent, useState } from "react";
import { useDemoStore } from "@/lib/store";
import type { Listing, ListingStatus } from "@/lib/types";
import { dateKey, getTodayKey } from "@/lib/dates";

const statuses: ListingStatus[] = ["Active", "Pending", "Sold", "Cancelled", "Expired"];

export function ListingForm({
  listing,
  onClose,
}: {
  listing?: Listing;
  onClose: () => void;
}) {
  const { addListing, updateListing } = useDemoStore();
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    mls_number: listing?.mls_number || `DEMO-00${Math.floor(Math.random() * 90) + 10}`,
    address: listing?.address || "",
    listed_date: listing?.listed_date || getTodayKey(),
    status: listing?.status || ("Active" as ListingStatus),
    tracking_enabled: listing?.tracking_enabled ?? true,
    agent: listing?.agent || "Sarah Jenkins",
    notes: listing?.notes || "",
  });

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.address.trim() || !form.mls_number.trim() || !form.listed_date) {
      return;
    }

    let payload = {
      ...form,
      agent: form.agent || null,
      notes: form.notes || null,
    };

    if (form.status !== "Active" && form.tracking_enabled) {
      if (
        confirm(
          "Stop future Market Report tracking?\n\nThis listing will remain saved in Archived Listings and can be reactivated later."
        )
      ) {
        payload.tracking_enabled = false;
      }
    }

    setBusy(true);
    if (listing) {
      await updateListing(listing.id, payload);
    } else {
      await addListing(payload);
    }
    setBusy(false);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-40 grid place-items-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm animate-fadeIn"
      onMouseDown={onClose}
    >
      <form
        onSubmit={submit}
        onMouseDown={(e) => e.stopPropagation()}
        className="card my-6 w-full max-w-lg p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between border-b pb-3">
          <h2 className="text-xl font-bold text-slate-900">
            {listing ? "Edit Listing" : "Add Fictional Listing"}
          </h2>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded">
            Auto-Calculates Deadlines
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="label">MLS Number *</span>
            <input
              className="field mt-1"
              required
              placeholder="e.g. DEMO-009"
              value={form.mls_number}
              onChange={(e) => setForm({ ...form, mls_number: e.target.value })}
            />
          </label>

          <label>
            <span className="label">Listed Date *</span>
            <input
              className="field mt-1"
              type="date"
              required
              value={form.listed_date}
              onChange={(e) => setForm({ ...form, listed_date: e.target.value })}
            />
          </label>

          <label className="sm:col-span-2">
            <span className="label">Property Address *</span>
            <input
              className="field mt-1"
              required
              placeholder="e.g. 104 Pinecrest Terrace"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </label>

          <label>
            <span className="label">Status</span>
            <select
              className="field mt-1"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as ListingStatus })}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="label">Report Tracking</span>
            <select
              className="field mt-1"
              value={String(form.tracking_enabled)}
              onChange={(e) => setForm({ ...form, tracking_enabled: e.target.value === "true" })}
            >
              <option value="true">ON (Active Tracking)</option>
              <option value="false">OFF (Paused)</option>
            </select>
          </label>

          <label className="sm:col-span-2">
            <span className="label">Listing Agent</span>
            <input
              className="field mt-1"
              placeholder="e.g. Sarah Jenkins"
              value={form.agent}
              onChange={(e) => setForm({ ...form, agent: e.target.value })}
            />
          </label>

          <label className="sm:col-span-2">
            <span className="label">Operational Notes</span>
            <textarea
              className="field mt-1"
              rows={3}
              placeholder="e.g. Initial syndication launched. Open house planned this weekend."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </label>
        </div>

        <div className="mt-6 flex items-center justify-between border-t pt-4">
          <p className="text-xs text-slate-500">
            Timelines (7, 14, 21, 30, 45d...) derive instantly from Listed Date.
          </p>
          <div className="flex gap-2">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={busy}>
              Cancel
            </button>
            <button disabled={busy} className="btn-primary">
              {busy ? "Saving..." : listing ? "Save Changes" : "Add & Schedule"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
