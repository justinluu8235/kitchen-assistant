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
    friendId:  {
      type: DataTypes.INTEGER,
      allowNull:false,
      validate:{
        notEmpty:{
          msg: "friend ID can not be empty"
        }
      }
    },
    userId:  {
      type: DataTypes.INTEGER,
      allowNull:false,
      validate:{
        notEmpty:{
          msg: "user ID can not be empty"
        }
      }
    },
  }, {
    sequelize,
    modelName: 'UserFriend',
  });
  return UserFriend;
};