import { db, endpointsTable, executionsTable, executionResultsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

function parseCurlUrl(curlCommand: string): string {
  const trimmed = curlCommand.trim();
  // If it looks like a plain URL, use it directly
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  // Parse curl command: extract the URL (first non-flag argument)
  const parts = trimmed.split(/\s+/);
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part.startsWith("-")) {
      // Strip quotes
      const url = part.replace(/^['"]|['"]$/g, "");
      if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
      }
    }
    // Skip flags that take a value (e.g. -X GET, -H "header", -d "data")
    if (
      part === "-X" ||
      part === "-H" ||
      part === "-d" ||
      part === "--data" ||
      part === "--header" ||
      part === "--request" ||
      part === "-u" ||
      part === "--user" ||
      part === "-o" ||
      part === "--output" ||
      part === "--max-time" ||
      part === "-m" ||
      part === "--connect-timeout"
    ) {
      i++; // skip the next part (flag value)
    }
  }
  // Fallback: try to find any http URL in the string
  const match = trimmed.match(/https?:\/\/[^\s'"]+/);
  if (match) return match[0];
  return trimmed; // last resort
}

function parseCurlMethod(curlCommand: string): string {
  const trimmed = curlCommand.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return "GET";
  }
  const methodMatch = trimmed.match(/-X\s+([A-Z]+)/) || trimmed.match(/--request\s+([A-Z]+)/);
  return methodMatch ? methodMatch[1] : "GET";
}

function parseCurlHeaders(curlCommand: string): Record<string, string> {
  const headers: Record<string, string> = {};
  const headerMatches = curlCommand.matchAll(/-H\s+["']([^"']+)["']/g);
  for (const match of headerMatches) {
    const parts = match[1].split(": ");
    if (parts.length >= 2) {
      headers[parts[0]] = parts.slice(1).join(": ");
    }
  }
  return headers;
}

export async function checkEndpoint(endpoint: {
  id: number;
  name: string;
  curlCommand: string;
  expectedStatusCode: number;
  expectedResponseTime: number;
}): Promise<{
  status: "passed" | "failed";
  responseTime: number;
  statusCode: number | null;
  errorMessage: string | null;
}> {
  const url = parseCurlUrl(endpoint.curlCommand);
  const method = parseCurlMethod(endpoint.curlCommand);
  const headers = parseCurlHeaders(endpoint.curlCommand);

  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(url, {
      method,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const responseTime = Date.now() - start;
    const passed =
      response.status === endpoint.expectedStatusCode &&
      responseTime <= endpoint.expectedResponseTime * 2; // 2x tolerance

    return {
      status: passed ? "passed" : "failed",
      responseTime,
      statusCode: response.status,
      errorMessage: passed
        ? null
        : `Status ${response.status} (expected ${endpoint.expectedStatusCode}), ${responseTime}ms (expected ≤${endpoint.expectedResponseTime}ms)`,
    };
  } catch (err: unknown) {
    const responseTime = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    return {
      status: "failed",
      responseTime,
      statusCode: null,
      errorMessage: message.includes("abort") ? "Request timed out (10s)" : message,
    };
  }
}

export async function runHealthCheck(): Promise<number> {
  const endpoints = await db.select().from(endpointsTable);

  if (endpoints.length === 0) {
    logger.info("No endpoints to check");
    return 0;
  }

  logger.info({ count: endpoints.length }, "Starting health check run");

  const results = await Promise.all(
    endpoints.map(async (endpoint) => {
      const result = await checkEndpoint(endpoint);
      return { endpoint, result };
    })
  );

  const passed = results.filter((r) => r.result.status === "passed").length;
  const failed = results.filter((r) => r.result.status === "failed").length;
  const totalResponseTime = results.reduce((sum, r) => sum + r.result.responseTime, 0);
  const avgResponseTime = Math.round(totalResponseTime / results.length);

  const [execution] = await db
    .insert(executionsTable)
    .values({
      totalApis: endpoints.length,
      passed,
      failed,
      avgResponseTime,
    })
    .returning();

  await Promise.all(
    results.map(async ({ endpoint, result }) => {
      const endpointStatus =
        result.status === "passed"
          ? "healthy"
          : result.responseTime > endpoint.expectedResponseTime
          ? "warning"
          : "failed";

      await db
        .update(endpointsTable)
        .set({
          status: endpointStatus,
          lastResponseTime: result.responseTime,
          lastCheckedAt: new Date(),
        })
        .where(eq(endpointsTable.id, endpoint.id));

      await db.insert(executionResultsTable).values({
        executionId: execution.id,
        endpointId: endpoint.id,
        endpointName: endpoint.name,
        endpointUrl: parseCurlUrl(endpoint.curlCommand),
        status: result.status,
        responseTime: result.responseTime,
        errorMessage: result.errorMessage,
      });
    })
  );

  logger.info({ executionId: execution.id, passed, failed }, "Health check run complete");
  return execution.id;
}
