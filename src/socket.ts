// socket.ts
import { Server } from "socket.io";

let io: Server;

export const initializeSocketIO = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: "*", // Adjust in production
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A new client connected");

    socket.on("joinQueue", (queueData) => {
      console.log("Parent joined the queue:", queueData);
      io.emit("queueUpdated", queueData);
    });

    socket.on("pickupComplete", (queueData) => {
      console.log("Parent picked up the child:", queueData);
      io.emit("queueUpdated", queueData);
    });

    socket.on("disconnect", () => {
      console.log("A client disconnected");
    });
  });

  return io;
};

export { io };
