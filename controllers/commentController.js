const Users = require("../models/users");
const Feeds = require("../models/feeds");
const Comments = require("../models/comments");

exports.postComment = async (req, res, next) => {
  try {
    const { feedId } = req.params;
    const userId = req.user.id;
    const { content } = req.body;

    const newComment = await Comments.create({
      feedId,
      userId,
      content,
    });
    await Feeds.increment("commentCount", { where: { id: feedId } });

    return res.status(201).json({
      message: "COMMENT_POST_SUCCESS",
      commentId: newComment.id,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;

    const comment = await Comments.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ message: "COMMENT_NOT_FOUND" });
    }
    if (comment.userId !== userId) {
      return res.status(403).json({ message: "NO_PERMISSION" });
    }
    await Feeds.decrement("commentCount", { where: { id: comment.feedId } });
    await comment.destroy();
    return res.status(200).json({ message: "COMMENT_DELETE_SUCCESS" });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.getFeedComments = async (req, res, next) => {
  const { feedId } = req.params;
  const page = parseInt(req.query.page) || 1; // 기본값 1
  const limit = parseInt(req.query.limit) || 10; // 기본값 10
  const offset = (page - 1) * limit;

  try {
    const { count, rows: comments } = await Comments.findAndCountAll({
      where: { feedId },
      attributes: ["id", "content", "createdAt"],
      include: [
        {
          model: Users,
          as: "user",
          attributes: ["id", "nickname", "profileImage"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;

    return res.status(200).json({
      comments,
      page,
      totalPages,
      hasNextPage,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};
