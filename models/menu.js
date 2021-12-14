'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Menu extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Menu.belongsTo(models.Recipe, { foreignKey: 'recipeId' });
      models.Menu.belongsTo(models.User, { foreignKey: 'userId' });
    }
  };
  Menu.init({
    dateToMake: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isDate: {
          msg: "a date needs to be entered for this request"
        }
      }
    },
    recipeId: {
      type: DataTypes.INTEGER,
      allowNull:false,
      validate:{
        notEmpty:{
          msg: "recipe ID can not be empty"
        }
      }
    },
    imageURL: DataTypes.STRING,
    userId: {
      type: DataTypes.INTEGER,
      allowNull:false,
      validate:{
        notEmpty:{
          msg: "user ID can not be empty"
        }
      }
    },
    requestUserId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Menu',
  });
  return Menu;
};