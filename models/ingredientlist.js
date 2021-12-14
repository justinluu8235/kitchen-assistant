'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class IngredientList extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.IngredientList.belongsTo( models.Recipe, { foreignKey: 'recipeId' } );
    }
  };
  IngredientList.init({
    ingredientName: {
      type: DataTypes.STRING,
      allowNull:false,
      validate:{
        notEmpty:{
          msg: "Ingredient Name can not be empty"
        }
      }
    },
    ingredientQuantity: DataTypes.STRING,
    quantityUnit: DataTypes.STRING,
    recipeId: {
      type: DataTypes.INTEGER,
      allowNull:false,
      validate:{
        notEmpty:{
          msg: "recipe ID can not be empty"
        }
      }
    },
  }, {
    sequelize,
    modelName: 'IngredientList',
  });
  return IngredientList;
};