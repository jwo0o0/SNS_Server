const express = require("express");
const { verifyAccessToken } = require("../middlewares/authMiddleware");
const {
  postFeed,
  getFeed,
  voteFeed,
  likeFeed,
  deleteFeed,
  patchFeed,
  getAllFeed,
  getLikedFeeds,
  getVotedFeeds,
} = require("../controllers/feedController");

const router = express.Router();

// 피드 전체 조회 GET /feeds?page=1&limit=10
router.get("/", getAllFeed);

// 유저가 좋아요한 피드 조회 GET /feeds/likes?page=1&limit=10
router.get("/likes", getLikedFeeds);

// 유저가 투표한 피드 조회 GET /feeds/polls?page=1&limit=10
router.get("/polls", getVotedFeeds);

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

// 피드 수정 PATCH /feeds/:feedId
router.patch("/:feedId", verifyAccessToken, patchFeed);

module.exports = router;
