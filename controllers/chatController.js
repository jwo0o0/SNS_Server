const Sequelize = require("sequelize");
const { Op } = Sequelize;
const ChatRooms = require("../models/chatrooms");
const Users = require("../models/users");
const { sequelize, Messages } = require("../models");
const { redisClient } = require("../config/redis");

exports.getChatRooms = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const chatRooms = await ChatRooms.findAll({
      where: sequelize.where(
        sequelize.fn(
          "JSON_CONTAINS",
          sequelize.col("participants"),
          JSON.stringify(userId)
        ),
        1
      ),
      include: [
        {
          model: Messages,
          attributes: ["content", "createdAt"],
          limit: 1,
          separate: true,
          order: [["createdAt", "DESC"]],
        },
      ],
    });

    const roomList = await Promise.all(
      chatRooms.map(async (room) => {
        // 상대방 ID 추출
        const participants = room.participants;
        const otherUserId = participants.find((id) => id !== userId);

        // 상대방 유저 정보 조회
        const otherUser = await Users.findOne({
          where: { id: otherUserId },
          attributes: ["id", "nickname", "profileImage"],
        });

        // Redis에서 임시 메시지 조회
        const tempMessages = await redisClient.lRange(
          `chatRoom:${room.id}`,
          0,
          -1
        );
        const parsedTempMessages = tempMessages.map((message) =>
          JSON.parse(message)
        );
        // DB와 Redis에서 최신 메시지 비교
        const dbLatestMessage = room.Messages[0];
        const redisLatestMessage =
          parsedTempMessages.length > 0
            ? parsedTempMessages[parsedTempMessages.length - 1]
            : null;

        let latestMessage = "대화가 없습니다.";
        let updatedAt = room.createdAt;
        if (
          redisLatestMessage &&
          (!dbLatestMessage ||
            new Date(redisLatestMessage.createdAt) >
              new Date(dbLatestMessage.createdAt))
        ) {
          latestMessage = redisLatestMessage.content;
          updatedAt = redisLatestMessage.createdAt;
        } else if (dbLatestMessage) {
          latestMessage = dbLatestMessage.content;
          updatedAt = dbLatestMessage.createdAt;
        }

        return {
          roomId: room.id,
          latestMessage,
          updatedAt,
          otherUser: otherUser
            ? {
                id: otherUser.id,
                nickname: otherUser.nickname,
                profileImage: otherUser.profileImage,
              }
            : null,
        };
      })
    );

    return res.status(200).json(roomList);
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.postChatRoom = async (req, res, next) => {
  let { partnerId } = req.params;
  partnerId = Number(partnerId);
  try {
    const userId = req.user.id;
    let chatRoom = await ChatRooms.findOne({
      where: {
        [Op.and]: [
          Sequelize.where(
            Sequelize.fn(
              "JSON_CONTAINS",
              Sequelize.col("participants"),
              JSON.stringify(userId)
            ),
            1
          ),
          Sequelize.where(
            Sequelize.fn(
              "JSON_CONTAINS",
              Sequelize.col("participants"),
              JSON.stringify(partnerId)
            ),
            1
          ),
        ],
      },
    });
    // 채팅방 없으면 생성
    if (!chatRoom) {
      chatRoom = await ChatRooms.create({
        participants: [userId, partnerId].sort(),
      });
    }
    res.json({ roomId: chatRoom.id });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.getMessages = async (req, res, next) => {
  const { roomId } = req.params;
  const currentUserId = req.user.id; // 현재 접속 중인 유저의 ID

  try {
    const chatRoom = await ChatRooms.findOne({ where: { id: roomId } });
    if (!chatRoom) {
      return res.status(404).json({ message: "CHAT_ROOM_NOT_FOUND" });
    }
    const participants = chatRoom.participants;
    const partnerId = participants.find((id) => id !== currentUserId);

    const partnerInfo = await Users.findOne({
      where: { id: partnerId },
      attributes: ["id", "nickname", "profileImage"],
    });
    if (!partnerInfo) {
      return res.status(404).json({ message: "PARTNER_NOT_FOUND" });
    }

    // Redis
    const tempMessages = await redisClient.lRange(`chatRoom:${roomId}`, 0, -1);
    const parsedTempMessages = tempMessages.map((message) =>
      JSON.parse(message)
    );
    const dbMessages = await Messages.findAll({
      where: { chatRoomId: roomId },
      include: [
        {
          model: Users,
          as: "Sender",
          attributes: ["id", "nickname", "profileImage"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    const allMessages = [
      ...parsedTempMessages,
      ...dbMessages.map((message) => ({
        id: message.id,
        chatRoomId: message.chatRoomId,
        content: message.content,
        createdAt: message.createdAt,
        userId: message.userId,
        read: message.read,
      })),
    ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    res.json({
      partner: {
        id: partnerInfo.id,
        nickname: partnerInfo.nickname,
        profileImage: partnerInfo.profileImage,
      },
      messages: allMessages,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};
