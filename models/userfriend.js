'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserFriend extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.UserFriend.belongsTo( models.User, { foreignKey: 'userId' } );
    }
  };
  UserFriend.init({
    friendEmail: DataTypes.STRING,
    friendId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'UserFriend',
  });
  return UserFriend;
};