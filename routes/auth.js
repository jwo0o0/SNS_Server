const express = require("express");
const passport = require("passport");

const {
  signup,
  login,
  logout,
  reissueAccessToken,
} = require("../controllers/authController");

const router = express.Router();

// 회원가입 POST /auth/signup
router.post("/signup", signup);

// 로그인 POST /auth/login
router.post("/login", login);

// 로그아웃 POST /auth/logout
router.post("/logout", logout);

// accessToken 재발급 /refresh
router.post("/refresh", reissueAccessToken);

// 카카오 로그인 POST /auth/kakao
router.get("/kakao", passport.authenticate("kakao"));
// 카카오 로그인 성공/실패 후 리다이렉트 처리
router.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    failureRedirect: "/", // 로그인 실패 시 리다이렉트할 경로
  }),
  (req, res) => {
    // JWT 토큰과 사용자 정보를 반환
    const { token, user } = req.user;
    res.json({
      message: "카카오 로그인 성공",
      token,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nick,
      },
    });
  }
);

module.exports = router;
