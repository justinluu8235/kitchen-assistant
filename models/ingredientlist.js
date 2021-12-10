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
    ingredientName: DataTypes.STRING,
    ingredientQuantity: DataTypes.STRING,
    quantityUnit: DataTypes.STRING,
    recipeId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'IngredientList',
  });
  return IngredientList;
};