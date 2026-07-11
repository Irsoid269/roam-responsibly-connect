import { describe, expect, it } from "vitest";
import {
  parseBookingSearchParams,
  toDateInputValue,
  withBookingDates,
} from "@/lib/search-booking-params";
import { ecoScoreBadge, ecoScoreFromKg } from "@/lib/eco-score";

describe("search-booking-params", () => {
  it("parses URL search params", () => {
    const params = new URLSearchParams(
      "destination=abc&from=2026-07-01T00:00:00.000Z&travelers=2"
    );
    expect(parseBookingSearchParams(params)).toEqual({
      destination: "abc",
      from: "2026-07-01T00:00:00.000Z",
      to: undefined,
      travelers: "2",
      type: undefined,
    });
  });

  it("formats date inputs", () => {
    expect(toDateInputValue("2026-07-11T12:00:00.000Z")).toBe("2026-07-11");
    expect(toDateInputValue(undefined)).toBe("");
  });

  it("appends booking dates to paths", () => {
    expect(withBookingDates("/booking/x", { from: "a", travelers: "2" })).toBe(
      "/booking/x?from=a&travelers=2"
    );
    expect(withBookingDates("/booking/x?type=sejour", { to: "b" })).toBe(
      "/booking/x?type=sejour&to=b"
    );
  });
});

describe("eco-score", () => {
  it("returns badge classes for grades", () => {
    expect(ecoScoreBadge("A")).toContain("eco-a");
    expect(ecoScoreBadge(null)).toContain("eco-b");
  });

  it("maps kg to grade", () => {
    expect(ecoScoreFromKg(0).grade).toBe("A");
    expect(ecoScoreFromKg(100).grade).toBeTruthy();
  });
});
