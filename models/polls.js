const Sequelize = require("sequelize");

class Poll extends Sequelize.Model {
  static initiate(sequelize) {
    Poll.init(
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
          onDelete: "CASCADE",
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "User",
            key: "id",
          },
        },
        item: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: false,
        underscored: false,
        modelName: "Poll",
        tableName: "polls",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    Poll.belongsTo(db.Feed, {
      foreignKey: "feedId",
      as: "feed",
    });
    Poll.belongsTo(db.User, {
      foreignKey: "userId",
      as: "user",
    });
  }
}

module.exports = Poll;
