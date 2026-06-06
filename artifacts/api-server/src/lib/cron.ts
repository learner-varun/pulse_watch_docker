import cron, { type ScheduledTask } from "node-cron";
import { db, settingsTable } from "@workspace/db";
import { runHealthCheck } from "./checker";
import { logger } from "./logger";

let currentTask: ScheduledTask | null = null;
let currentIntervalMinutes = 5;

function minutesToCronExpr(minutes: number): string {
  if (minutes === 1) return "* * * * *";
  return `*/${minutes} * * * *`;
}

export async function startCron(): Promise<void> {
  // Load interval from DB
  const rows = await db.select().from(settingsTable).limit(1);
  if (rows.length === 0) {
    await db.insert(settingsTable).values({ checkIntervalMinutes: 5 });
    currentIntervalMinutes = 5;
  } else {
    currentIntervalMinutes = rows[0].checkIntervalMinutes;
  }

  scheduleCron(currentIntervalMinutes);
  logger.info({ intervalMinutes: currentIntervalMinutes }, "Cron job started");
}

function scheduleCron(minutes: number): void {
  if (currentTask) {
    currentTask.stop();
    currentTask = null;
  }

  const expr = minutesToCronExpr(minutes);
  logger.info({ cronExpr: expr, minutes }, "Scheduling cron job");

  currentTask = cron.schedule(expr, async () => {
    logger.info("Running scheduled health check");
    try {
      await runHealthCheck();
    } catch (err) {
      logger.error({ err }, "Scheduled health check failed");
    }
  });
}

export function updateCronInterval(minutes: number): void {
  currentIntervalMinutes = minutes;
  scheduleCron(minutes);
  logger.info({ minutes }, "Cron interval updated");
}

export function getCurrentInterval(): number {
  return currentIntervalMinutes;
}
