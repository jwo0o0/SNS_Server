require("dotenv").config(); // dotenv 설정 불러오기
const { S3Client } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
  region: "ap-northeast-2",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

module.exports = { s3 };
