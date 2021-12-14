const express = require('express');
const router = express.Router();
const axios = require('axios');
const { response } = require('express');
const isLoggedIn = require('../middleware/isLoggedIn');
const { Recipe, User, RecipeCategory, IngredientList, RecipeStep } = require('../models');


const API_KEY = "2901de0d76fa46d1a71c015c429873f6";


// Start at this for first search
router.get('/', isLoggedIn, async function (req, res) {

    res.render('searchRecipes/index-1')
});


//View an individual recipe from the API
router.get('/view/:id', async function (req, res) {
    let apiRecipeId = req.params.id;
    let recipeName;
    let image;
    let ingredientsObj = {};
    ingredientsObj.ingredientNameArr = [];
    ingredientsObj.ingredientQuantityArr = [];
    ingredientsObj.quantityUnitArr = [];
    let instructionsObj = {};
    instructionsObj.stepNumberArr = [];
    instructionsObj.instructionsArr = [];
    //Grab ingredients list and organize into ingredientsObj
    try{
        let response = await axios.get(`https://api.spoonacular.com/recipes/${apiRecipeId}/information?apiKey=${API_KEY}&includeNutrition=false`)
        response = response.data;
        recipeName = response.title;
        image = response.image;
        for(let i=0; i<response.extendedIngredients.length; i++){
            let ingredient = response.extendedIngredients[i];
            ingredientsObj.ingredientNameArr.push(ingredient.name);
            ingredientsObj.ingredientQuantityArr.push(ingredient.amount);
            ingredientsObj.quantityUnitArr.push(ingredient.unit);
        }
    }
    catch (err) {
        console.log(err);
    }


    //Get the recipe instructions 
    try{
        let response = await axios.get(`https://api.spoonacular.com/recipes/${apiRecipeId}/analyzedInstructions?apiKey=${API_KEY}`)
        response = response.data[0].steps; //array
        for(let i=0; i<response.length; i++){
            let instruction = response[i];
            instructionsObj.stepNumberArr.push(instruction.number);
            instructionsObj.instructionsArr.push(instruction.step);
        }
        
    }
    catch (err) {
        console.log(err);
    }

    res.render('searchRecipes/show', {image, recipeName, instructionsObj, ingredientsObj})

});


//page to search recipes. Displays previous queried recipes
router.get('/:query', isLoggedIn, async function (req, res) {
    let query = req.params.query;
    let response;
    let queryResultsQuantity = 20;
    let recipeTitleArr;
    let idArr;
    let imageURLArr;
    try{
        response = await axios.get(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey=${API_KEY}&number=${queryResultsQuantity}`)
        response = response.data.results; //array
        recipeTitleArr = new Array(response.length);
        idArr = new Array(response.length);
        imageURLArr = new Array(response.length);
        for(let i=0; i<response.length; i++){
            recipeTitleArr[i] = response[i].title;
            idArr[i] = response[i].id;
            imageURLArr[i] = response[i].image;
        }
    }
    catch (err) {
        console.log(err);
    }

    res.render('searchRecipes/index', {recipeTitleArr, imageURLArr, idArr})

});



//Takes in search and Redirect to a view all results route
router.post('/', async function (req, res) {
    let query = req.body.query;
    res.redirect(`/searchRecipes/${query}`);
});




//Get recipe information and create a recipe in the database 
router.post('/getRecipe', isLoggedIn, async function (req, res) {
    let userId = req.user.get().id;
    let recipeName = req.body.recipeName;
    let imageURL = req.body.imageURL;

    //ingredients
    let ingredientNameArr = req.body.ingredientName;
    let ingredientQuantityArr =  req.body.ingredientQuantity;
    let quantityUnitArr = req.body.quantityUnit;

    //instructions 
    let instructionsArr = req.body.instructions;
    let stepNumberArr = req.body.stepNumber;

    //Create a Recipe and grab its id
    let recipeId = await addRecipe(imageURL, userId, recipeName, "New Recipe");
    for (let i = 0; i < ingredientNameArr.length; i++) {
        try{
        await addIngredients(recipeId, ingredientNameArr[i], ingredientQuantityArr[i], quantityUnitArr[i]);
        }
        catch(err){
            console.log(err);
        }
    }

    for (let i = 0; i < instructionsArr.length; i++) {
        try{
        await addRecipeSteps(recipeId, stepNumberArr[i], instructionsArr[i]);
        }
        catch(err){
            console.log(err);
        }
    }

    res.redirect(`/recipes/${recipeId}`);

});


router.put('/searchRecipes/edit', function (req, res) {

});

async function addRecipe(image, userId, name, category) {
    let newRecipe;
    let user;

    // try {
    //     newRecipe = await Recipe.create({
    //         recipeName: name,
    //         imageURL: image
    //     })
    // }
    // catch (err) {
    //     console.log(err);
    // }

    //Find the user and add the recipe to the user
    try {
        user = await User.findByPk(userId);
        let newRecipe = await user.createRecipe({
            recipeName: name,
            imageURL: image,
            recipeCategoryId: 1
        })
    }
    catch (err) {
        console.log(err);
    }

    console.log("==========", newRecipe);
    //Find or Create the Recipe Category and add the recipe to it
    // try {
    //     result = await RecipeCategory.findOrCreate({
    //         where: {
    //             categoryName: category
    //         }
    //     });
    //     let recipeCategory = result[0];
    //     await recipeCategory.addRecipe(newRecipe);
    //     recipeCategory.save();
    // }
    // catch (err) {
    //     console.log(err);
    // }


    return await newRecipe.toJSON().id;


}

async function addIngredients(recipeId, ingredient, quantity, unit) {
    let recipe;
    //Grab the recipe
    try {
        recipe = await Recipe.findByPk(recipeId);
    }
    catch (err) {
        console.log(err);
    }

    try {
        await recipe.createIngredientList({
            ingredientName: ingredient,
            ingredientQuantity: quantity,
            quantityUnit: unit
        })
    }
    catch (err) {
        console.log(err);
    }


}


async function addRecipeSteps(recipeId, stepNum, instructionString) {
    let recipe;
    //Grab the recipe
    try {
        recipe = await Recipe.findByPk(recipeId);
    }
    catch (err) {
        console.log(err);
    }

    try {
        recipe.createRecipeStep({
            stepNumber: stepNum,
            instructions: instructionString,
        })
    }
    catch (err) {
        console.log(err);
    }


}


module.exports = router;