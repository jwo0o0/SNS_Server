const Sequelize = require("sequelize");

class Feeds extends Sequelize.Model {
  static initiate(sequelize) {
    Feeds.init(
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
        content: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        pollContent: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        commentCount: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        likeCount: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        images: {
          type: Sequelize.JSON,
          allowNull: true,
          validate: {
            isValidArray(value) {
              if (value && value.length > 5) {
                throw new Error("이미지는 최대 5개까지 가능합니다.");
              }
            },
          },
        },
        polls: {
          type: Sequelize.JSON,
          allowNull: false,
          validate: {
            isValidLength(value) {
              const size = value.length;
              if (size < 2 || size > 5) {
                throw new Error("투표 항목은 2개에서 5개까지 가능합니다.");
              }
            },
          },
        },
        pollCount: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "Feeds",
        tableName: "feeds",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    // Users 모델과의 관계 정의
    Feeds.belongsTo(db.Users, {
      foreignKey: "userId",
      targetKey: "id",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
    // Polls 모델과의 관계
    Feeds.hasOne(db.Polls, {
      foreignKey: "feedId",
      as: "poll",
    });
    // Like 모델과의 관계
    Feeds.belongsToMany(db.Users, {
      through: db.Likes,
      foreignKey: "feedId",
      as: "LikedByUsers",
    });
    // Comment 모델과의 관계
    Feeds.hasMany(db.Comments, {
      foreignKey: "feedId",
      sourceKey: "id",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
    // Poll 모델과의 관계
    Feeds.hasMany(db.Polls, {
      foreignKey: "feedId",
      sourceKey: "id",
      onDelete: "CASCADE",
    });
  }
}

module.exports = Feeds;
