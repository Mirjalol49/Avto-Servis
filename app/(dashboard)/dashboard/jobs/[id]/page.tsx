import type { JobPhotoType } from "@prisma/client";
import { format } from "date-fns";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getAvailableParts } from "@/actions/jobParts";
import { getJobFormData, getJobOrderById } from "@/actions/jobs";
import { DiagnosisPanel } from "@/components/jobs/DiagnosisPanel";
import { JobCostingSection } from "@/components/jobs/JobCostingSection";
import { JobPhotosSection } from "@/components/jobs/JobPhotosSection";
import { JobStatusBadge } from "@/components/jobs/JobStatusBadge";
import { JobStatusChanger } from "@/components/jobs/JobStatusChanger";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getNextJobStatuses, jobStatusFlow, shortJobId } from "@/lib/jobs/status";
import { getCurrency } from "@/lib/money";

type JobDetailPageProps = {
  params: {
    id: string;
  };
};

export const dynamic = "force-dynamic";

function photosByType(
  photos: Array<{ id: string; url: string; type: JobPhotoType }>
) {
  return {
    BEFORE: photos.filter((photo) => photo.type === "BEFORE"),
    AFTER: photos.filter((photo) => photo.type === "AFTER"),
  };
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const [job, formData, availableParts] = await Promise.all([
    getJobOrderById(params.id),
    getJobFormData(),
    getAvailableParts(),
  ]);

  if (!job) {
    notFound();
  }

  const groupedPhotos = photosByType(job.photos);
  const afterPhotosVisible = jobStatusFlow.indexOf(job.status) >= jobStatusFlow.indexOf("IN_PROGRESS");
  const nextStatuses = getNextJobStatuses(job.status, {
    hasDiagnosis: Boolean(job.diagnosisNotes),
    approvedByCustomer: job.approvedByCustomer,
    hasAfterPhoto: groupedPhotos.AFTER.length > 0,
  });
  const currency = getCurrency();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-card/80 p-4 backdrop-blur-xl">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-heading text-2xl font-semibold">
                {shortJobId(job.id)}
              </h1>
              <JobStatusBadge status={job.status} />
            </div>
            <div className="text-sm text-muted-foreground">
              Created {format(job.createdAt, "dd MMM yyyy, HH:mm")}
            </div>
          </div>
          <JobStatusChanger
            jobId={job.id}
            currentStatus={job.status}
            nextStatuses={nextStatuses}
          />
        </div>
        <Separator />
        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href={`/dashboard/cars/${job.car.id}`}
            className="font-medium underline-offset-4 hover:underline"
          >
            {job.car.plateNumber}
          </Link>
          <span className="text-muted-foreground">·</span>
          <Link
            href={`/dashboard/customers/${job.car.customer.id}`}
            className="font-medium underline-offset-4 hover:underline"
          >
            {job.car.customer.name}
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Problem & Diagnosis</CardTitle>
          <CardDescription>Customer complaint and technician diagnosis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-muted/30 p-3">
              <div className="mb-2 text-sm font-medium">Problem description</div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {job.problemDescription}
              </p>
            </div>
            <DiagnosisPanel
              jobId={job.id}
              diagnosisNotes={job.diagnosisNotes}
              master={job.master}
              masters={formData.masters}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Before Photos</CardTitle>
          <CardDescription>Vehicle condition before service work</CardDescription>
        </CardHeader>
        <CardContent>
          <JobPhotosSection jobId={job.id} type="BEFORE" photos={groupedPhotos.BEFORE} />
        </CardContent>
      </Card>

      {afterPhotosVisible ? (
        <Card>
          <CardHeader>
            <CardTitle>After Photos</CardTitle>
            <CardDescription>Vehicle condition after service work</CardDescription>
          </CardHeader>
          <CardContent>
            <JobPhotosSection jobId={job.id} type="AFTER" photos={groupedPhotos.AFTER} />
          </CardContent>
        </Card>
      ) : null}

      <JobCostingSection
        jobId={job.id}
        parts={job.parts.map((item) => ({
          id: item.id,
          partName: item.part.name,
          unitPrice: Number(item.unitPrice),
          quantity: item.quantity,
        }))}
        availableParts={availableParts.map((part) => ({
          id: part.id,
          name: part.name,
          stockQty: part.stockQty,
          unitPrice: Number(part.unitPrice),
        }))}
        serviceFee={Number(job.serviceFee)}
        approvedByCustomer={job.approvedByCustomer}
        status={job.status}
        invoiceId={job.invoice?.id ?? null}
        currency={currency}
      />
    </div>
  );
}
