"use server";

import type { JobStatus } from "@prisma/client";
import {
  addDays,
  endOfDay,
  format,
  startOfDay,
  startOfMonth,
  subDays,
} from "date-fns";

import { getDateKey, getLastNDays } from "@/lib/dashboard/dates";
import { jobStatusFlow } from "@/lib/jobs/status";
import { prisma } from "@/lib/prisma";

const activeJobStatuses: JobStatus[] = ["WAITING", "DIAGNOSED", "IN_PROGRESS"];
const completedJobStatuses: JobStatus[] = ["COMPLETED", "DELIVERED"];

export async function getDashboardStats() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const monthStart = startOfMonth(now);
  const last30DaysStart = startOfDay(subDays(now, 29));
  const last30DayKeys = getLastNDays(now, 30);

  const [
    todayJobsCount,
    activeJobsCount,
    todayRevenueAggregate,
    monthRevenueAggregate,
    totalCustomers,
    lowStockParts,
    jobsByStatusGrouped,
    paidInvoicesLast30Days,
    topMastersRaw,
    recentJobs,
  ] = await Promise.all([
    prisma.jobOrder.count({
      where: {
        createdAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    }),
    prisma.jobOrder.count({
      where: {
        status: {
          in: activeJobStatuses,
        },
      },
    }),
    prisma.invoice.aggregate({
      where: {
        isPaid: true,
        paidAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
      _sum: {
        totalAmount: true,
      },
    }),
    prisma.invoice.aggregate({
      where: {
        isPaid: true,
        paidAt: {
          gte: monthStart,
          lte: todayEnd,
        },
      },
      _sum: {
        totalAmount: true,
      },
    }),
    prisma.customer.count(),
    prisma.part.count({
      where: {
        stockQty: {
          lt: 5,
        },
      },
    }),
    prisma.jobOrder.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    }),
    prisma.invoice.findMany({
      where: {
        isPaid: true,
        paidAt: {
          gte: last30DaysStart,
          lte: todayEnd,
        },
      },
      select: {
        paidAt: true,
        totalAmount: true,
      },
    }),
    prisma.master.findMany({
      select: {
        id: true,
        name: true,
        specialization: true,
        jobOrders: {
          where: {
            status: {
              in: completedJobStatuses,
            },
            updatedAt: {
              gte: monthStart,
              lte: todayEnd,
            },
          },
          select: {
            totalCost: true,
          },
        },
      },
    }),
    prisma.jobOrder.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        status: true,
        createdAt: true,
        car: {
          select: {
            plateNumber: true,
            customer: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const jobsByStatus = Object.fromEntries(
    jobStatusFlow.map((status) => [status, 0])
  ) as Record<JobStatus, number>;

  for (const item of jobsByStatusGrouped) {
    jobsByStatus[item.status] = item._count.status;
  }

  const revenueByDate = new Map(last30DayKeys.map((date) => [date, 0]));

  for (const invoice of paidInvoicesLast30Days) {
    if (!invoice.paidAt) {
      continue;
    }

    const date = getDateKey(invoice.paidAt);
    revenueByDate.set(date, (revenueByDate.get(date) ?? 0) + Number(invoice.totalAmount));
  }

  return {
    todayJobsCount,
    activeJobsCount,
    todayRevenue: Number(todayRevenueAggregate._sum.totalAmount ?? 0),
    monthRevenue: Number(monthRevenueAggregate._sum.totalAmount ?? 0),
    totalCustomers,
    lowStockParts,
    jobsByStatus,
    revenueByDay: last30DayKeys.map((date) => ({
      date,
      label: format(addDays(new Date(`${date}T00:00:00.000`), 0), "MMM dd"),
      revenue: revenueByDate.get(date) ?? 0,
    })),
    topMasters: topMastersRaw
      .map((master) => ({
        id: master.id,
        name: master.name,
        specialization: master.specialization,
        completedJobsCount: master.jobOrders.length,
        revenue: master.jobOrders.reduce((total, job) => {
          return total + Number(job.totalCost ?? 0);
        }, 0),
      }))
      .filter((master) => master.completedJobsCount > 0)
      .sort((left, right) => right.completedJobsCount - left.completedJobsCount)
      .slice(0, 5),
    recentJobs,
    lastUpdatedAt: now,
  };
}
