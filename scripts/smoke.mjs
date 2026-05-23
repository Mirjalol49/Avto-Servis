import { spawn } from "node:child_process";

const port = Number(process.env.SMOKE_PORT ?? 3020);
const baseUrl = `http://127.0.0.1:${port}`;
const nextBin = "node_modules/.bin/next";

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function waitForServer() {
  const startedAt = Date.now();

  while (Date.now() - startedAt < 30_000) {
    try {
      const response = await fetch(`${baseUrl}/api/health`, {
        cache: "no-store",
      });

      if (response.ok) {
        return;
      }
    } catch {
      // The server is still starting.
    }

    await wait(500);
  }

  throw new Error("Timed out waiting for the production server");
}

async function expectOk(path, expectedText) {
  const response = await fetch(`${baseUrl}${path}`, {
    cache: "no-store",
  });
  const body = await response.text();

  if (!response.ok || !body.includes(expectedText)) {
    throw new Error(`${path} smoke check failed with status ${response.status}`);
  }
}

async function expectRedirectToLogin(path) {
  const response = await fetch(`${baseUrl}${path}`, {
    cache: "no-store",
    redirect: "manual",
  });
  const location = response.headers.get("location") ?? "";

  if (![302, 303, 307, 308].includes(response.status) || !location.includes("/login")) {
    throw new Error(`${path} did not redirect unauthenticated users to login`);
  }
}

const server = spawn(nextBin, ["start", "-p", String(port)], {
  stdio: ["ignore", "pipe", "pipe"],
  env: {
    ...process.env,
    PORT: String(port),
  },
});

let serverOutput = "";

server.stdout.on("data", (chunk) => {
  serverOutput += chunk.toString();
});

server.stderr.on("data", (chunk) => {
  serverOutput += chunk.toString();
});

try {
await waitForServer();
await expectOk("/api/health", "database");
await expectOk("/login", "Email");
await expectRedirectToLogin("/");
await expectRedirectToLogin("/dashboard");

console.log(
  JSON.stringify(
    {
      status: "ok",
      checked: ["/api/health", "/login", "/", "/dashboard"],
    },
      null,
      2
    )
  );
} catch (error) {
  console.error(serverOutput);
  throw error;
} finally {
  server.kill("SIGTERM");
}
