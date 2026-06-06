import { pgTable, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const executionsTable = pgTable("executions", {
  id: serial("id").primaryKey(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
  totalApis: integer("total_apis").notNull().default(0),
  passed: integer("passed").notNull().default(0),
  failed: integer("failed").notNull().default(0),
  avgResponseTime: integer("avg_response_time").notNull().default(0),
});

export const insertExecutionSchema = createInsertSchema(executionsTable).omit({ id: true });
export type InsertExecution = z.infer<typeof insertExecutionSchema>;
export type Execution = typeof executionsTable.$inferSelect;
