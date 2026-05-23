import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getAttachmentType,
  normalizePlateNumber,
  plateNumberSchema,
} from "@/lib/cars/validation";

describe("car validation", () => {
  it("normalizes plate input to uppercase without separators", () => {
    assert.equal(normalizePlateNumber("01-a-234-bc"), "01A234BC");
  });

  it("accepts Uzbek plate numbers in the required format", () => {
    assert.equal(plateNumberSchema.parse("01a234bc"), "01A234BC");
  });

  it("rejects invalid Uzbek plate numbers", () => {
    assert.equal(plateNumberSchema.safeParse("A1A234BC").success, false);
  });

  it("detects supported attachment types", () => {
    assert.equal(getAttachmentType("image/webp"), "image");
    assert.equal(getAttachmentType("application/pdf"), "pdf");
    assert.equal(getAttachmentType("text/plain"), null);
  });
});
