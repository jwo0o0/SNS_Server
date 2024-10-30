const Sequelize = require("sequelize");

class Users extends Sequelize.Model {
  static initiate(sequelize) {
    Users.init(
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
        modelName: "Users",
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
    Users.belongsToMany(db.Users, {
      through: db.Follows,
      as: "Followers",
      foreignKey: "followingUserId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
    // 유저가 팔로우하는 다른 유저들
    Users.belongsToMany(db.Users, {
      through: db.Follows,
      as: "Followings",
      foreignKey: "followerUserId",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    // Feed 모델과의 관계
    Users.hasMany(db.Feeds, {
      as: "CreatedFeeds",
      foreignKey: "userId",
      sourceKey: "id",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    Users.belongsToMany(db.Feeds, {
      through: db.Likes,
      as: "LikedFeeds",
      foreignKey: "userId",
      otherKey: "feedId",
    });

    // Like 모델과의 관계
    Users.hasMany(db.Likes, {
      as: "UserLikes",
      foreignKey: "userId",
    });

    // Comment 모델과의 관계
    Users.hasMany(db.Comments, {
      foreignKey: "userId",
      sourceKey: "id",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
    // Poll 모델과의 관계
    Users.hasMany(db.Polls, {
      foreignKey: "userId",
      sourceKey: "id",
    });
  }
}

module.exports = Users;
