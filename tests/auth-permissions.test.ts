import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { roleAllowed } from "@/lib/auth/role";

describe("role permissions", () => {
  it("allows admins wherever receptionists are allowed", () => {
    assert.equal(roleAllowed("ADMIN", ["ADMIN", "RECEPTIONIST"]), true);
  });

  it("rejects users outside the allowed set", () => {
    assert.equal(roleAllowed("MASTER", ["ADMIN", "RECEPTIONIST"]), false);
  });
});
