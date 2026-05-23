import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  formatInvoiceNumber,
  invoicePdfFileName,
} from "@/lib/invoices/formatting";

describe("invoice formatting", () => {
  it("formats invoice sequence numbers", () => {
    assert.equal(formatInvoiceNumber(1), "#INV-0001");
    assert.equal(formatInvoiceNumber(42), "#INV-0042");
  });

  it("builds a safe invoice PDF filename", () => {
    assert.equal(
      invoicePdfFileName("cm123", "01A234BC"),
      "INV-cm123-01A234BC.pdf"
    );
  });
});
