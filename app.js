const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const nunjucks = require("nunjucks");
const dotenv = require("dotenv");
const passport = require("passport");
const logger = require("./logger");
const cors = require("cors");
const { redisClient } = require("./config/redis");
dotenv.config();

const indexRouter = require("./routes");
const authRouter = require("./routes/auth");
const imageRouter = require("./routes/image");
const userRouter = require("./routes/user");
const feedRouter = require("./routes/feed");

const { sequelize } = require("./models");
const passportConfig = require("./passport");

const app = express();
passportConfig(); // 패스포트 설정
passportConfig();
passport.serializeUser(function (user, done) {
  console.log("passport session save: ", user.id);
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  console.log("passport session get id: ", id);

  done(null, id);
});
app.set("port", process.env.PORT || 8001);
app.set("view engine", "html");
nunjucks.configure("views", {
  express: app,
  watch: true,
});
sequelize
  .sync({ force: false })
  .then(() => {
    console.log("데이터베이스 연결 성공");
  })
  .catch((err) => {
    console.error(err);
  });

redisClient.connect();
redisClient.on("ready", () => {
  console.log("redis ready");
});
redisClient.on("error", (error) => {
  console.error(error);
});

if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
} else {
  app.use(morgan("dev"));
}

app.use(
  cors({
    origin: ["http://localhost:3000", "https://sns.jwoo.site"], // 클라이언트 도메인을 정확히 지정
    credentials: true, // 자격 증명 허용
  })
);
app.use(express.static(path.join(__dirname, "public")));
app.use("/img", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRouter);
app.use("/image", imageRouter);
app.use("/user", userRouter);
app.use("/feeds", feedRouter);
app.use("/", indexRouter);

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  logger.error(error.message);
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== "production" ? err : {};
  res.status(err.status || 500).json({
    message: err.message || "서버 오류가 발생했습니다.",
    error: process.env.NODE_ENV === "production" ? {} : err,
  });
});

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기중");
});
