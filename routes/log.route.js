import { Router } from "express";
import { authUser } from "../middleware/auth.middleware.js";
import { getLogs } from "../controllers/log.controller.js";

const router = Router();
router.get("/", authUser, getLogs);

export default router;
