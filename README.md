# Market Report Tracker

> **Real Estate Operations Workflow Demo**  
> *A self-initiated internal automation replacing a spreadsheet-heavy listing report workflow.*

---

## 📌 Overview & Context

**Market Report Tracker** is a dedicated Next.js web application engineered to streamline the tracking, calculation, and completion of recurring real estate Market Report deadlines.

> [!IMPORTANT]
> **Privacy & Sanitization Statement**:  
> This public portfolio demonstration is completely isolated from the internal production environment. It runs on **100% fictional listing data**, fictional MLS numbers, dynamic relative dates, and client-side demo persistence. No real client addresses, agent records, MLS feeds, emails, or production database credentials exist in this repository.

---

## 🧩 The Problem: Spreadsheet Limitations

Managing client Market Reports originally started as a manual spreadsheet workflow:
1. Active property listings were exported periodically from the local MLS system (Matrix).
2. Listings were cleaned, filtered, and copy-pasted into a tracking workbook.
3. Original listed dates and relist dates had to be scrutinized to determine property age.
4. Excel formulas were used to project recurring report dates: **7, 14, 21, 30, 45, 60, 90, 120, 150, 180 days**, and every 30 days thereafter.
5. Completed reports were hand-checked, and feedback was noted across fragmented tabs.
6. Identifying what required attention today meant scanning dozens of rows and applying daily filters.

While the spreadsheet was a vital first iteration, scaling listing volume made scanning for impending deadlines increasingly error-prone and time-consuming.

---

## 💡 The Solution: From Spreadsheet to Software

Instead of continuing to bolt more macros and columns onto a spreadsheet, I designed and built this dedicated internal operations application.

### Workflow Evolution
```
BEFORE (Spreadsheet):
Matrix Export → Spreadsheet → Manual Cleaning → Formula Deadlines → Manual Scanning → Due Date Anxiety

AFTER (Web Application):
Add Listing → Runtime Deadlines → Priority Dashboard → Interactive Calendar → Completion Audit Trail
```

---

## ⚡ Core Features

1. **Priority Triage Dashboard**:
   - Immediate counters for **Overdue**, **Review Today**, **Tomorrow**, **This Week**, and **Active Listings**.
   - "Needs Attention" card grid highlighting properties whose Final Review is due today or overdue.
2. **Runtime Milestone Scheduling**:
   - Deadlines are never stored statically in a database; they are derived on-the-fly from the single `listed_date` using deterministic business rules.
   - Final Review is automatically scheduled **one calendar day before the Official Report Date**.
3. **Monthly Operations Calendar**:
   - High-level bird's-eye view across all properties with color-coded status badges.
   - Click any date to view detailed scheduled reports and execute immediate completions.
4. **Interactive Completion Tracking**:
   - Mark reports complete with optional operational notes (e.g., *"Analytics reviewed and report prepared."*).
   - Preserves complete timestamped history per property.
5. **Listing Lifecycle Management**:
   - Track status (Active, Pending, Sold, Cancelled, Expired) and toggle tracking state on/off.
   - Automatic archiving for pending/sold listings with reactivation support.
6. **Property Milestone Timeline**:
   - Comprehensive sequential view of all past completed and future projected milestones per home.
7. **Search & Multi-Filter Inventory**:
   - Fast filtering by address, MLS, listing status, and tracking state.
8. **Subtle "Reset Demo" Action**:
   - Allows portfolio visitors to reset sample listings and completions back to their initial state with one click.

---

## 🛠️ Architecture & Tech Stack

- **Framework**: Next.js 13.5+ (App Router)
- **Language**: TypeScript 5.3+
- **Styling**: Tailwind CSS (Professional Forest Green & Slate aesthetic)
- **Icons**: Lucide React
- **Date Engine**: `date-fns` (Vancouver `America/Vancouver` timezone anchoring)
- **Feedback & Toasts**: `sonner`
- **Demo State Storage**: Zero-maintenance client state engine backed by browser `localStorage` and dynamic generator functions.
- **Testing**: Vitest calculation suite verifying milestone date derivation and review logic.

---

## 📊 Fictional Demo Data (Relative to "Today")

To ensure the demo is always meaningful regardless of when a reviewer opens it, listed dates are generated dynamically relative to the current date:
- **118 Harbour View Drive** (`DEMO-001`): 45-Day Report — **Final Review Today**, Official Report Tomorrow.
- **42 Cedar Ridge Lane** (`DEMO-002`): 30-Day Report — **Overdue by 2 days**.
- **25 Maple Crest Way** (`DEMO-004`): 14-Day Report — **Final Review Tomorrow**.
- **93 Cedar Bay Road** (`DEMO-006`): 21-Day Report — **Review in 3 days (This Week)**.
- **512 Mountain View Terrace** (`DEMO-007`): 7-Day Report — **Final Review Today**.
- **816 Pacific Grove Road** (`DEMO-003`): Pending offer, tracking paused.
- **701 Oceanview Lane** (`DEMO-005`): Sold listing, archived history preserved.

---

## 🚀 Local Setup

```bash
# 1. Clone repository
git clone https://github.com/ranphelps/market-report-tracker-demo.git
cd market-report-tracker-demo

# 2. Install dependencies
npm install

# 3. Run unit tests
npm test

# 4. Start local development server (Port 3004)
npm run dev
```

Open [http://localhost:3004](http://localhost:3004) in your browser.

---

## 📜 Key Engineering Takeaway

> *"I did the task manually. Then I organized it in a spreadsheet. Then I turned the workflow into software."*
