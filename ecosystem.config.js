module.exports = {
  apps: [
    {
      name: "app",
      script: "app.js",
      instances: 1, // 싱글 인스턴스
      instances: "1",
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "development",
        CLIENT_DEV_URL: "http://localhost:3000",
      },
      env_production: {
        NODE_ENV: "production",
        CLIENT_PROD_URL: "https://pickitsns.site",
      },
    },
  ],
};
