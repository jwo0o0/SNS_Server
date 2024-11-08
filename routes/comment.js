const express = require("express");
const { verifyAccessToken } = require("../middlewares/authMiddleware");
const {
  postComment,
  deleteComment,
  getFeedComments,
} = require("../controllers/commentController");

const router = express.Router();

// 댓글 작성 POST /comments/:feedId
router.post("/:feedId", verifyAccessToken, postComment);

// 댓글 삭제 DELETE /comments/:commentId
router.delete("/:commentId", verifyAccessToken, deleteComment);

// 댓글 전체 조회 GET /comments/:feedId?page=1&limit=10
router.get("/:feedId", getFeedComments);

module.exports = router;
