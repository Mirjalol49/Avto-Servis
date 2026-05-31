import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  assertCanApproveEstimate,
  assertCanEditJobCosts,
  assertCanGenerateInvoice,
  assertCanMarkInvoicePaid,
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
          hasPaidInvoice: false,
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
          hasPaidInvoice: false,
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
          hasPaidInvoice: false,
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
          hasPaidInvoice: false,
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
        hasPaidInvoice: false,
      }),
      ["DIAGNOSED"]
    );
  });

  it("requires a paid invoice before COMPLETED can move to DELIVERED", () => {
    assert.throws(
      () =>
        assertCanTransitionJobStatus("COMPLETED", "DELIVERED", {
          hasDiagnosis: true,
          approvedByCustomer: true,
          hasAfterPhoto: true,
          hasPaidInvoice: false,
        }),
      /Paid invoice is required/
    );
  });

  it("allows delivery after invoice payment", () => {
    assert.doesNotThrow(() =>
      assertCanTransitionJobStatus("COMPLETED", "DELIVERED", {
        hasDiagnosis: true,
        approvedByCustomer: true,
        hasAfterPhoto: true,
        hasPaidInvoice: true,
      })
    );
  });

  it("only approves estimates after diagnosis and before invoice generation", () => {
    assert.throws(
      () =>
        assertCanApproveEstimate({
          status: "WAITING",
          hasDiagnosis: true,
          hasInvoice: false,
        }),
      /after diagnosis/
    );

    assert.throws(
      () =>
        assertCanApproveEstimate({
          status: "DIAGNOSED",
          hasDiagnosis: true,
          hasInvoice: true,
        }),
      /Invoice already exists/
    );
  });

  it("locks job costs after approval, completion, delivery, or invoice generation", () => {
    assert.throws(
      () =>
        assertCanEditJobCosts({
          status: "DIAGNOSED",
          approvedByCustomer: true,
          hasInvoice: false,
        }),
      /Job costs are locked/
    );

    assert.throws(
      () =>
        assertCanEditJobCosts({
          status: "COMPLETED",
          approvedByCustomer: false,
          hasInvoice: false,
        }),
      /Job costs are locked/
    );
  });

  it("only generates invoices for completed jobs", () => {
    assert.throws(() => assertCanGenerateInvoice("IN_PROGRESS"), /completed/);
    assert.doesNotThrow(() => assertCanGenerateInvoice("COMPLETED"));
  });

  it("only marks unpaid completed-job invoices as paid", () => {
    assert.throws(
      () => assertCanMarkInvoicePaid({ isPaid: true, jobStatus: "COMPLETED" }),
      /already paid/
    );
    assert.throws(
      () => assertCanMarkInvoicePaid({ isPaid: false, jobStatus: "IN_PROGRESS" }),
      /completed jobs/
    );
    assert.doesNotThrow(() =>
      assertCanMarkInvoicePaid({ isPaid: false, jobStatus: "COMPLETED" })
    );
  });
});
