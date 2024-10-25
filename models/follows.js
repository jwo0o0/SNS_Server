const Sequelize = require("sequelize");

class Follow extends Sequelize.Model {
  static initiate(sequelize) {
    Follow.init(
      {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        followerUserId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "User", // User 테이블을 참조
            key: "id", // User 테이블의 id 컬럼과 연결
          },
          onDelete: "CASCADE", // 해당 유저가 삭제되면 이 관계도 삭제됨
        },
        followingUserId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "User", // User 테이블을 참조
            key: "id", // User 테이블의 id 컬럼과 연결
          },
          onDelete: "CASCADE", // 해당 유저가 삭제되면 이 관계도 삭제됨
        },
      },
      {
        sequelize,
        timestamps: false,
        underscored: false,
        modelName: "Follow",
        tableName: "follows",
        paranoid: false,
        charset: "utf8",
        collate: "utf8_general_ci",
      }
    );
  }

  // 유저와의 연관 관계 정의
  static associate(db) {
    // 팔로워(Follower)와 팔로잉(Following)의 관계 설정
    db.Follow.belongsTo(db.User, {
      foreignKey: "followerUserId",
      as: "Follower", // Alias 설정
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    db.Follow.belongsTo(db.User, {
      foreignKey: "followingUserId",
      as: "Following", // Alias 설정
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  }
}

module.exports = Follow;
