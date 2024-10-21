const jwt = require("jsonwebtoken");

// accessToken 발급
exports.issueAccessToken = ({ id, email }) => {
  // JWT 토큰 발급
  return jwt.sign(
    {
      id,
      email,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

exports.issueRefreshToken = () => {
  // JWT 토큰 발급
  // refreshToken은 payload 없이 발급
  return jwt.sign({}, process.env.JWT_SECRET, { expiresIn: "3d" });
};
