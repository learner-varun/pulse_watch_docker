import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { executionsTable } from "./executions";
import { endpointsTable } from "./endpoints";
import { relations } from "drizzle-orm";

export const executionResultsTable = pgTable("execution_results", {
  id: serial("id").primaryKey(),
  executionId: integer("execution_id").notNull().references(() => executionsTable.id, { onDelete: "cascade" }),
  endpointId: integer("endpoint_id").notNull().references(() => endpointsTable.id, { onDelete: "cascade" }),
  endpointName: text("endpoint_name").notNull(),
  endpointUrl: text("endpoint_url").notNull(),
  status: text("status").notNull(),
  responseTime: integer("response_time").notNull().default(0),
  errorMessage: text("error_message"),
  checkedAt: timestamp("checked_at", { withTimezone: true }).notNull().defaultNow(),
});

export const executionResultsRelations = relations(executionResultsTable, ({ one }) => ({
  execution: one(executionsTable, {
    fields: [executionResultsTable.executionId],
    references: [executionsTable.id],
  }),
  endpoint: one(endpointsTable, {
    fields: [executionResultsTable.endpointId],
    references: [endpointsTable.id],
  }),
}));

export const insertExecutionResultSchema = createInsertSchema(executionResultsTable).omit({ id: true });
export type InsertExecutionResult = z.infer<typeof insertExecutionResultSchema>;
export type ExecutionResult = typeof executionResultsTable.$inferSelect;
