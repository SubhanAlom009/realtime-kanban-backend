import { Server } from "socket.io";

let io;
export const setupSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

export const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized. Call setupSocket first.");
  }
  return io;
};
