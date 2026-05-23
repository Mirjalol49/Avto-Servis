import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { assertAdminRole, createUserSchema } from "@/lib/auth/validation";

describe("createUserSchema", () => {
  it("accepts valid admin-created user input", () => {
    const result = createUserSchema.safeParse({
      name: "Service Admin",
      email: "admin@example.com",
      password: "secret123",
      role: "ADMIN",
    });

    assert.equal(result.success, true);
  });

  it("rejects invalid email, short password, and unknown role", () => {
    const result = createUserSchema.safeParse({
      name: "",
      email: "invalid",
      password: "short",
      role: "OWNER",
    });

    assert.equal(result.success, false);
  });
});

describe("assertAdminRole", () => {
  it("throws when the caller is not an admin", () => {
    assert.throws(() => assertAdminRole("MASTER"), /Admin access required/);
  });

  it("does not throw for admin callers", () => {
    assert.doesNotThrow(() => assertAdminRole("ADMIN"));
  });
});
