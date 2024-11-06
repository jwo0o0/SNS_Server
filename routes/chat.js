const express = require("express");
const { verifyAccessToken } = require("../middlewares/authMiddleware");
const {
  getChatRooms,
  postChatRoom,
  getMessages,
} = require("../controllers/chatController");

const router = express.Router();

// 유저의 채팅 목록 조회 GET /chat/rooms
router.get("/rooms", verifyAccessToken, getChatRooms);

// 채팅방 생성 또는 기존 채팅방 조회 POST /chat/room/:partnerId
router.post("/room/:partnerId", verifyAccessToken, postChatRoom);

// 메시지 가져오기 /chat/messages/:roomId
router.get("/messages/:roomId", verifyAccessToken, getMessages);

module.exports = router;
