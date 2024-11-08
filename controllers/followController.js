const Users = require("../models/users");
const Follows = require("../models/follows");
const jwt = require("jsonwebtoken");

exports.follow = async (req, res, next) => {
  try {
    const followerUserId = req.user.id; // 현재 로그인한 사용자 ID
    const { userId: followingUserId } = req.params; // 팔로우할 대상 유저 ID

    console.log(followerUserId, followingUserId);
    if (followerUserId === parseInt(followingUserId, 10)) {
      return res.status(400).json({ message: "CANNOT_FOLLOW_SELF" });
    }

    // 이미 팔로우 중인지 확인
    const existingFollow = await Follows.findOne({
      where: { followerUserId, followingUserId },
    });

    if (existingFollow) {
      return res.status(400).json({
        message: "ALREADY_FOLLOWING",
        followerUserId,
        followingUserId,
      });
    }

    // 팔로우 관계 생성
    await Follows.create({ followerUserId, followingUserId });
    return res.status(201).json({ message: "FOLLOW_SUCCESS" });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.unfollow = async (req, res, next) => {
  try {
    const followerUserId = req.user.id; // 현재 로그인한 사용자 ID
    const { userId: followingUserId } = req.params; // 언팔로우할 대상 유저 ID

    // 팔로우 관계 확인
    const follow = await Follows.findOne({
      where: { followerUserId, followingUserId },
    });

    if (!follow) {
      return res.status(404).json({ message: "FOLLOW_NOT_FOUND" });
    }

    // 팔로우 관계 삭제
    await follow.destroy();
    return res.status(200).json({ message: "UNFOLLOW_SUCCESS" });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.getFollowing = async (req, res, next) => {
  const accessToken = req.cookies?.accessToken;
  const decodedToken = accessToken ? jwt.decode(accessToken) : null;
  const currentUserId = decodedToken ? decodedToken.id : null;
  try {
    const { userId } = req.params;
    const user = await Users.findOne({
      where: { id: userId },
      attributes: ["nickname"],
      include: [
        {
          model: Users,
          as: "Followings",
          attributes: ["id", "nickname", "profileImage"],
          include: [
            {
              model: Users,
              as: "Followers",
              attributes: ["id"],
            },
          ],
        },
      ],
    });
    if (!user) {
      return res.status(404).json({ message: "USER_NOT_FOUND" });
    }
    const followingList = user.Followings.map((followingUser) => ({
      userId: followingUser.id,
      nickname: followingUser.nickname,
      profileImage: followingUser.profileImage,
      isFollowing: followingUser.Followers.some(
        (follower) => follower.id === currentUserId
      ),
    }));
    return res.status(200).json({ following: followingList });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.getFollowers = async (req, res, next) => {
  const accessToken = req.cookies?.accessToken;
  const decodedToken = accessToken ? jwt.decode(accessToken) : null;
  const currentUserId = decodedToken ? decodedToken.id : null;
  try {
    const { userId } = req.params;
    const user = await Users.findOne({
      where: { id: userId },
      attributes: ["nickname"],
      include: [
        {
          model: Users,
          as: "Followers",
          attributes: ["id", "nickname", "profileImage"],
          include: [
            {
              model: Users,
              as: "Followers",
              attributes: ["id"],
            },
          ],
        },
      ],
    });
    if (!user) {
      return res.status(404).json({ message: "USER_NOT_FOUND" });
    }
    const followerList = user.Followers.map((follower) => ({
      userId: follower.id,
      nickname: follower.nickname,
      profileImage: follower.profileImage,
      isFollowing: follower.Followers.some(
        (follow) => follow.id === currentUserId
      ),
    }));
    return res.status(200).json({ followers: followerList });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};
