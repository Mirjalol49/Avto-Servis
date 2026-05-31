import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { normalizeAuthPhone } from "@/lib/auth/phone";
import {
  assertAdminRole,
  createUserSchema,
  loginSchema,
} from "@/lib/auth/validation";

describe("auth phone helpers", () => {
  it("normalizes local Uzbek phone numbers for staff login", () => {
    assert.equal(normalizeAuthPhone("937489141"), "998937489141");
    assert.equal(normalizeAuthPhone("+998 93 748 91 41"), "998937489141");
  });
});

describe("loginSchema", () => {
  it("accepts phone number and password login", () => {
    const result = loginSchema.safeParse({
      phone: "937489141",
      password: "123456",
    });

    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.phone, "998937489141");
    }
  });
});

describe("createUserSchema", () => {
  it("accepts valid admin-created user input", () => {
    const result = createUserSchema.safeParse({
      name: "Service Admin",
      email: "admin@example.com",
      phone: "937489141",
      password: "secret123",
      role: "ADMIN",
    });

    assert.equal(result.success, true);
  });

  it("rejects invalid email, short password, and unknown role", () => {
    const result = createUserSchema.safeParse({
      name: "",
      email: "invalid",
      phone: "123",
      password: "123",
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
