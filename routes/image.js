const express = require("express");

const { verifyAccessToken } = require("../middlewares/authMiddleware");
const { handleUploadProfileImage } = require("../middlewares/imageMiddleware");
const { uploadProfile } = require("../controllers/userController");

const router = express.Router();

// 프로필 이미지 업로드
// POST /image/profile?userId={userId}
router.post(
  "/profile",
  verifyAccessToken,
  handleUploadProfileImage,
  uploadProfile
);

module.exports = router;
