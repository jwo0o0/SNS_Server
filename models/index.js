"use strict";

const Sequelize = require("sequelize");
const process = require("process");
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.js")[env];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

const db = {
  Users: require("./users"),
  Feeds: require("./feeds"),
  Comments: require("./comments"),
  Likes: require("./likes"),
  Polls: require("./polls"),
  Follows: require("./follows"),
  ChatRooms: require("./chatrooms"),
  Messages: require("./messages"),
};

Object.keys(db).forEach((modelName) => {
  if (db[modelName].initiate) {
    db[modelName].initiate(sequelize);
  }
});

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
