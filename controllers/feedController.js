const Sequelize = require("sequelize");
const Users = require("../models/users");
const Feeds = require("../models/feeds");
const Polls = require("../models/polls");
const Comments = require("../models/comments");
const Likes = require("../models/likes");
const jwt = require("jsonwebtoken");

exports.postFeed = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { content, pollContent, polls } = req.body;

    const newFeed = await Feeds.create({
      userId,
      content,
      pollContent,
      polls,
      pollCount: polls.length,
    });

    return res.status(201).json({
      message: "FEED_POST_SUCCESS",
      feedId: newFeed.id,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.uploadFeedImages = async (req, res, next) => {
  try {
    const { feedId } = req.query;
    const feed = await Feeds.findByPk(feedId);
    feed.images = req.uploadedImages;
    await feed.save();
    return res.status(200).json({ message: "FEED_IMAGE_UPLOAD_SUCCESS" });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.getFeed = async (req, res, next) => {
  const { feedId } = req.params;
  const accessToken = req.cookies?.accessToken;
  const decodedToken = accessToken ? jwt.decode(accessToken) : null;
  const userId = decodedToken ? decodedToken.id : null;
  try {
    const feed = await Feeds.findOne({
      where: { id: feedId },
      attributes: [
        "userId",
        "content",
        "pollContent",
        "commentCount",
        "likeCount",
        "polls",
        "images",
        "pollCount",
        "updatedAt",
      ],
      include: [
        {
          model: Users,
          as: "User",
          attributes: ["nickname", "profileImage"],
        },
        {
          model: Polls,
          as: "Polls",
          attributes: ["item", "feedId"],
        },
        {
          model: Comments,
          as: "Comments",
          attributes: ["id"],
        },
        {
          model: Users,
          as: "LikedByUsers",
          attributes: ["id"],
          through: {
            attributes: [],
          },
        },
      ],
    });
    if (!feed) {
      return res.status(404).json({ message: "FEED_NOT_FOUND" });
    }
    // 투표 항목과 각 항목에 대한 투표 수 계산
    const pollOptions = feed.polls;
    const pollResults = await Polls.findAll({
      where: { feedId: feedId },
      attributes: [
        "item",
        [Sequelize.fn("COUNT", Sequelize.col("item")), "voteCount"],
      ],
      group: ["item"],
      raw: true,
    });
    // 투표 결과 배열
    const result = pollOptions.map((option, idx) => {
      const pollResult = pollResults.find((poll) => poll.item === idx);
      return pollResult ? pollResult.voteCount : 0;
    });
    // 현재 유저가 해당 피드에 투표했는지 확인
    const isVoted = userId
      ? (await Polls.findOne({
          where: {
            feedId: feedId,
            userId: userId,
          },
        }))
        ? true
        : false
      : false;
    // 현재 유저가 좋아요를 눌렀는지 확인
    const isLiked = userId
      ? feed.LikedByUsers.some((user) => user.id === userId)
      : false;

    return res.status(200).json({
      feedId: feed.id,
      user: {
        userId: feed.userId,
        nickname: feed.User.nickname,
        profileImage: feed.User.profileImage,
      },
      content: feed.content,
      pollContent: feed.pollContent,
      commentCount: feed.commentCount,
      likeCount: feed.likeCount,
      images: feed.images || [],
      polls: pollOptions,
      pollCount: feed.pollCount,
      updatedAt: feed.updatedAt,
      result: result,
      isVoted: isVoted,
      isLiked: isLiked,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.voteFeed = async (req, res, next) => {
  const { feedId } = req.params;
  const userId = req.user.id;
  const { pollItem } = req.body;
  try {
    const feed = await Feeds.findOne({
      where: { id: feedId },
      attributes: ["polls", "pollCount"],
    });
    if (!feed) {
      return res.status(404).json({ message: "FEED_NOT_FOUND" });
    }
    const pollCount = feed.pollCount;
    if (pollItem < 0 || pollItem >= pollCount) {
      return res.status(400).json({ message: "INVALID_POLL_INDEX" });
    }
    // 투표 항목 중복 체크
    const isVoted = await Polls.findOne({
      where: {
        feedId: feedId,
        userId: userId,
      },
    });
    if (isVoted) {
      return res.status(400).json({ message: "ALREADY_VOTED" });
    }
    // 투표 항목 추가
    await Polls.create({
      feedId,
      userId,
      item: pollItem,
    });
    return res.status(200).json({ message: "VOTE_SUCCESS" });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.likeFeed = async (req, res, next) => {
  const { feedId } = req.params;
  const userId = req.user.id;
  try {
    const feed = await Feeds.findByPk(feedId);

    if (!feed) {
      return res.status(404).json({ message: "FEED_NOT_FOUND" });
    }

    const like = await Likes.findOne({
      where: {
        feedId: feedId,
        userId: userId,
      },
    });
    if (like) {
      await like.destroy();
      await feed.update({ likeCount: feed.likeCount - 1 }, { silent: true });
      return res.status(200).json({ message: "UNLIKE_SUCCESS" });
    } else {
      await Likes.create({
        feedId,
        userId,
      });
      await feed.update({ likeCount: feed.likeCount + 1 }, { silent: true });
      return res.status(200).json({ message: "LIKE_SUCCESS" });
    }
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.deleteFeed = async (req, res, next) => {
  const { feedId } = req.params;
  const userId = req.user.id;
  try {
    const feed = await Feeds.findOne({
      where: {
        id: feedId,
        userId: userId,
      },
    });
    if (!feed) {
      return res.status(404).json({ message: "FEED_NOT_FOUND" });
    }
    await feed.destroy();
    return res.status(200).json({ message: "FEED_DELETE_SUCCESS" });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.getAllFeed = async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query; // 기본값: page 1, limit 10
  const accessToken = req.cookies?.accessToken;
  const decodedToken = accessToken ? jwt.decode(accessToken) : null;
  const userId = decodedToken ? decodedToken.id : null;

  try {
    const offset = (page - 1) * limit;

    // 모든 피드 최신순으로 조회
    const feeds = await Feeds.findAll({
      offset: offset,
      limit: parseInt(limit),
      order: [["updatedAt", "DESC"]],
      attributes: [
        "id",
        "userId",
        "content",
        "pollContent",
        "commentCount",
        "likeCount",
        "polls",
        "images",
        "pollCount",
        "updatedAt",
      ],
      include: [
        {
          model: Users,
          as: "User",
          attributes: ["nickname", "profileImage"],
        },
        {
          model: Polls,
          as: "Polls",
          attributes: ["item", "feedId"],
        },
        {
          model: Comments,
          as: "Comments",
          attributes: ["id"],
        },
        {
          model: Users,
          as: "LikedByUsers",
          attributes: ["id"],
          through: {
            attributes: [],
          },
        },
      ],
    });

    if (feeds.length === 0) {
      return res.status(200).json({ hasNextPage: false, feeds: [] });
    }

    // 각 피드에 대해 추가 정보를 계산
    const feedData = await Promise.all(
      feeds.map(async (feed) => {
        const pollOptions = feed.polls;
        const pollResults = await Polls.findAll({
          where: { feedId: feed.id },
          attributes: [
            "item",
            [Sequelize.fn("COUNT", Sequelize.col("item")), "voteCount"],
          ],
          group: ["item"],
          raw: true,
        });

        const result = pollOptions.map((option, idx) => {
          const pollResult = pollResults.find((poll) => poll.item === idx);
          return pollResult ? pollResult.voteCount : 0;
        });

        const isVoted = userId
          ? !!(await Polls.findOne({
              where: {
                feedId: feed.id,
                userId: userId,
              },
            }))
          : false;

        const isLiked = userId
          ? feed.LikedByUsers.some((user) => user.id === userId)
          : false;

        return {
          feedId: feed.id,
          user: {
            userId: feed.userId,
            nickname: feed.User.nickname,
            profileImage: feed.User.profileImage,
          },
          content: feed.content,
          pollContent: feed.pollContent,
          commentCount: feed.commentCount,
          likeCount: feed.likeCount,
          images: feed.images || [],
          polls: pollOptions,
          pollCount: feed.pollCount,
          updatedAt: feed.updatedAt,
          result: result,
          isVoted: isVoted,
          isLiked: isLiked,
        };
      })
    );

    // 다음 페이지 여부 판단
    const totalFeeds = await Feeds.count();
    const hasNextPage = page * limit < totalFeeds;

    return res.status(200).json({
      hasNextPage: hasNextPage,
      feeds: feedData,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};
