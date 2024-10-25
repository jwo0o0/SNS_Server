const passport = require("passport");
const KakaoStrategy = require("passport-kakao").Strategy;
const User = require("../models/users");
const { redisClient } = require("../config/redis");
const { issueAccessToken, issueRefreshToken } = require("../utils/authUtils");

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
            const accessToken = issueAccessToken({
              id: profile.id,
              email: profile.email,
            });
            return done(null, { user: exUser, accessToken, isNew: false }); // JWT 토큰과 함께 반환
          } else {
            // 신규 유저면 회원가입 후 토큰 발급
            const newUser = await User.create({
              email: profile._json?.kakao_account?.email || "", // 이메일이 제공되지 않을 수 있으므로 || null 처리
              nickname: profile.displayName, // 카카오 닉네임
              snsId: profile.id, // 카카오 고유 ID
              provider: "kakao", // provider를 kakao로 설정
              password: "", // 비밀번호는 빈 문자열로 설정
            });
            // JWT 토큰 발급
            const accessToken = issueAccessToken({
              id: newUser.id,
              email: newUser.email,
            });
            const refreshToken = issueRefreshToken();
            await redisClient.set(String(newUser.id), refreshToken);
            return done(null, { user: newUser, accessToken, isNew: true }); // JWT 토큰과 함께 반환
          }
        } catch (error) {
          console.error(error);
          return done(error);
        }
      }
    )
  );
};
