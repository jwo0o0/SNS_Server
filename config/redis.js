require("dotenv").config(); // dotenv 설정 불러오기
const { createClient } = require("redis");

const redisClient = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

module.exports = { redisClient };
