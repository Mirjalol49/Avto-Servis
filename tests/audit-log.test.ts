import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { AuditAction } from "@/lib/audit/log";

describe("audit log action types", () => {
  it("includes key production actions", () => {
    const action: AuditAction = "INVOICE_PAID";

    assert.equal(action, "INVOICE_PAID");
  });
});
