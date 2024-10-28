const express = require("express");

const { verifyAccessToken } = require("../middlewares/authMiddleware");
const {
  handleUploadProfileImage,
  handleUploadFeedImages,
} = require("../middlewares/imageMiddleware");
const { uploadProfile } = require("../controllers/userController");
const { uploadFeedImages } = require("../controllers/feedController");

const router = express.Router();

// 프로필 이미지 업로드
// POST /image/profile?userId={userId}
router.post(
  "/profile",
  verifyAccessToken,
  handleUploadProfileImage,
  uploadProfile
);

// 피드 이미지 업로드
// POST /image/feeds?feedId={feedId}
router.post(
  "/feeds",
  verifyAccessToken,
  handleUploadFeedImages,
  uploadFeedImages
);
module.exports = router;
