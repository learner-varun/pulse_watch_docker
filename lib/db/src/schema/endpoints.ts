import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const endpointsTable = pgTable("endpoints", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  curlCommand: text("curl_command").notNull(),
  expectedStatusCode: integer("expected_status_code").notNull().default(200),
  expectedResponseTime: integer("expected_response_time").notNull().default(300),
  status: text("status").notNull().default("pending"),
  lastResponseTime: integer("last_response_time"),
  lastCheckedAt: timestamp("last_checked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertEndpointSchema = createInsertSchema(endpointsTable).omit({
  id: true,
  createdAt: true,
  lastCheckedAt: true,
  lastResponseTime: true,
  status: true,
});
export type InsertEndpoint = z.infer<typeof insertEndpointSchema>;
export type Endpoint = typeof endpointsTable.$inferSelect;
