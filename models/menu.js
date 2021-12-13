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
      models.Menu.belongsTo( models.Recipe, { foreignKey: 'recipeId' } );
      models.Menu.belongsTo( models.User, { foreignKey: 'userId' } );
    }
  };
  Menu.init({
    dateToMake: DataTypes.STRING,
    recipeId: DataTypes.INTEGER,
    imageURL: DataTypes.STRING,
    userId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Menu',
  });
  return Menu;
};