const express = require("express");
const passport = require("passport");

const {
  signup,
  login,
  logout,
  reissueAccessToken,
  kakaoSignup,
} = require("../controllers/authController");

const router = express.Router();

// 회원가입 POST /auth/signup
router.post("/signup", signup);

// 로그인 POST /auth/login
router.post("/login", login);

// 로그아웃 POST /auth/logout
router.post("/logout", logout);

// accessToken 재발급 /auth/refresh
router.post("/refresh", reissueAccessToken);

// 카카오 로그인 POST /auth/kakao
router.get("/kakao", passport.authenticate("kakao", { session: false }));
// 카카오 로그인 성공/실패 후 리다이렉트 처리
router.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    failureRedirect: "/", // 로그인 실패 시 리다이렉트할 경로,
    session: false,
  }),
  (req, res) => {
    try {
      // JWT 토큰과 사용자 정보를 반환
      const { accessToken, user, isNew } = req.user;
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // 프로덕션에서만 HTTPS에서 쿠키 전송
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // 크로스 사이트 요청에서 쿠키 전송 방지
      });
      // 클라이언트 측 redirect URL
      const redirectUrl = `${
        process.env.NODE_ENV === "production"
          ? process.env.CLIENT_PROD_URL
          : process.env.CLIENT_DEV_URL
      }`;
      if (isNew) {
        // 새로운 유저
        return res.redirect(
          redirectUrl + `/signup/kakao?id=${user.id}&nickname=${user.nickname}`
        );
      } else {
        return res.redirect(
          redirectUrl +
            `/login/kakao?id=${user.id}&nickname=${user.nickname}&email=${user.email}`
        );
      }
    } catch (error) {
      console.error(error);
      return next(error);
    }
  }
);

// 카카오 회원가입 후 유저 정보 갱신 /auth/signup/kakao
router.patch("/signup/kakao", kakaoSignup);

module.exports = router;
