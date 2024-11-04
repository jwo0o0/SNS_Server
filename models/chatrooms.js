const Sequelize = require("sequelize");

class ChatRooms extends Sequelize.Model {
  static initiate(sequelize) {
    ChatRooms.init(
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        participants: {
          type: Sequelize.JSON,
          allowNull: false,
          validate: {
            isValidArray(value) {
              if (value && value.length !== 2) {
                throw new Error("참여자는 2명이어야 합니다.");
              }
            },
          },
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "ChatRooms",
        tableName: "chatrooms",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    ChatRooms.hasMany(db.Messages, {
      foreignKey: "chatRoomId",
      sourceKey: "id",
    });
  }
}

module.exports = ChatRooms;
