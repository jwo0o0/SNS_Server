const User = require("../models/user");
const { deleteProfileImage } = require("../middlewares/imageMiddleware");

exports.uploadProfile = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "유저를 찾을 수 없습니다." });
    }
    // 기존 프로필 이미지 삭제
    if (user.profileImage) {
      await deleteProfileImage(user.profileImage);
    }
    // 프로필 이미지 업데이트
    user.profileImage = req.profileImage;
    await user.save();
    return res.status(200).json({
      message: "프로필 이미지가 성공적으로 업로드되었습니다.",
      profileImage: user.profileImage,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};
