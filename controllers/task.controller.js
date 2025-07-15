import { validationResult } from "express-validator";
import { Task } from "../models/task.model.js";
import mongoose from "mongoose";
import { getIo } from "../socket.js";
import { logAction } from "../utils/logActions.js";

export const createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, assignedTo, priority, status } = req.body;

    const task = new Task({ title, description, assignedTo, priority, status });
    const savedTask = await task.save();

    await logAction({
      action: "add",
      taskId: savedTask._id,
      performedBy: req.user._id,
      details: `Created task "${savedTask.title}" in ${savedTask.status}`,
    });

    const io = getIo();
    io.emit("task_created", savedTask);

    res.status(201).json({ message: "Task created successfully", savedTask });
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

    const oldStatus = task.status;
    const { title, description, assignedTo, priority, status } = req.body;

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (status !== undefined) task.status = status;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;

    const updatedTask = await task.save();

    await logAction({
      action: oldStatus !== updatedTask.status ? "move" : "edit",
      taskId: updatedTask._id,
      performedBy: req.user._id,
      details:
        oldStatus !== updatedTask.status
          ? `Moved "${updatedTask.title}" from ${oldStatus} → ${updatedTask.status}`
          : `Edited task "${updatedTask.title}"`,
    });

    const io = getIo();
    io.emit("task_updated", updatedTask);

    res.status(200).json({
      message: "Task updated successfully",
      updatedTask,
    });
  } catch (error) {
    console.error("Error updating task:", error);
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
