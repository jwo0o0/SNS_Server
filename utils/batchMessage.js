const { redisClient } = require("../config/redis");
const Messages = require("../models/messages");

const batchMessage = async () => {
  const roomKeys = await redisClient.keys("chatRoom:*");

  for (const roomKey of roomKeys) {
    const messages = await redisClient.lRange(roomKey, 0, -1);
    if (messages.length > 0) {
      try {
        await Messages.bulkCreate(
          messages.map((message) => JSON.parse(message))
        );
      } catch (error) {
        console.error(`Failed to bulk create messages for ${roomKey}:`, error);
      } finally {
        await redisClient.del(roomKey);
      }
    }
  }
};

module.exports = batchMessage;
