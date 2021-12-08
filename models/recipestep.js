'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class RecipeStep extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.RecipeStep.belongsTo( models.Recipe, { foreignKey: 'recipeId' } );
    }
  };
  RecipeStep.init({
    stepNumber: DataTypes.STRING,
    instructions: DataTypes.STRING,
    imageURL: DataTypes.STRING,
    recipeId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'RecipeStep',
  });
  return RecipeStep;
};