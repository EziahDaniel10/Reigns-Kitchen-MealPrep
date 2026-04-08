import { Router, type IRouter } from "express";
import healthRouter from "./health";
import orderRouter from "./order";
import contactRouter from "./contact";
import couponRouter from "./coupon";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(orderRouter);
router.use(contactRouter);
router.use(couponRouter);
router.use('/admin', adminRouter);

export default router;
