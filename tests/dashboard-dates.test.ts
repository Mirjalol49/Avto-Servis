import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getLastNDays } from "@/lib/dashboard/dates";

describe("dashboard date helpers", () => {
  it("returns an inclusive list of date keys ending today", () => {
    const days = getLastNDays(new Date("2026-05-21T10:00:00.000Z"), 3);

    assert.deepEqual(days, ["2026-05-19", "2026-05-20", "2026-05-21"]);
  });
});
