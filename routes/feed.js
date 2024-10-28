const express = require("express");
const { verifyAccessToken } = require("../middlewares/authMiddleware");
const { postFeed } = require("../controllers/feedController");

const router = express.Router();

// 피드 작성 POST /feeds
router.post("/", verifyAccessToken, postFeed);

module.exports = router;
