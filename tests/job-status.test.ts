import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  assertCanTransitionJobStatus,
  getNextJobStatuses,
} from "@/lib/jobs/status";

describe("job status transitions", () => {
  it("prevents moving backwards", () => {
    assert.throws(
      () =>
        assertCanTransitionJobStatus("DIAGNOSED", "WAITING", {
          hasDiagnosis: true,
          approvedByCustomer: false,
          hasAfterPhoto: false,
        }),
      /Cannot move job status backwards/
    );
  });

  it("requires diagnosis before WAITING can move to DIAGNOSED", () => {
    assert.throws(
      () =>
        assertCanTransitionJobStatus("WAITING", "DIAGNOSED", {
          hasDiagnosis: false,
          approvedByCustomer: false,
          hasAfterPhoto: false,
        }),
      /Diagnosis notes are required/
    );
  });

  it("requires customer approval before DIAGNOSED can move to APPROVED", () => {
    assert.throws(
      () =>
        assertCanTransitionJobStatus("DIAGNOSED", "APPROVED", {
          hasDiagnosis: true,
          approvedByCustomer: false,
          hasAfterPhoto: false,
        }),
      /Customer approval is required/
    );
  });

  it("requires after photos before IN_PROGRESS can move to COMPLETED", () => {
    assert.throws(
      () =>
        assertCanTransitionJobStatus("IN_PROGRESS", "COMPLETED", {
          hasDiagnosis: true,
          approvedByCustomer: true,
          hasAfterPhoto: false,
        }),
      /At least one after photo is required/
    );
  });

  it("returns only valid next statuses", () => {
    assert.deepEqual(
      getNextJobStatuses("WAITING", {
        hasDiagnosis: true,
        approvedByCustomer: false,
        hasAfterPhoto: false,
      }),
      ["DIAGNOSED"]
    );
  });
});
