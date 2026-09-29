"use client";

import React, { useState } from "react";
import { useDemoStore } from "@/lib/store";
import { RefreshCw } from "lucide-react";

export function ReactivateButton({ id }: { id: string }) {
  const { reactivateListing } = useDemoStore();
  const [busy, setBusy] = useState(false);

  const handleReactivate = async () => {
    setBusy(true);
    await reactivateListing(id);
    setBusy(false);
  };

  return (
    <button
      disabled={busy}
      onClick={handleReactivate}
      className="btn-secondary text-forest hover:border-forest/40"
    >
      <RefreshCw size={14} className={busy ? "animate-spin" : ""} />
      Reactivate Tracking
    </button>
  );
}
