'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PantryStockList extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.PantryStockList.belongsTo( models.PantryCategory, { foreignKey: 'pantryCategoryId' } );
      models.PantryStockList.belongsTo( models.User, { foreignKey: 'userId' } );
    }
  };
  PantryStockList.init({
    itemName: DataTypes.STRING,
    inStock: DataTypes.BOOLEAN,
    pantryCategoryId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'PantryStockList',
  });
  return PantryStockList;
};