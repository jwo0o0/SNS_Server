const passport = require("passport");
const KakaoStrategy = require("passport-kakao").Strategy;
const jwt = require("jsonwebtoken");
const User = require("../models/user");

module.exports = () => {
  passport.use(
    new KakaoStrategy(
      {
        clientID: process.env.KAKAO_ID, // 카카오 REST API 키
        callbackURL: "/auth/kakao/callback", // 카카오 인증 후 리다이렉트 URL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // 카카오 프로필을 사용해 유저 조회
          const exUser = await User.findOne({
            where: { snsId: profile.id, provider: "kakao" },
          });

          if (exUser) {
            // 기존 유저가 있으면 JWT 토큰 발급
            const token = jwt.sign(
              { id: exUser.id, email: exUser.email },
              process.env.JWT_SECRET,
              { expiresIn: "24h" }
            );
            return done(null, { user: exUser, token }); // JWT 토큰과 함께 반환
          } else {
            // 신규 유저면 회원가입 후 토큰 발급
            const newUser = await User.create({
              email: profile._json?.kakao_account?.email || "", // 이메일이 제공되지 않을 수 있으므로 || null 처리
              nickname: profile.displayName, // 카카오 닉네임
              snsId: profile.id, // 카카오 고유 ID
              provider: "kakao", // provider를 kakao로 설정
            });

            const token = jwt.sign(
              { id: newUser.id, email: newUser.email },
              process.env.JWT_SECRET,
              { expiresIn: "1h" }
            );
            return done(null, { user: newUser, token }); // JWT 토큰과 함께 반환
          }
        } catch (error) {
          console.error(error);
          return done(error);
        }
      }
    )
  );
};
