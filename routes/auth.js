const express = require("express");
const passport = require("passport");

const { isLoggedIn, isNotLoggedIn } = require("../middlewares");
const { join, login, logout } = require("../controllers/authController");

const router = express.Router();

// 회원가입 POST /auth/join
router.post("/join", join);

// 로그인 POST /auth/login
router.post("/login", login);

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

// // POST /auth/join
// router.post("/join", isNotLoggedIn, join);

// // POST /auth/login
// router.post("/login", isNotLoggedIn, login);

// // GET /auth/logout
// router.get("/logout", isLoggedIn, logout);

// // GET /auth/kakao
// router.get("/kakao", passport.authenticate("kakao"));

// // GET /auth/kakao/callback
// router.get(
//   "/kakao/callback",
//   passport.authenticate("kakao", {
//     failureRedirect: "/?error=카카오로그인 실패",
//   }),
//   (req, res) => {
//     res.redirect("/"); // 성공 시에는 /로 이동
//   }
// );

module.exports = router;
