const express = require("express");
const {
  getUserProfile,
  getUserFeeds,
} = require("../controllers/userController");
const { verifyAccessToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/profile/:id", verifyAccessToken, getUserProfile);

router.get("/:userId/feeds", verifyAccessToken, getUserFeeds);

module.exports = router;
