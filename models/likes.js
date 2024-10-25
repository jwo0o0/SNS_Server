const Sequelize = require("sequelize");

class Likes extends Sequelize.Model {
  static initiate(sequelize) {
    Likes.init(
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
            model: "Users", // 연결될 테이블 이름
            key: "id",
          },
          onDelete: "CASCADE",
        },
        feedId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "Feeds",
            key: "id",
          },
        },
      },
      {
        sequelize,
        timestamps: true,
        modelName: "Likes",
        tableName: "likes",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    this.belongsTo(db.Users, {
      foreignKey: "userId",
      as: "user",
    });
    this.belongsTo(db.Feeds, {
      foreignKey: "feedId",
      as: "feed",
    });
  }
}

module.exports = Likes;
