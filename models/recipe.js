'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Recipe extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Recipe.belongsTo( models.RecipeCategory, { foreignKey: 'recipeCategoryId' } );
      models.Recipe.belongsTo( models.User, { foreignKey: 'userId' } );
      models.Recipe.hasMany(models.IngredientList, { foreignKey: 'recipeId' });
      models.Recipe.hasMany(models.RecipeStep, { foreignKey: 'recipeId' });
      models.Recipe.hasMany(models.Menu, { foreignKey: 'recipeId' });
    }
  };
  Recipe.init({
    recipeName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "a recipe name needs to be entered"
        }
      }
    },
    numSteps: DataTypes.INTEGER,
    recipeCategoryId: DataTypes.INTEGER,
    userId:  {
      type: DataTypes.INTEGER,
    },
    imageURL: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Recipe',
  });
  return Recipe;
};