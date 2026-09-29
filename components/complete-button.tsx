"use client";

import React, { useState } from "react";
import { useDemoStore } from "@/lib/store";
import { displayDate } from "@/lib/dates";
import { Check } from "lucide-react";

interface CompleteButtonProps {
  listingId: string;
  address: string;
  milestone: number;
  reviewDate: string;
  reportDate: string;
}

export function CompleteButton({
  listingId,
  address,
  milestone,
  reviewDate,
  reportDate,
}: CompleteButtonProps) {
  const { completeReport } = useDemoStore();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const handleComplete = async () => {
    setBusy(true);
    const success = await completeReport(listingId, milestone, notes);
    setBusy(false);
    if (success) {
      setOpen(false);
      setNotes("");
    }
  };

  return (
    <>
      <button className="btn-primary w-full" onClick={() => setOpen(true)}>
        <Check size={16} />
        Mark Report Done
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm animate-fadeIn"
          onMouseDown={() => setOpen(false)}
        >
          <div
            className="card w-full max-w-md p-6 shadow-2xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-xl font-bold text-slate-900">Confirm report completion</h2>
              <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                {milestone}-DAY
              </span>
            </div>

            <p className="mt-3 font-semibold text-slate-900">{address}</p>
            <p className="text-sm text-slate-500">{milestone}-Day Market Report</p>

            <div className="my-5 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 border border-slate-200">
              <div>
                <div className="label">Final Review</div>
                <div className="mt-1 font-bold text-slate-900">
                  {displayDate(reviewDate, "MMMM d, yyyy")}
                </div>
              </div>
              <div className="border-l border-slate-200 pl-3">
                <div className="label">Official Report Date</div>
                <div className="mt-1 font-bold text-slate-900">
                  {displayDate(reportDate, "MMMM d, yyyy")}
                </div>
              </div>
            </div>

            <label className="block">
              <span className="label">Completion Notes (Optional)</span>
              <textarea
                className="field mt-1.5"
                rows={3}
                placeholder="Analytics reviewed and report prepared."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>

            <div className="mt-6 flex justify-end gap-2 border-t pt-4">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setOpen(false)}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={busy}
                onClick={handleComplete}
              >
                {busy ? "Saving..." : "Confirm Complete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
