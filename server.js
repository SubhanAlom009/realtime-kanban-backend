import app from "./app.js";
import http from "http";
import { connectDB } from "./db/connectDB.js";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

connectDB().then(() => {
  try {
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
    process.exit(1); // Exit the process with failure
  }
});
