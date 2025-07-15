import { ActionLog } from "../models/actionlog.model.js";
import { getIo } from "../socket.js";

export const logAction = async ({ action, taskId, performedBy, details }) => {
  try {
    const log = new ActionLog({ action, taskId, performedBy, details });
    const savedLog = await log.save();

    const io = getIo();
    io.emit(
      "log_created",
      await savedLog.populate("performedBy", "username email")
    );
  } catch (err) {
    console.error("❌ Failed to log action:", err.message);
  }
};
