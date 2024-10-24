const express = require("express");
const { getUserProfile } = require("../controllers/userController");
const { verifyAccessToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/profile/:id", verifyAccessToken, getUserProfile);

module.exports = router;
