const Sequelize = require("sequelize");
const Users = require("../models/users");
const Follow = require("../models/follows");
const Feeds = require("../models/feeds");
const Polls = require("../models/polls");
const Comments = require("../models/comments");
const jwt = require("jsonwebtoken");
const { deleteProfileImage } = require("../middlewares/imageMiddleware");

exports.uploadProfile = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const user = await Users.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "NOT_FOUND_USER" });
    }
    // 기존 프로필 이미지 삭제
    if (user.profileImage) {
      await deleteProfileImage(user.profileImage);
    }
    // 프로필 이미지 업데이트
    user.profileImage = req.profileImage;
    await user.save();
    return res.status(200).json({
      message: "PROFILE_IMAGE_UPLOAD_SUCCESS",
      profileImage: user.profileImage,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.getUserProfile = async (req, res, next) => {
  try {
    const userId = req.params.id;
    // 유저 정보
    const user = await Users.findOne({
      where: { id: userId },
      attributes: ["nickname", "bio", "profileImage"],
    });
    if (!user) {
      return res.status(404).json({ message: "USER_NOT_FOUND" });
    }
    const followersCount = await Follow.count({
      where: { followingUserId: "userId" },
    });
    const followingsCount = await Follow.count({
      where: { followerUserId: userId },
    });

    return res.status(200).json({
      nickname: user.nickname,
      bio: user.bio,
      profileImage: user.profileImage,
      followers: followersCount,
      followings: followingsCount,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.getUserFeeds = async (req, res, next) => {
  const { userId } = req.params;
  const accessToken = req.cookies?.accessToken;
  const currentUserId = accessToken ? jwt.decode(accessToken).id : null;

  try {
    const feeds = await Feeds.findAll({
      where: { userId: userId },
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
      order: [["updatedAt", "DESC"]],
    });

    if (!feeds || feeds.length === 0) {
      // 빈 배열 반환
      return res.status(200).json([]);
    }

    // 각 피드에 대해 추가 정보를 계산
    const feedData = await Promise.all(
      feeds.map(async (feed) => {
        // 투표 항목과 각 항목에 대한 투표 수 계산
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

        // 현재 유저가 해당 피드에 투표했는지 확인
        const isVoted = currentUserId
          ? !!(await Polls.findOne({
              where: {
                feedId: feed.id,
                userId: currentUserId,
              },
            }))
          : false;

        // 현재 유저가 좋아요를 눌렀는지 확인
        const isLiked = currentUserId
          ? feed.LikedByUsers.some((user) => user.id === currentUserId)
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

    return res.status(200).json(feedData);
  } catch (error) {
    console.error(error);
    return next(error);
  }
};
