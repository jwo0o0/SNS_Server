const passport = require("passport");
const kakao = require("./kakaoStrategy");
const User = require("../models/users");

module.exports = () => {
  passport.serializeUser((user, done) => {
    console.log("serialize");
    done(null, user.id);
  });

  // 세션에 저장된 아이디를 통해 사용자 정보 객체 복구
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findOne({ where: { id } });
      done(null, user); // 사용자 정보를 복구하여 req.user에 저장
    } catch (error) {
      done(error);
    }
  });

  kakao();
};
