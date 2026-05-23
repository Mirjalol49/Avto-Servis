import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { calculatePartsTotal, formatCurrency } from "@/lib/money";

describe("money helpers", () => {
  it("calculates parts totals from snapshot unit prices", () => {
    assert.equal(
      calculatePartsTotal([
        { quantity: 2, unitPrice: 12500 },
        { quantity: 3, unitPrice: "1000.5" },
      ]),
      28001.5
    );
  });

  it("formats currency using USD by default", () => {
    assert.equal(formatCurrency(12500), "$12,500.00");
  });

  it("formats UZS with space-separated thousands", () => {
    assert.equal(formatCurrency(1250000, "UZS"), "1 250 000 UZS");
  });
});
