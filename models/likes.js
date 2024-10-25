const Sequelize = require("sequelize");

class Like extends Sequelize.Model {
  static initiate(sequelize) {
    Like.init(
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "User", // 연결될 테이블 이름
            key: "id",
          },
          onDelete: "CASCADE",
        },
        feedId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "Feed",
            key: "id",
          },
        },
      },
      {
        sequelize,
        timestamps: true,
        modelName: "Like",
        tableName: "likes",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    this.belongsTo(db.User, {
      foreignKey: "userId",
      as: "user",
    });
    this.belongsTo(db.Feed, {
      foreignKey: "feedId",
      as: "feed",
    });
  }
}

module.exports = Like;
