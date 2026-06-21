import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, endpointsTable, executionResultsTable } from "@workspace/db";
import {
  CreateEndpointBody,
  DeleteEndpointParams,
  GetEndpointHistoryParams,
  ListEndpointsResponse,
  GetEndpointHistoryResponse,
  GetOverviewResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/endpoints", async (req, res): Promise<void> => {
  const rows = await db.select().from(endpointsTable).orderBy(endpointsTable.createdAt);
  const serialized = rows.map((r) => ({
    ...r,
    lastCheckedAt: r.lastCheckedAt ? r.lastCheckedAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
  }));
  res.json(ListEndpointsResponse.parse(serialized));
});

router.post("/endpoints", async (req, res): Promise<void> => {
  const parsed = CreateEndpointBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db
    .insert(endpointsTable)
    .values({
      name: parsed.data.name,
      curlCommand: parsed.data.curlCommand,
      expectedStatusCode: parsed.data.expectedStatusCode ?? 200,
      expectedResponseTime: parsed.data.expectedResponseTime ?? 300,
      status: "pending",
    })
    .returning();

  res.status(201).json(row);
});

router.delete("/endpoints/:id", async (req, res): Promise<void> => {
  const params = DeleteEndpointParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(endpointsTable)
    .where(eq(endpointsTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Endpoint not found" });
    return;
  }

  res.sendStatus(204);
});

router.put("/endpoints/:id", async (req, res): Promise<void> => {
  const params = DeleteEndpointParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = CreateEndpointBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [updated] = await db
    .update(endpointsTable)
    .set({
      name: parsed.data.name,
      curlCommand: parsed.data.curlCommand,
      expectedStatusCode: parsed.data.expectedStatusCode ?? 200,
      expectedResponseTime: parsed.data.expectedResponseTime ?? 300,
      status: "pending",
    })
    .where(eq(endpointsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Endpoint not found" });
    return;
  }

  res.json({
    ...updated,
    lastCheckedAt: updated.lastCheckedAt ? updated.lastCheckedAt.toISOString() : null,
    createdAt: updated.createdAt.toISOString(),
  });
});

router.get("/endpoints/:id/history", async (req, res): Promise<void> => {
  const params = GetEndpointHistoryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [endpoint] = await db
    .select()
    .from(endpointsTable)
    .where(eq(endpointsTable.id, params.data.id));

  if (!endpoint) {
    res.status(404).json({ error: "Endpoint not found" });
    return;
  }

  const results = await db
    .select()
    .from(executionResultsTable)
    .where(eq(executionResultsTable.endpointId, params.data.id))
    .orderBy(desc(executionResultsTable.checkedAt))
    .limit(100);

  const history = results.reverse().map((r) => ({
    timestamp: r.checkedAt.toISOString(),
    responseTime: r.responseTime,
    status: r.status === "passed" ? ("success" as const) : ("error" as const),
  }));

  res.json(GetEndpointHistoryResponse.parse(history));
});

router.get("/overview", async (_req, res): Promise<void> => {
  const endpoints = await db.select().from(endpointsTable);
  const totalApis = endpoints.length;
  const healthyApis = endpoints.filter((e) => e.status === "healthy").length;
  const failedApis = endpoints.filter((e) => e.status === "failed").length;
  const warningApis = endpoints.filter((e) => e.status === "warning").length;

  const withTimes = endpoints.filter((e) => e.lastResponseTime !== null);
  const avgResponseTime =
    withTimes.length > 0
      ? Math.round(withTimes.reduce((sum, e) => sum + (e.lastResponseTime ?? 0), 0) / withTimes.length)
      : 0;

  res.json(
    GetOverviewResponse.parse({ totalApis, healthyApis, failedApis, warningApis, avgResponseTime })
  );
});

export default router;
