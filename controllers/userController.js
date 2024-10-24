const Users = require("../models/users");
const Follows = require("../models/follows");
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
    console.log("userId", userId);
    // 유저 정보
    const user = await Users.findOne({
      where: { id: userId },
      attributes: ["nickname", "bio", "profileImage"],
    });
    if (!user) {
      return res.status(404).json({ message: "USER_NOT_FOUND" });
    }
    const followersCount = await Follows.count({
      where: { followingUserId: "userId" },
    });
    const followingsCount = await Follows.count({
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
