"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  LayoutDashboard,
  List,
  Menu,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { useDemoStore } from "@/lib/store";
import { Toaster } from "sonner";

const navLinks = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/listings", label: "Listings", icon: List },
  { href: "/archived", label: "Archived", icon: Archive },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { resetDemo } = useDemoStore();

  const handleReset = () => {
    if (confirm("Reset all demo listings and completion states back to the original sample state?")) {
      resetDemo();
    }
  };

  const navContent = (
    <>
      {navLinks.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-forest text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-cream text-ink md:flex">
      <Toaster position="top-right" richColors />

      {/* Desktop Sidebar */}
      <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white p-5 md:flex md:flex-col shadow-sm">
        {/* Brand Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-forest/10 border border-forest/20 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-forest">
              <Sparkles size={11} />
              Operations Demo
            </span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-slate-900">
            Market Report Tracker
          </h1>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Real Estate Operations Workflow Demo
          </p>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5 flex-1">{navContent}</nav>

        {/* Sidebar Footer: Reset Demo & Portfolio Link */}
        <div className="mt-auto pt-5 border-t border-slate-200 space-y-2">
          {/* Subtle Reset Demo Button */}
          <button
            onClick={handleReset}
            title="Reset sample listings and completions"
            className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            <span className="flex items-center gap-2">
              <RotateCcw size={14} className="text-forest" />
              Reset Demo
            </span>
            <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">
              Sample Data
            </span>
          </button>

          {/* Return to Ran's Portfolio */}
          <a
            href="http://localhost:3000"
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-500 hover:text-forest transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Ran&apos;s Portfolio
          </a>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden sticky top-0 z-30 shadow-sm">
        <div>
          <div className="text-base font-black text-slate-900 leading-tight">
            Market Report Tracker
          </div>
          <div className="text-[11px] text-slate-500">Real Estate Operations Demo</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            title="Reset Demo"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            <RotateCcw size={16} />
          </button>
          <button
            aria-label="Toggle navigation menu"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Nav Dropdown */}
      {mobileOpen && (
        <div className="border-b border-slate-200 bg-white p-4 md:hidden shadow-lg space-y-2">
          <nav className="space-y-1">{navContent}</nav>
          <div className="pt-3 border-t border-slate-100">
            <a
              href="http://localhost:3000"
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-forest"
            >
              <ArrowLeft size={14} />
              Return to Ran&apos;s Portfolio
            </a>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="min-w-0 flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">{children}</main>
    </div>
  );
}
