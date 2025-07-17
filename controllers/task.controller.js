import { validationResult } from "express-validator";
import { Task } from "../models/task.model.js";
import mongoose from "mongoose";
import { getIo } from "../socket.js";
import { logAction } from "../utils/logActions.js";
import { findLeastLoadedUser } from "../utils/smartAssign.js";

export const createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, assignedTo, priority, status } = req.body;

    let assignedUser = assignedTo;
    let leastUser = null;

    // Smart assign if no user provided
    if (!assignedTo) {
      leastUser = await findLeastLoadedUser();
      if (leastUser) assignedUser = leastUser._id;
    }

    const task = new Task({
      title,
      description,
      assignedTo: assignedUser,
      priority,
      status,
    });

    const savedTask = await task.save();

    await logAction({
      action: "add",
      taskId: savedTask._id,
      performedBy: req.user._id,
      details: assignedTo
        ? `Created task "${savedTask.title}" in ${savedTask.status}`
        : `Created and auto-assigned "${savedTask.title}" to ${leastUser.username}`,
    });

    const io = getIo();
    io.emit("task_created", savedTask);

    res.status(201).json({
      message: "Task created successfully",
      savedTask,
    });
  } catch (error) {
    console.error("Error creating task:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find().populate("assignedTo", "username email");
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getSingleTask = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid task ID" });
  }

  try {
    const task = await Task.findById(id).populate(
      "assignedTo",
      "username email"
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.status(200).json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid Task ID" });
  }

  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // 🟡 Step 1: Conflict Detection BEFORE updating
    const clientTimestamp = req.body.lastModified;

    // Only check for conflicts if client provides a timestamp
    if (clientTimestamp && !isNaN(new Date(clientTimestamp).getTime())) {
      const serverTime = new Date(task.lastModified).getTime();
      const clientTime = new Date(clientTimestamp).getTime();
      const timeDifference = serverTime - clientTime;

      console.log("Time difference (ms):", timeDifference);

      // Compare with a small tolerance (500ms) to account for slight time differences
      if (timeDifference > 500) {
        console.log(
          "⚠️ CONFLICT DETECTED - timestamps differ by",
          timeDifference,
          "ms"
        );
        return res.status(409).json({
          message: "Conflict: Task has been modified by another user.",
          currentTask: task,
          yourAttempt: req.body,
        });
      }
    }

    // 🟢 Step 2: Update Fields
    const oldStatus = task.status;
    const { title, description, assignedTo, priority, status } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;

    // Smart assign if assignedTo is explicitly null
    if (assignedTo === null) {
      const leastUser = await findLeastLoadedUser();
      if (leastUser) {
        task.assignedTo = leastUser._id;
      } else {
        task.assignedTo = null;
      }
    } else if (assignedTo !== undefined) {
      task.assignedTo = assignedTo === "" ? null : assignedTo;
    }

    // Update lastModified timestamp explicitly
    task.lastModified = new Date();

    const updatedTask = await task.save();
    // Inside updateTask controller
    console.log("Client timestamp:", clientTimestamp);
    console.log("Server timestamp:", task.lastModified);
    console.log("Parsed client date:", new Date(clientTimestamp));
    console.log("Parsed server date:", new Date(task.lastModified));
    console.log(
      "Comparison result:",
      new Date(clientTimestamp) < new Date(task.lastModified)
    );

    // 📘 Log the action
    await logAction({
      action: oldStatus !== updatedTask.status ? "move" : "edit",
      taskId: updatedTask._id,
      performedBy: req.user._id,
      details:
        oldStatus !== updatedTask.status
          ? `Moved "${updatedTask.title}" from ${oldStatus} → ${updatedTask.status}`
          : `Edited task "${updatedTask.title}"`,
    });

    // 🔁 Notify via WebSocket
    const io = getIo();
    io.emit("task_updated", updatedTask);

    return res.status(200).json({
      message: "Task updated successfully",
      updatedTask,
    });
  } catch (error) {
    console.error("❌ Error updating task:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const task = await Task.findById(id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    await task.deleteOne();

    await logAction({
      action: "delete",
      taskId: task._id,
      performedBy: req.user._id,
      details: `Deleted task "${task.title}"`,
    });

    const io = getIo();
    io.emit("task_deleted", task._id);

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
