'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RecipeCategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.RecipeCategory.hasMany(models.Recipe, { foreignKey: 'recipeCategoryId' });
    }
  };
  RecipeCategory.init({
    categoryName: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'RecipeCategory',
  });
  return RecipeCategory;
};