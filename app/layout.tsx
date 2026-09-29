import type { Metadata } from "next";
import "./globals.css";
import { DemoProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "Market Report Tracker — Real Estate Operations Workflow Demo",
  description:
    "A self-initiated internal real estate operations tool that automatically calculates recurring Market Report deadlines, prioritizes upcoming reviews, and tracks completion history.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DemoProvider>{children}</DemoProvider>
      </body>
    </html>
  );
}
