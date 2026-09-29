import { describe, expect, it } from "vitest";
import {
  BASE_MILESTONES,
  getDeadlineStatus,
  getMilestones,
  getReportDate,
  getReviewDate,
} from "./dates";

describe("Market Report milestone rules", () => {
  it("calculates report date and review date for 7-day milestone", () => {
    const listed = "2026-09-01";
    const reportDate = getReportDate(listed, 7);
    const reviewDate = getReviewDate(reportDate);

    expect(reportDate).toBe("2026-09-08");
    expect(reviewDate).toBe("2026-09-07");
  });

  it("calculates report date and review date for 45-day milestone", () => {
    const listed = "2026-08-01";
    const reportDate = getReportDate(listed, 45);
    const reviewDate = getReviewDate(reportDate);

    expect(reportDate).toBe("2026-09-15");
    expect(reviewDate).toBe("2026-09-14");
  });

  it("generates milestone sequences through 180 days and beyond", () => {
    const milestones = getMilestones(240);
    expect(milestones.slice(0, 10)).toEqual([...BASE_MILESTONES]);
    expect(milestones).toContain(210);
    expect(milestones).toContain(240);
  });

  it("evaluates deadline status correctly relative to today", () => {
    const today = "2026-09-22";
    expect(getDeadlineStatus("2026-09-20", today)).toBe("overdue");
    expect(getDeadlineStatus("2026-09-22", today)).toBe("today");
    expect(getDeadlineStatus("2026-09-23", today)).toBe("tomorrow");
    expect(getDeadlineStatus("2026-09-25", today)).toBe("upcoming");
  });
});
