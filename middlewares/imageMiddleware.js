const multer = require("multer");
const multerS3 = require("multer-s3");
const { s3 } = require("../config/s3");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config(); // dotenv 설정 불러오기

// 프로필 이미지 업로드
const uploadProfileImage = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    key: function (req, file, cb) {
      cb(null, `profile-images/${Date.now()}_${file.originalname}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("profileImage");

// S3에서 객체(파일) 삭제 함수
const deleteProfileImage = async (profileImageUrl) => {
  if (!profileImageUrl) return;

  // 기존 S3 URL에서 파일 경로 추출
  const fileName = decodeURIComponent(profileImageUrl.split("/").pop()); // 파일 이름만 추출
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `profile-images/${fileName}`, // 버킷 내 파일 경로
  };

  try {
    // AWS SDK v3 방식으로 파일 삭제
    const command = new DeleteObjectCommand(params);
    await s3.send(command);
    //console.log(`기존 프로필 이미지 삭제됨: ${profileImageUrl}`);
  } catch (err) {
    console.error(`이미지 삭제 중 에러 발생: ${err.message}`);
  }
};

const handleUploadProfileImage = (req, res, next) => {
  uploadProfileImage(req, res, (err) => {
    if (err) {
      // 파일 업로드 중 에러 발생
      return res.status(400).json({ message: "파일 업로드 실패" });
    }
    if (req.file) {
      req.profileImage = req.file.location;
    }
    next();
  });
};

module.exports = {
  handleUploadProfileImage,
  deleteProfileImage,
};
