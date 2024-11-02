const express = require("express");
const { verifyAccessToken } = require("../middlewares/authMiddleware");
const {
  follow,
  unfollow,
  getFollowing,
  getFollowers,
} = require("../controllers/followController");

const router = express.Router();

// 팔로우 POST /follows/:userId
router.post("/:userId", verifyAccessToken, follow);

// 언팔로우 DELETE /follows/:userId
router.delete("/:userId", verifyAccessToken, unfollow);

// 팔로잉 목록 GET /follows/:userId/following
router.get("/:userId/following", getFollowing);

// 팔로우 목록 GET /follows/:userId/followers
router.get("/:userId/followers", getFollowers);

module.exports = router;
