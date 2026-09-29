import React from "react";
import type { DeadlineState } from "@/lib/types";

const badges: Record<DeadlineState, { label: string; className: string }> = {
  overdue: { label: "OVERDUE", className: "bg-red-100 text-red-700 border-red-200" },
  today: { label: "REVIEW TODAY", className: "bg-orange-100 text-orange-800 border-orange-200" },
  tomorrow: { label: "TOMORROW", className: "bg-amber-100 text-amber-800 border-amber-200" },
  upcoming: { label: "UPCOMING", className: "bg-blue-100 text-blue-800 border-blue-200" },
  completed: { label: "COMPLETED", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
};

export function StatusBadge({ state }: { state: DeadlineState }) {
  const b = badges[state] || badges.upcoming;
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-bold tracking-wider ${b.className}`}
    >
      {b.label}
    </span>
  );
}
