import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  customerSchema,
  formatUzbekPhone,
  normalizeUzbekPhone,
} from "@/lib/customers/validation";

describe("customer phone helpers", () => {
  it("accepts Uzbek phone input and normalizes it to raw digits", () => {
    const parsed = customerSchema.parse({
      name: "Ali Valiyev",
      phone: "+998901234567",
    });

    assert.equal(parsed.phone, "998901234567");
  });

  it("accepts already-normalized stored phone digits", () => {
    const parsed = customerSchema.parse({
      name: "Ali Valiyev",
      phone: "998901234567",
    });

    assert.equal(parsed.phone, "998901234567");
  });

  it("rejects phone values outside +998XXXXXXXXX format", () => {
    const result = customerSchema.safeParse({
      name: "Ali Valiyev",
      phone: "+997901234567",
    });

    assert.equal(result.success, false);
  });

  it("formats raw stored digits for display", () => {
    assert.equal(formatUzbekPhone("998901234567"), "+998 90 123 45 67");
  });

  it("returns null when phone input cannot be normalized", () => {
    assert.equal(normalizeUzbekPhone("901234567"), null);
  });
});
