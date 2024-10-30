const express = require("express");
const { verifyAccessToken } = require("../middlewares/authMiddleware");
const {
  postFeed,
  getFeed,
  voteFeed,
  likeFeed,
  deleteFeed,
} = require("../controllers/feedController");

const router = express.Router();

// 피드 작성 POST /feeds
router.post("/", verifyAccessToken, postFeed);

// 특정 피드 조회 GET /feeds/:feedId
router.get("/:feedId", getFeed);

// 피드에 투표 POST /feeds/:feedId/vote
router.post("/:feedId/vote", verifyAccessToken, voteFeed);

// 피드에 좋아요 POST /feeds/:feedId/like
router.post("/:feedId/like", verifyAccessToken, likeFeed);

// 피드 삭제 DELETE /feeds/:feedId
router.delete("/:feedId", verifyAccessToken, deleteFeed);

module.exports = router;
