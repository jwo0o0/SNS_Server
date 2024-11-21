const multer = require("multer");
const multerS3 = require("multer-s3");
const { s3 } = require("../config/s3");
const { DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config(); // dotenv 설정 불러오기

// 프로필 이미지 업로드
const uploadProfileImage = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    key: function (req, file, cb) {
      const uniqueFileName = `${Date.now()}_${uuidv4()}.${
        file.mimetype.split("/")[1]
      }`;
      cb(null, `profile-images/${uniqueFileName}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
}).single("profileImage");

// S3에서 객체(파일) 삭제 함수
const deleteProfileImage = async (profileImageUrl) => {
  if (!profileImageUrl) return;

  // 기존 S3 URL에서 파일 경로 추출
  const fileName = profileImageUrl.split("/").slice(-2).join("/"); // `profile-images/파일명` 경로 추출
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName, // 버킷 내 파일 경로
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
      return res.status(400).json({ message: "FILE_UPLOAD_FAIL" });
    }
    if (req.file) {
      req.profileImage = req.file.location;
    }
    next();
  });
};

// feed 이미지 업로드
const uploadFeedImages = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET_NAME,
    key: function (req, file, cb) {
      const uniqueFileName = `${Date.now()}_${uuidv4()}.${
        file.mimetype.split("/")[1]
      }`;
      cb(null, `feed-images/${uniqueFileName}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
}).array("images");

const handleUploadFeedImages = (req, res, next) => {
  uploadFeedImages(req, res, (err) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ message: "FILE_UPLOAD_FAIL" });
    }
    req.uploadedImages = req.files.map((file) => file.location);
    next();
  });
};

const deleteFeedImages = async (imageUrls) => {
  if (!Array.isArray(imageUrls) || imageUrls.length === 0) return;
  try {
    for (const imageUrl of imageUrls) {
      const fileName = imageUrl.split("/").slice(-2).join("/");
      const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileName,
      };
      const command = new DeleteObjectCommand(params);
      await s3.send(command);
    }
  } catch (error) {
    error.message = "이미지 삭제 중 에러 발생";
    throw error;
  }
};

module.exports = {
  handleUploadProfileImage,
  deleteProfileImage,
  handleUploadFeedImages,
  deleteFeedImages,
};
