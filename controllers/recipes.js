const express = require('express');
const { RowDescriptionMessage } = require('pg-protocol/dist/messages');
const router = express.Router();
const isLoggedIn = require('../middleware/isLoggedIn');
const { Recipe, User, RecipeCategory, IngredientList } = require('../models');
const user = require('../models/user');

//Create a new recipe page
router.get('/new', isLoggedIn, function (req, res) {
    res.render('recipes/new');
});

//Get Route - Edit an individual recipe. Get that recipe's info
router.get('/edit/:id', async function (req, res){
    let recipeID = Number(req.params.id);
    let recipeCategoryID;
    let recipe;
    let ingredientsArr;
    let recipeStepsArr;
    let recipeCategory;
    try {
        recipe = await Recipe.findByPk(recipeID);
        recipeCategoryID = recipe.recipeCategoryId;

    }
    catch (err) {
        console.log(err);
    }

    try {
        recipeCategory = await RecipeCategory.findByPk(recipeCategoryID);

    }
    catch (err) {
        console.log(err);
    }
    
    try {
        ingredientsArr = await recipe.getIngredientLists();

    }
    catch (err) {
        console.log(err);
    }
    

    try {
        recipeStepsArr = await recipe.getRecipeSteps();

   }
   catch (err) {
       console.log(err);
   }

    let number = 5;
    res.render('recipes/edit', {recipe, recipeCategory, recipeStepsArr, ingredientsArr})
})


//View an individual recipe
router.get('/:id', async function(req,res){
    let recipeID = Number(req.params.id);
    let recipe;
    let ingredientsArr;
    let recipeStepsArr;
    //Grab the recipe
    try {
        recipe = await Recipe.findByPk(recipeID);
    }
    catch (err) {
        console.log(err);
    }

    try {
        ingredientsArr = await recipe.getIngredientLists();

    }
    catch (err) {
        console.log(err);
    }
    

    try {
        recipeStepsArr = await recipe.getRecipeSteps();

   }
   catch (err) {
       console.log(err);
   }

   res.render('recipes/show', {recipe, recipeStepsArr, ingredientsArr});
   console.log(recipeStepsArr);
   console.log(ingredientsArr);

})





//Take in recipe name and create a recipe 
router.post('/', isLoggedIn, async function (req, res) {
    let userId = req.user.get().id;
    //Create a Recipe and grab its id
    let recipeId = await addRecipe(userId, req.body.recipeName, req.body.categoryName);
    for(let i=0; i<req.body.ingredientName.length; i++){
        await addIngredients(recipeId, req.body.ingredientName[i], req.body.ingredientQuantity[i], req.body.quantityUnit[i]);
    }

    for(let i=0; i<req.body.instructions.length; i++){
        await addRecipeSteps(recipeId, i+1, req.body.instructions[i]);
    }

    res.redirect(`recipes/${recipeId}`);
});



//Put - Save edited data of an Recipe
router.put('/:id', async function(req,res){
    let recipeID = Number(req.params.id);
    await updateRecipe(recipeID, req.body.recipeName, req.body.categoryName);
    
    await updateIngredients(recipeID, req.body.ingredientName, req.body.ingredientQuantity, req.body.quantityUnit);
    


    res.redirect(`/recipes/${recipeID}`);
})









async function addRecipe(userId, name, category) {
    let newRecipe;
    let user;
    try {
        newRecipe = await Recipe.create({
            recipeName: name
        })
    }
    catch (err) {
        console.log(err);
    }

    //Find the user and add the recipe to the user
    try {
        user = await User.findByPk(userId);
        user.addRecipe(newRecipe);
        user.save();
    }
    catch (err) {
        console.log(err);
    }
    //Find or Create the Recipe Category and add the recipe to it
    try {
        result = await RecipeCategory.findOrCreate({
            where: {
                categoryName: category
            }
        });
        let recipeCategory = result[0];
            recipeCategory.addRecipe(newRecipe);
            recipeCategory.save();
    }
    catch (err) {
        console.log(err);
    }


    return await newRecipe.toJSON().id;
   
    
}

async function addIngredients(recipeId, ingredient, quantity, unit){
    let recipe;
    //Grab the recipe
    try {
        recipe = await Recipe.findByPk(recipeId);
    }
    catch (err) {
        console.log(err);
    }

    try{
        recipe.createIngredientList({
            ingredientName:ingredient,
            ingredientQuantity: quantity, 
            quantityUnit:unit
        })
    }
    catch (err) {
        console.log(err);
    }


}


async function addRecipeSteps(recipeId, stepNum, instructionString){
    let recipe;
    //Grab the recipe
    try {
        recipe = await Recipe.findByPk(recipeId);
    }
    catch (err) {
        console.log(err);
    }

    try{
        recipe.createRecipeStep({
            stepNumber: stepNum,
            instructions: instructionString,
        })
    }
    catch (err) {
        console.log(err);
    }


}


async function updateRecipe(recipeID, name, category){
    let recipeCategoryID;
     //Find or Create the Recipe Category and get the ID.
     try {
        result = await RecipeCategory.findOrCreate({
            where: {
                categoryName: category
            }
        });
        let recipeCategory = result[0];
        recipeCategoryID = recipeCategory.toJSON().id;       
    }
    catch (err) {
        console.log(err);
    }

    try {
        result = await Recipe.update({
            recipeName: name,
            recipeCategoryId: recipeCategoryID
        },
        {
            where: {
                id:recipeID
            }
        }
        ); 
    }
    catch (err) {
        console.log(err);
    }



}

async function updateIngredients(recipeID, ingredientNameArr, quantityArr, unitArr){
    let recipe;
    let ingredientsArr;
    //Grab the recipe
    try {
        recipe = await Recipe.findByPk(recipeID);
    }
    catch (err) {
        console.log(err);
    }

    try {
        ingredientsArr = await recipe.getIngredientLists();

    }
    catch (err) {
        console.log(err);
    }

    for(let i=0; i<ingredientsArr.length; i++){
        let ingredient = ingredientsArr[i];
        let ingredientID = ingredient.toJSON().id;
        try {
            await ingredient.update({
                ingredientName: ingredientNameArr[i],
                ingredientQuantity: quantityArr[i],
                quantityUnit: unitArr[i]
            },{
                where:ingredientID
            })
        }
        catch (err) {
            console.log(err);
        }
    }


}



module.exports = router;