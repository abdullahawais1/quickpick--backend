// socket.ts
import { Server } from "socket.io";

let io: Server;

export const initializeSocketIO = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: "*", // ⚠️ Change this in production to your frontend URL
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("A new client connected:", socket.id);

    socket.on("joinQueue", (queueData) => {
      console.log("Parent joined the queue:", queueData);
      io.emit("queueUpdated", queueData);
    });

    socket.on("pickupComplete", (queueData) => {
      console.log("Parent picked up the child:", queueData);
      io.emit("queueUpdated", queueData);
    });

    socket.on("disconnect", () => {
      console.log("A client disconnected:", socket.id);
    });
  });
};

// Use this to emit from any controller
export const emitQueueUpdate = (data?: any) => {
  if (io) {
    io.emit("queueUpdated", data || {});
  }
};

export { io };
