import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getMasterAvatarColor,
  getMasterInitials,
} from "@/lib/masters/presentation";

describe("master presentation helpers", () => {
  it("builds initials from master names", () => {
    assert.equal(getMasterInitials("Ali Valiyev"), "AV");
    assert.equal(getMasterInitials("Madina"), "M");
  });

  it("returns deterministic avatar colors from ids", () => {
    assert.equal(getMasterAvatarColor("master-1"), getMasterAvatarColor("master-1"));
    assert.notEqual(getMasterAvatarColor("master-1"), "");
  });
});
