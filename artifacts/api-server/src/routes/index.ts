import { Router, type IRouter } from "express";
import healthRouter from "./health";
import endpointsRouter from "./endpoints";
import executionsRouter from "./executions";
import settingsRouter from "./settings";
import testEndpointRouter from "./test-endpoint";

const router: IRouter = Router();

router.use(healthRouter);
router.use(endpointsRouter);
router.use(executionsRouter);
router.use(settingsRouter);
router.use(testEndpointRouter);

export default router;
