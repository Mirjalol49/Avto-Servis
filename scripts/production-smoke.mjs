import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";

import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const baseUrl = process.env.PRODUCTION_SMOKE_URL ?? "https://avto-servis.vercel.app";

function loadEnvFile(file) {
  try {
    const content = readFileSync(file, "utf8");

    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");

      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed
        .slice(separatorIndex + 1)
        .trim()
        .replace(/^["']|["']$/g, "");

      process.env[key] ??= value;
    }
  } catch {
    // Production smoke can run from CI with environment variables only.
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required for production smoke cleanup");
}

const prisma = new PrismaClient();
const cookieJar = new Map();
const token = randomBytes(5).toString("hex");
const smoke = {
  userId: undefined,
  customerId: undefined,
  masterId: undefined,
  partId: undefined,
  carId: undefined,
  jobOrderId: undefined,
  invoiceId: undefined,
};

function collectCookies(response) {
  const setCookies =
    typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : response.headers.get("set-cookie")
        ? [response.headers.get("set-cookie")]
        : [];

  for (const cookie of setCookies) {
    const [pair] = cookie.split(";");
    const separatorIndex = pair.indexOf("=");

    if (separatorIndex > 0) {
      cookieJar.set(pair.slice(0, separatorIndex), pair.slice(separatorIndex + 1));
    }
  }
}

function cookieHeader() {
  return Array.from(cookieJar.entries())
    .map(([key, value]) => `${key}=${value}`)
    .join("; ");
}

async function request(path, init = {}) {
  const headers = new Headers(init.headers ?? {});
  const cookies = cookieHeader();

  if (cookies) {
    headers.set("cookie", cookies);
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
    redirect: init.redirect ?? "manual",
    cache: "no-store",
  });
  collectCookies(response);

  return response;
}

async function expectText(path, expectedText) {
  const response = await request(path);
  const body = await response.text();

  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }

  if (
    body.includes("Server Components render") ||
    body.includes("Application error")
  ) {
    throw new Error(`${path} rendered an error page`);
  }

  if (!body.includes(expectedText)) {
    throw new Error(`${path} did not include expected text: ${expectedText}`);
  }
}

async function signIn(email, password) {
  const csrfResponse = await request("/api/auth/csrf");

  if (!csrfResponse.ok) {
    throw new Error(`CSRF request failed with ${csrfResponse.status}`);
  }

  const { csrfToken } = await csrfResponse.json();
  const loginResponse = await request("/api/auth/callback/credentials", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      csrfToken,
      email,
      password,
      redirect: "false",
      callbackUrl: `${baseUrl}/dashboard`,
      json: "true",
    }),
  });
  const loginBody = await loginResponse.text();

  if (!loginResponse.ok || loginBody.includes("CredentialsSignin")) {
    throw new Error(`Credentials login failed with ${loginResponse.status}`);
  }

  const sessionResponse = await request("/api/auth/session");
  const session = await sessionResponse.json();

  if (session?.user?.email !== email || session?.user?.role !== "ADMIN") {
    throw new Error("Authenticated session does not contain smoke admin user");
  }
}

async function seedSmokeData() {
  const password = randomBytes(18).toString("base64url");
  const phoneSuffix = String(Date.now()).slice(-7);
  const customerPhone = `99890${phoneSuffix}`;
  const masterPhone = `99891${phoneSuffix}`;
  const plateDigits = String(Number.parseInt(token.slice(0, 4), 16) % 1000).padStart(3, "0");

  const user = await prisma.user.create({
    data: {
      name: `Smoke Admin ${token}`,
      email: `smoke-admin-${token}@example.com`,
      password: await hash(password, 12),
      role: "ADMIN",
    },
  });
  smoke.userId = user.id;

  const customer = await prisma.customer.create({
    data: {
      name: `Smoke Customer ${token}`,
      phone: customerPhone,
    },
  });
  smoke.customerId = customer.id;

  const master = await prisma.master.create({
    data: {
      name: `Smoke Master ${token}`,
      phone: masterPhone,
      specialization: "Diagnostics",
    },
  });
  smoke.masterId = master.id;

  const part = await prisma.part.create({
    data: {
      name: `Smoke Filter ${token}`,
      stockQty: 8,
      unitPrice: 25000,
    },
  });
  smoke.partId = part.id;

  const car = await prisma.car.create({
    data: {
      plateNumber: `88Z${plateDigits}ZX`,
      plateImageUrl: "https://placehold.co/400x300/png?text=Smoke+Plate",
      attachmentUrl: "https://placehold.co/400x300/png?text=Smoke+Document",
      attachmentType: "image",
      customerId: customer.id,
    },
  });
  smoke.carId = car.id;

  const jobOrder = await prisma.jobOrder.create({
    data: {
      carId: car.id,
      masterId: master.id,
      status: "DELIVERED",
      problemDescription: `Smoke diagnostic job ${token}`,
      diagnosisNotes: "Smoke diagnosis completed",
      estimatedCost: 40000,
      serviceFee: 15000,
      totalCost: 40000,
      approvedByCustomer: true,
    },
  });
  smoke.jobOrderId = jobOrder.id;

  await prisma.jobPhoto.createMany({
    data: [
      {
        jobOrderId: jobOrder.id,
        url: "https://placehold.co/400x300/png?text=Before",
        type: "BEFORE",
      },
      {
        jobOrderId: jobOrder.id,
        url: "https://placehold.co/400x300/png?text=After",
        type: "AFTER",
      },
    ],
  });

  await prisma.jobPart.create({
    data: {
      jobOrderId: jobOrder.id,
      partId: part.id,
      quantity: 1,
      unitPrice: 25000,
    },
  });

  const invoice = await prisma.invoice.create({
    data: {
      jobOrderId: jobOrder.id,
      partsTotal: 25000,
      serviceFee: 15000,
      totalAmount: 40000,
      isPaid: true,
      paymentMethod: "CASH",
      paidAt: new Date(),
    },
  });
  smoke.invoiceId = invoice.id;

  return {
    email: user.email,
    password,
    customer,
    master,
    part,
    car,
    jobOrder,
    invoice,
  };
}

async function cleanupSmokeData() {
  const auditEntityIds = [
    smoke.customerId,
    smoke.masterId,
    smoke.partId,
    smoke.carId,
    smoke.jobOrderId,
    smoke.invoiceId,
  ].filter((id) => typeof id === "string");

  if (auditEntityIds.length > 0) {
    await prisma.auditLog.deleteMany({
      where: {
        entityId: {
          in: auditEntityIds,
        },
      },
    });
  }

  if (smoke.invoiceId) {
    await prisma.invoice.deleteMany({ where: { id: smoke.invoiceId } });
  }
  if (smoke.jobOrderId) {
    await prisma.jobPhoto.deleteMany({ where: { jobOrderId: smoke.jobOrderId } });
    await prisma.jobPart.deleteMany({ where: { jobOrderId: smoke.jobOrderId } });
    await prisma.jobOrder.deleteMany({ where: { id: smoke.jobOrderId } });
  }
  if (smoke.carId) {
    await prisma.car.deleteMany({ where: { id: smoke.carId } });
  }
  if (smoke.customerId) {
    await prisma.customer.deleteMany({ where: { id: smoke.customerId } });
  }
  if (smoke.masterId) {
    await prisma.master.deleteMany({ where: { id: smoke.masterId } });
  }
  if (smoke.partId) {
    await prisma.part.deleteMany({ where: { id: smoke.partId } });
  }
  if (smoke.userId) {
    await prisma.user.deleteMany({ where: { id: smoke.userId } });
  }
}

try {
  const health = await fetch(`${baseUrl}/api/health`, { cache: "no-store" });
  const healthBody = await health.text();

  if (!health.ok || !healthBody.includes('"database":"ok"')) {
    throw new Error(`/api/health failed with ${health.status}`);
  }

  const unauthenticatedDashboard = await request("/dashboard");
  const unauthenticatedLocation = unauthenticatedDashboard.headers.get("location") ?? "";

  if (
    ![302, 303, 307, 308].includes(unauthenticatedDashboard.status) ||
    !unauthenticatedLocation.includes("/login")
  ) {
    throw new Error("Unauthenticated /dashboard did not redirect to login");
  }

  const data = await seedSmokeData();
  await signIn(data.email, data.password);

  await Promise.all([
    expectText("/dashboard", "Dashboard"),
    expectText("/dashboard/customers", data.customer.name),
    expectText(`/dashboard/customers/${data.customer.id}`, data.car.plateNumber),
    expectText("/dashboard/cars", data.car.plateNumber),
    expectText(`/dashboard/cars/${data.car.id}`, data.customer.name),
    expectText("/dashboard/jobs", data.car.plateNumber),
    expectText(`/dashboard/jobs/${data.jobOrder.id}`, data.jobOrder.problemDescription),
    expectText(`/dashboard/jobs/${data.jobOrder.id}/invoice`, "INVOICE"),
    expectText("/dashboard/masters", data.master.name),
    expectText(`/dashboard/masters/${data.master.id}`, data.master.name),
    expectText("/dashboard/parts", data.part.name),
    expectText("/dashboard/reports", "Reports"),
    expectText("/dashboard/settings/users", data.email),
  ]);

  const pdfResponse = await fetch(`${baseUrl}/api/invoices/${data.invoice.id}/pdf`, {
    cache: "no-store",
  });
  const pdfBytes = new Uint8Array(await pdfResponse.arrayBuffer());
  const pdfHeader = Buffer.from(pdfBytes.slice(0, 4)).toString("utf8");

  if (!pdfResponse.ok || pdfResponse.headers.get("content-type") !== "application/pdf") {
    throw new Error(`Invoice PDF failed with ${pdfResponse.status}`);
  }

  if (pdfHeader !== "%PDF") {
    throw new Error("Invoice PDF response did not contain a PDF document");
  }

  console.log(
    JSON.stringify(
      {
        status: "ok",
        baseUrl,
        checked: [
          "/api/health",
          "auth redirect",
          "credentials login",
          "/dashboard",
          "/dashboard/customers",
          "/dashboard/customers/[id]",
          "/dashboard/cars",
          "/dashboard/cars/[id]",
          "/dashboard/jobs",
          "/dashboard/jobs/[id]",
          "/dashboard/jobs/[id]/invoice",
          "/dashboard/masters",
          "/dashboard/masters/[id]",
          "/dashboard/parts",
          "/dashboard/reports",
          "/dashboard/settings/users",
          "/api/invoices/[id]/pdf",
        ],
      },
      null,
      2
    )
  );
} finally {
  await cleanupSmokeData();
  await prisma.$disconnect();
}
