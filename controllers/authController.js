const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.signup = async (req, res, next) => {
  try {
    const { email, nickname, password, bio } = req.body;
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res.status(400).json({ message: "이미 사용 중인 이메일입니다." });
    }
    // 비밀번호 해싱
    const hash = await bcrypt.hash(password, 12);

    // 새로운 유저
    const user = await User.create({
      email,
      nickname,
      password: hash,
      bio,
    });
    // JWT 토큰 발급
    const token = jwt.sign(
      {
        id: user.id,
        email: user,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    // 토큰을 쿠키에 저장
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // 프로덕션에서만 HTTPS에서 쿠키 전송
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "none", // 크로스 사이트 요청에서 쿠키 전송 방지
      maxAge: 60 * 60 * 1000 * 24,
    });
    return res.status(201).json({
      message: "회원가입 성공",
      token,
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
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email, provider: "local" } });
    if (!user) {
      return res.status(400).json({ message: "등록된 이메일이 아닙니다." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );
    // 토큰을 쿠키에 저장
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // 프로덕션에서만 HTTPS에서 쿠키 전송
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "none", // 크로스 사이트 요청에서 쿠키 전송 방지
      maxAge: 60 * 60 * 1000 * 24,
    });
    return res.status(200).json({
      message: "로그인 성공",
      token,
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
  res.clearCookie("token", {
    http: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "none",
  });
  return res.status(200).json({ message: "로그아웃 성공" });
};
