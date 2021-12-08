'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PantryCategory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.PantryCategory.hasMany(models.PantryStockList, { foreignKey: 'pantryCategoryId' });
    }
  };
  PantryCategory.init({
    categoryName: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'PantryCategory',
  });
  return PantryCategory;
};