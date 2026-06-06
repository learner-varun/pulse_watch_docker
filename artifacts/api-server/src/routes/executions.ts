import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, executionsTable, executionResultsTable } from "@workspace/db";
import {
  GetExecutionParams,
  ListExecutionsResponse,
  GetExecutionResponse,
  TriggerCheckResponse,
} from "@workspace/api-zod";
import { runHealthCheck } from "../lib/checker";

const router: IRouter = Router();

router.get("/executions", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(executionsTable)
    .orderBy(desc(executionsTable.startedAt))
    .limit(200);

  const mapped = rows.map((r) => ({
    ...r,
    startedAt: r.startedAt.toISOString(),
  }));

  res.json(ListExecutionsResponse.parse(mapped));
});

router.get("/executions/:id", async (req, res): Promise<void> => {
  const params = GetExecutionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [execution] = await db
    .select()
    .from(executionsTable)
    .where(eq(executionsTable.id, params.data.id));

  if (!execution) {
    res.status(404).json({ error: "Execution not found" });
    return;
  }

  const results = await db
    .select()
    .from(executionResultsTable)
    .where(eq(executionResultsTable.executionId, execution.id));

  res.json(
    GetExecutionResponse.parse({
      ...execution,
      startedAt: execution.startedAt.toISOString(),
      results,
    })
  );
});

router.post("/check", async (_req, res): Promise<void> => {
  const executionId = await runHealthCheck();

  if (executionId === 0) {
    // No endpoints, return empty execution
    const empty = {
      id: 0,
      startedAt: new Date().toISOString(),
      totalApis: 0,
      passed: 0,
      failed: 0,
      avgResponseTime: 0,
      results: [],
    };
    res.json(TriggerCheckResponse.parse(empty));
    return;
  }

  const [execution] = await db
    .select()
    .from(executionsTable)
    .where(eq(executionsTable.id, executionId));

  const results = await db
    .select()
    .from(executionResultsTable)
    .where(eq(executionResultsTable.executionId, executionId));

  res.json(
    TriggerCheckResponse.parse({
      ...execution,
      startedAt: execution.startedAt.toISOString(),
      results,
    })
  );
});

export default router;
