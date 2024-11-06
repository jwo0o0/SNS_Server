const SocketIO = require("socket.io");
const { redisClient } = require("./redis");

module.exports = (server, app) => {
  const io = SocketIO(server, {
    path: "/socket.io",
    transports: ["websocket"],
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });
  app.set("io", io);
  const room = io.of("/room");

  room.on("connection", (socket) => {
    // 웹 소켓 연결 시
    const req = socket.request;
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    console.log("새로운 클라이언트 접속!", ip, socket.id);

    socket.on("joinRoom", ({ roomId }) => {
      socket.join(roomId);
    });
    socket.on("sendMessage", async ({ chatRoomId, userId, content }) => {
      const messageData = {
        chatRoomId,
        userId,
        content,
        createdAt: new Date(),
        read: false,
      };
      await redisClient.rPush(
        `chatRoom:${chatRoomId}`,
        JSON.stringify(messageData)
      );
      room.to(chatRoomId).emit("receiveMessage", messageData);
    });

    // 연결 종료 시
    socket.on("disconnect", () => {
      console.log("User disconnected", ip, socket.id);
    });
    // 에러 시
    socket.on("error", (error) => {
      console.error(error);
    });
  });
};
