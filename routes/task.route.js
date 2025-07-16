import express, { Router } from "express";
import { authUser } from "../middleware/auth.middleware.js";
import {
  createTask,
  deleteTask,
  getSingleTask,
  getTasks,
  lockTask,
  unlockTask,
  updateTask,
} from "../controllers/task.controller.js";
import { body } from "express-validator";

const router = Router();

router.post(
  "/tasks",
  authUser,
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("priority")
      .optional()
      .isIn(["low", "medium", "high"])
      .withMessage("Priority must be Low, Medium, or High"),

    body("status")
      .optional()
      .isIn(["todo", "in-progress", "done"])
      .withMessage("Invalid status"),
  ],
  createTask
);
router.get("/tasks", authUser, getTasks);
router.get("/tasks/:id", authUser, getSingleTask);
router.put(
  "/tasks/:id",
  authUser,
  [
    body("title").optional().isString().withMessage("Title must be a string"),
    body("description").optional().isString(),
    body("priority")
      .optional()
      .isIn(["low", "medium", "high"])
      .withMessage("Invalid priority value"),
    body("status")
      .optional()
      .isIn(["todo", "in-progress", "done"])
      .withMessage("Invalid status value"),
    body("assignedTo")
      .optional({ nullable: true, checkFalsy: true })
      .isMongoId()
      .withMessage("Invalid user ID"),
  ],
  updateTask
);

router.delete("/tasks/:id", authUser, deleteTask);

router.put("/tasks/:id/lock", authUser, lockTask);
router.put("/tasks/:id/unlock", authUser, unlockTask);

export default router;
