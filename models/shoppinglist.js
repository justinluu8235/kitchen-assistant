'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ShoppingList extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.ShoppingList.belongsTo( models.User, { foreignKey: 'userId' } );
    }
  };
  ShoppingList.init({
    shoppingListItem: DataTypes.STRING,
    ingredientQuantity: DataTypes.INTEGER,
    quantityUnit: DataTypes.STRING,
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
    modelName: 'ShoppingList',
  });
  return ShoppingList;
};