const Sequelize = require("sequelize");

class Messages extends Sequelize.Model {
  static initiate(sequelize) {
    Messages.init(
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        chatRoomId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "ChatRooms",
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
        read: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        image: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
      },
      {
        sequelize,
        timestamps: true,
        modelName: "Messages",
        tableName: "messages",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    Messages.belongsTo(db.ChatRooms, {
      foreignKey: "chatRoomId",
      targetKey: "id",
      as: "ChatRoom",
      onDelete: "CASCADE",
    });
    Messages.belongsTo(db.Users, {
      foreignKey: "userId",
      targetKey: "id",
      as: "Sender",
      onDelete: "CASCADE",
    });
  }
}

module.exports = Messages;
