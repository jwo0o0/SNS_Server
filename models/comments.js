const Sequelize = require("sequelize");

class Comment extends Sequelize.Model {
  static initiate(sequelize) {
    Comment.init(
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        feedId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "Feed",
            key: "id",
          },
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "User",
            key: "id",
          },
          onDelete: "CASCADE",
        },
        content: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        modelName: "Comment",
        tableName: "comments",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    Comment.belongsTo(db.Feed, {
      foreignKey: "feedId",
      targetKey: "id",
      as: "feed",
    });
    Comment.belongsTo(db.User, {
      foreignKey: "userId",
      targetKey: "id",
      as: "user",
    });
  }
}

module.exports = Comment;
