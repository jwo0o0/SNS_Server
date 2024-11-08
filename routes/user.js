const express = require("express");
const {
  getUserProfile,
  getUserFeeds,
} = require("../controllers/userController");

const router = express.Router();

router.get("/profile/:id", getUserProfile);

router.get("/:userId/feeds", getUserFeeds);

module.exports = router;
