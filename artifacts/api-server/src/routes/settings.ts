import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, settingsTable } from "@workspace/db";
import { UpdateSettingsBody, GetSettingsResponse, UpdateSettingsResponse } from "@workspace/api-zod";
import { updateCronInterval } from "../lib/cron";

const router: IRouter = Router();

router.get("/settings", async (_req, res): Promise<void> => {
  const rows = await db.select().from(settingsTable).limit(1);

  if (rows.length === 0) {
    const [created] = await db
      .insert(settingsTable)
      .values({ checkIntervalMinutes: 5 })
      .returning();
    res.json(GetSettingsResponse.parse(created));
    return;
  }

  res.json(GetSettingsResponse.parse(rows[0]));
});

router.put("/settings", async (req, res): Promise<void> => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const rows = await db.select().from(settingsTable).limit(1);

  let updated;
  if (rows.length === 0) {
    const [row] = await db
      .insert(settingsTable)
      .values({ checkIntervalMinutes: parsed.data.checkIntervalMinutes })
      .returning();
    updated = row;
  } else {
    const [row] = await db
      .update(settingsTable)
      .set({ checkIntervalMinutes: parsed.data.checkIntervalMinutes })
      .where(eq(settingsTable.id, rows[0].id))
      .returning();
    updated = row;
  }

  updateCronInterval(updated.checkIntervalMinutes);

  res.json(UpdateSettingsResponse.parse(updated));
});

export default router;
