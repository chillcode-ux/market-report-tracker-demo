# Market Report Tracker — Portfolio Reference & Engineering Notes

**Document**: `PORTFOLIO_NOTES.md`  
**Author**: Ranphelps Decritales  
**Purpose**: Document the real operational context, historical spreadsheet origins, automation boundaries, and sanitization measures. This prevents future portfolio case studies from exaggerating or misrepresenting the project.

---

## 1. Why the Original Spreadsheet Existed

In real estate operations, client communication is paramount. Once a property is listed on the MLS, sellers expect regular market activity updates, showing feedback, syndication views, and comparative market analysis (CMA) adjustments.

To ensure no listing was neglected, our operational standard mandated sending formal **Market Reports** at specific intervals:
- **Week 1 (Day 7)**: Launch syndication & initial viewing traffic recap.
- **Week 2 (Day 14)**: Two-week market absorption check.
- **Week 3 (Day 21)**: Showing feedback and competing listing adjustments.
- **Month 1 (Day 30)**: Comprehensive monthly strategy report.
- **Subsequent Milestones**: 45, 60, 90, 120, 150, 180 days, and every 30 days until sold or expired.

To coordinate this across 15–30 active listings simultaneously, I initially created a tracking spreadsheet.

---

## 2. How the Spreadsheet Workflow Functioned (Before)

1. **Matrix MLS Export**:
   - I logged into the regional Matrix MLS portal, filtered active team listings, and exported CSV data containing MLS numbers, property addresses, and listed dates.
2. **Spreadsheet Ingestion**:
   - Imported the CSV into Excel / Google Sheets.
   - Checked for re-lists, price changes, and cancellations.
3. **Formula Calculations**:
   - Formulas calculated milestone dates (`=B2 + 7`, `=B2 + 14`, etc.).
   - Another column subtracted 1 day for the **Final Review Date** (the internal deadline to compile analytics before sending the report to the client).
4. **Manual Tracking**:
   - Every morning, I opened the spreadsheet, applied date filters, and scrolled horizontally across columns to spot which listings had milestones approaching.
   - When a report was completed, I manually entered a checkmark or date into the corresponding cell and typed brief feedback notes in separate tabs.

---

## 3. Why the Spreadsheet Became Difficult

- **Visual Clutter & Scale**: As inventory grew, a single row had over 15 date columns. Scanning for upcoming deadlines across 20+ rows was cognitively heavy.
- **Status Shifts**: When listings went pending or sold, formulas still projected dates unless rows were manually hidden or moved.
- **No Priority Triage**: A spreadsheet does not automatically surface *"Here are the 3 properties you must review by 2:00 PM today"*. It requires intentional filtering.
- **Date Rigidity**: Calculating deadlines across months and weekends created friction in maintaining calendar views.

---

## 4. What the Application Automated (After)

- **One Listed Date Entry**: Entering a property's MLS, address, and listed date automatically derives the entire multi-month milestone sequence in runtime memory.
- **Zero Pre-Stored Deadlines**: Deadlines are calculated dynamically (`listed_date + milestone`), ensuring data consistency without complex cron jobs or stale database rows.
- **Priority Dashboard**: The "Needs Attention" card feed immediately flags properties due for final review today, tomorrow, or overdue.
- **Interactive Calendar**: Automatically plots derived review dates onto an interactive monthly grid.
- **Audit History**: Marking a report complete logs an immutable timestamped completion record with optional notes.
- **Lifecycle Tracking**: Changing a listing to Pending or Sold automatically halts future report deadlines while preserving completed history.

---

## 5. What Was Fictionalized for the Public Demo

| Element | Real Production Tracker | Public Demo Version |
| :--- | :--- | :--- |
| **Branding** | DWA Market Report Tracker | **Market Report Tracker** (Neutral Demo) |
| **Addresses** | Real British Columbia properties | **Fictional Addresses** (e.g. *118 Harbour View Drive*) |
| **MLS Numbers** | 7-digit real MLS IDs (e.g. `1046542`) | **Demo IDs** (`DEMO-001` through `DEMO-008`) |
| **Agent Names** | Real team members | **Fictional Names** (*Sarah Jenkins*, *David Chen*, etc.) |
| **Database** | Authenticated Supabase PostgreSQL | **Zero-Maintenance Client Engine** (`localStorage`) |
| **Authentication** | Supabase Auth (Invite-only email login) | **Direct Visitor Access** (No login walls) |
| **Dates** | Fixed historical calendar dates | **Dynamic Relative Dates** (Always anchored to visitor's `today`) |
| **Demo Reset** | N/A (Production database) | **"Reset Demo" Action** (Instant restore to clean sample state) |

---

## 6. What Should Never Be Exposed Publicly

- Real client addresses, sale prices, commission notes, or seller contact details.
- Real MLS numbers linking to MLS Matrix accounts.
- Supabase production project URLs, service role keys, or anon keys.
- Internal team communications or private seller feedback logs.

---

## 7. What Functionality Existed Before vs. Added for Demo

### Existed in Real Tool:
- Pure milestone calculation engine (`lib/dates.ts`).
- Dashboard with Overdue, Today, Tomorrow, This Week, Active counters.
- "Needs Attention" card grid.
- Monthly interactive calendar with day dialogs.
- Listings inventory with search, status filters, and sorting.
- Listing detail timeline with completed and upcoming milestones.
- Archived listings view with reactivation flow.

### Added Specifically for the Demo:
- **Local State Repository (`lib/store.tsx`)**: Replaced Supabase backend with zero-maintenance client storage.
- **Dynamic Sample Data (`lib/demo-data.ts`)**: Generates dates relative to `today` so the demo never displays stale 2024/2025 deadlines.
- **Demo Reset Function**: Single-click button allowing portfolio reviewers to restore original sample data.
- **Sanitized Brand & Subtitle**: Removed all client agency branding and added "Operations Workflow Demo" cues.
- **Portfolio Navigation**: Integrated back-link to Ran's portfolio.
