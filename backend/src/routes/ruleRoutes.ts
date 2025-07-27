import { Router } from "express";
import * as controller from "../controllers/ruleController";
const router = Router();
router.get("/rules", controller.listRules);
router.post("/rules", controller.addRule);
router.patch("/rules/:id/move", controller.moveRule);
router.patch("/rules/:id", controller.editRule);
router.delete("/rules/:id", controller.removeRule);
export default router;