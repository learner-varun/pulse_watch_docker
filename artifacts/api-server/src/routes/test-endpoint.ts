import { Router, type IRouter } from "express";
import { CreateEndpointBody } from "@workspace/api-zod";
import { checkEndpoint } from "../lib/checker";

const router: IRouter = Router();

router.post("/test-endpoint", async (req, res): Promise<void> => {
  const parsed = CreateEndpointBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const result = await checkEndpoint({
    id: -1,
    name: "test",
    curlCommand: parsed.data.curlCommand,
    expectedStatusCode: parsed.data.expectedStatusCode ?? 200,
    expectedResponseTime: parsed.data.expectedResponseTime ?? 300,
  });

  res.json(result);
});

export default router;
