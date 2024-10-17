const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.join = async (req, res, next) => {
  const { email, nickname, password, bio, profileImage } = req.body;
  try {
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
      profileImage,
    });
    // JWT 토큰 발급
    const token = jwt.sign(
      {
        id: user.id,
        email: user,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
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
        expiresIn: "1h",
      }
    );

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
