const Sequelize = require("sequelize");

class Comments extends Sequelize.Model {
  static initiate(sequelize) {
    Comments.init(
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
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "Users",
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
        modelName: "Comments",
        tableName: "comments",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    Comments.belongsTo(db.Feeds, {
      foreignKey: "feedId",
      targetKey: "id",
      as: "feed",
    });
    Comments.belongsTo(db.Users, {
      foreignKey: "userId",
      targetKey: "id",
      as: "user",
    });
  }
}

module.exports = Comments;
