const Sequelize = require("sequelize");

class Follows extends Sequelize.Model {
  static initiate(sequelize) {
    Follows.init(
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
            model: "Users", // Users 테이블을 참조
            key: "id", // Users 테이블의 id 컬럼과 연결
          },
          onDelete: "CASCADE", // 해당 유저가 삭제되면 이 관계도 삭제됨
        },
        followingUserId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "Users", // Users 테이블을 참조
            key: "id", // Users 테이블의 id 컬럼과 연결
          },
          onDelete: "CASCADE", // 해당 유저가 삭제되면 이 관계도 삭제됨
        },
      },
      {
        sequelize,
        timestamps: false,
        underscored: false,
        modelName: "Follows",
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
    db.Follows.belongsTo(db.Users, {
      foreignKey: "followerUserId",
      as: "Follower", // Alias 설정
      onDelete: "CASCADE",
    });

    db.Follows.belongsTo(db.Users, {
      foreignKey: "followingUserId",
      as: "Following", // Alias 설정
      onDelete: "CASCADE",
    });
  }
}

module.exports = Follows;
