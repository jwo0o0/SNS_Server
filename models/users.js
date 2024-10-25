const Sequelize = require("sequelize");

class User extends Sequelize.Model {
  static initiate(sequelize) {
    User.init(
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        email: {
          type: Sequelize.STRING(100),
          allowNull: false,
          unique: true,
        },
        nickname: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        password: {
          type: Sequelize.STRING(255),
          allowNull: false,
        },
        bio: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        profileImage: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        provider: {
          type: Sequelize.ENUM("local", "kakao"),
          allowNull: false,
          defaultValue: "local",
        },
        snsId: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: "User",
        tableName: "users",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  static associate(db) {
    // Follow 모델과의 관계
    // 유저를 팔로우하는 다른 유저들
    User.belongsToMany(db.Users, {
      through: db.Follow,
      as: "Followers",
      foreignKey: "followingUserId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
    // 유저가 팔로우하는 다른 유저들
    User.belongsToMany(db.Users, {
      through: db.Follow,
      as: "Followings",
      foreignKey: "followerUserId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // Feed 모델과의 관계
    User.hasMany(db.Feed, {
      foreignKey: "userId",
      sourceKey: "id",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // Like 모델과의 관계
    User.belongsToMany(db.Feed, {
      through: db.Like,
      foreignKey: "userId",
      as: "LikedFeeds",
    });

    // Comment 모델과의 관계
    User.hasMany(db.Comment, {
      foreignKey: "userId",
      sourceKey: "id",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
    // Poll 모델과의 관계
    User.hasMany(db.Poll, {
      foreignKey: "userId",
      sourceKey: "id",
    });
  }
}

module.exports = User;
