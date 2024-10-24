const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { redisClient } = require("../config/redis");
const User = require("../models/users");
const { issueAccessToken, issueRefreshToken } = require("../utils/authUtils");

exports.signup = async (req, res, next) => {
  try {
    const { email, nickname, password, bio } = req.body;
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res.status(400).json({ message: "EMAIL_ALREADY_IN_USE" });
    }
    const hash = await bcrypt.hash(password, 12);
    // 새로운 유저
    const user = await User.create({
      email,
      nickname,
      password: hash,
      bio,
    });
    // accessToken 발급
    const accessToken = issueAccessToken({ id: user.id, email: user.email });
    // accessToken 토큰 쿠키에 저장
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // 프로덕션에서만 HTTPS에서 쿠키 전송
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // 크로스 사이트 요청에서 쿠키 전송 방지
    });
    // refreshToken 발급
    const refreshToken = issueRefreshToken();
    // refreshToken redis에 저장
    await redisClient.set(String(user.id), refreshToken);
    // 회원가입 성공
    return res.status(201).json({
      message: "SIGNUP_SUCCESS",
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
      },
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    // 이메일, 비밀번호 확인
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email, provider: "local" } });
    if (!user) {
      return res.status(404).json({ message: "USER_NOT_FOUND" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "PASSWORD_NOT_MATCH" });
    }
    // accessToken 발급
    const accessToken = issueAccessToken({ id: user.id, email: user.email });
    // accessToken 토큰 쿠키에 저장
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // 프로덕션에서만 HTTPS에서 쿠키 전송
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // 크로스 사이트 요청에서 쿠키 전송 방지
    });
    // refreshToken 발급
    const refreshToken = issueRefreshToken();
    // refreshToken redis에 저장
    await redisClient.set(String(user.id), refreshToken);
    return res.status(200).json({
      message: "LOGIN_SUCCESS",
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
      },
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.logout = (req, res) => {
  const { id } = req.body;
  res.clearCookie("accessToken", {
    http: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  });
  redisClient.del(String(id));
  return res.status(200).json({ message: "LOGOUT_SUCCESS" });
};

// accessToken 재발급
exports.reissueAccessToken = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  if (!accessToken) {
    return res.status(401).json({ message: "NO_ACCESS_TOKEN" });
  }
  const decoded = jwt.decode(accessToken);
  if (decoded === null) {
    res.status(401).json({ message: "NOT_AUTHORIZED" });
  }
  const userId = decoded.id;
  // refreshToken 만료되었는지 검증
  const refreshToken = await redisClient.get(String(userId));
  try {
    jwt.verify(refreshToken, process.env.JWT_SECRET);
  } catch (error) {
    // refreshToken 만료 -> 로그아웃
    res.clearCookie("accessToken");
    return res.status(401).json({ message: "REFRESH_TOKEN_EXPIRED" });
  }
  // 새로운 accessToken 발급
  const newAccessToken = issueAccessToken({
    id: decoded.id,
    email: decoded.email,
  });
  res.cookie("accessToken", newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // 프로덕션에서만 HTTPS에서 쿠키 전송
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // 크로스 사이트 요청에서 쿠키 전송 방지
  });
  return res.status(200).json({ message: "REISSUE_ACCESS_TOKEN_SUCCESS" });
};
