// controllers/log.controller.js
import { ActionLog } from "../models/actionlog.model.js";

export const getLogs = async (req, res) => {
  try {
    const logs = await ActionLog.find()
      .sort({ createdAt: -1 })
      .populate("performedBy", "username email");

    res.status(200).json(logs);
  } catch (error) {
    console.error("Error fetching logs:", error.message);
    res.status(500).json({ message: "Failed to fetch logs" });
  }
};
