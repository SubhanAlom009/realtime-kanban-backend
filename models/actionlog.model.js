import mongoose from "mongoose";

const actionlogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["add", "delete", "edit", "move", "assign"],
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    details: {
      type: String,
      required: false, // Optional field for additional details
    },
  },
  { Timestamps: true }
);

export const ActionLog = mongoose.model("ActionLog", actionlogSchema);
