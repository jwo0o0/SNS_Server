const Sequelize = require("sequelize");

class Polls extends Sequelize.Model {
  static initiate(sequelize) {
    Polls.init(
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
            model: "Feeds",
            key: "id",
          },
          onDelete: "CASCADE",
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "Users",
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
        modelName: "Polls",
        tableName: "polls",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    Polls.belongsTo(db.Feeds, {
      foreignKey: "feedId",
      as: "feed",
    });
    Polls.belongsTo(db.Users, {
      foreignKey: "userId",
      as: "user",
    });
  }
}

module.exports = Polls;
