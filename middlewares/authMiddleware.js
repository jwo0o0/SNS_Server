const jwt = require("jsonwebtoken");

// 쿠키에 저장된 accessToken 검증 미들웨어
// 인증에 필요한 라우터에 사용
exports.verifyAccessToken = (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  if (!accessToken) {
    return res.status(401).json({ message: "NO_ACCESS_TOKEN" });
  }
  try {
    // 토큰 검증
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "ACCESS_TOKEN_EXPIRED" });
  }
};
