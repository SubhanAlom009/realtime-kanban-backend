import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Welcome to the Kanban App Backend!");
});

// Import routes
import userRoutes from "./routes/user.route.js";
import taskRoutes from "./routes/task.route.js";
app.use("/api/auth", userRoutes);
app.use("/api", taskRoutes);

export default app;
