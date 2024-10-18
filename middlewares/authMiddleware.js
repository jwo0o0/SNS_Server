const jwt = require("jsonwebtoken");

// JWT 인증 미들웨어
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "토큰이 필요합니다." });
  }
  // Bearer 토큰 형식일 경우 처리
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // 토큰 검증
    req.user = decoded; // 유저 정보 저장
    next(); // 다음 미들웨어로 이동
  } catch (error) {
    return res.status(401).json({ message: "유효하지 않은 토큰입니다." });
  }
};
