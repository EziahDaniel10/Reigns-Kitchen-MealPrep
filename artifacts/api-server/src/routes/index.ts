import { Router, type IRouter } from "express";
import healthRouter from "./health";
import orderRouter from "./order";

const router: IRouter = Router();

router.use(healthRouter);
router.use(orderRouter);

export default router;
