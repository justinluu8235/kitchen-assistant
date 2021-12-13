const express = require('express');
const router = express.Router();
const isLoggedIn = require('../middleware/isLoggedIn');
const { Menu, Recipe, UserFriend, User, IngredientList, RecipeStep } = require('../models');


//Path for Viewing all of User's friend 
router.get('/',  isLoggedIn, async function (req, res) {
    //Get and show all your friends 
    let userId = req.user.get().id;
    console.log(userId);
    let user;
    //Find the user 
    try {
        user = await User.findByPk(userId);
    }
    catch (err) {
        console.log(err);
    }
    // Use the user to find its friends 
    try {
        let allFriends = await user.getUserFriends();
        //See all your friends, with a button to view all their recipes. View recipes route them to get 'recipes/user:id' 
        //Button to search friends bringing you to '/search'
        console.log(allFriends);
        res.render('userFriends/index' , {allFriends});
    }
    catch (err) {
        console.log(err);
    }
    

});

//Search friends by email. If friend is already associated, note that. If not, show button to add
router.get('/search',  isLoggedIn, async function (req, res) {
    res.render('userFriends/search');
});


//Get and display all the recipes for a different user
//The EJS page will display all the recipes 
router.get('/user/:id', isLoggedIn, async function (req, res) {
    let userId = req.params.id
    let user;
    let userEmail;
    //Find the user and add the recipe to the user
    try {
        user = await User.findByPk(userId);
        userEmail = user.toJSON().email
    }
    catch (err) {
        console.log(err);
    }


    try {
        let allRecipes = await user.getRecipes();
        res.render('userFriends/showRecipes', { userEmail, allRecipes });
    }
    catch (err) {
        console.log(err);
    }
});

//View an individual recipe from a user's friend
router.get('/user/recipe/:id', isLoggedIn, async function (req, res) {
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
        recipeStepsArr = await recipe.getRecipeSteps({

            order: ['stepNumber'],
        });

    }
    catch (err) {
        console.log(err);
    }

    res.render('userFriends/show', { recipe, recipeStepsArr, ingredientsArr });

    
});

//Check whether the email is another user, and whether he is a friend
router.post('/',  isLoggedIn, async function (req, res) {
    let myId = req.user.get().id;
    let query = req.body.query;
    let userSearched;
    let userSearchedId;
    let userExists = false;
    let userAdded = false;

    //Find if that user exists - update userExists variable whether found or not
    try{
        userSearched = await User.findOne({
            where:{
                email: query
            }
        })
        if(userSearched != null){
            userExists = true;
            userSearchedId = userSearched.toJSON().id;
        }
    }
    catch(err){
        console.log(err);
    }

    //If that user exists, check whether the user is added
    if(userExists){
        try{
            let userFriend = await UserFriend.findOne({
                where:{
                    friendId: userSearchedId,
                    userId: myId
                }
            })
            console.log(userFriend);
            if(userFriend != null){
                userAdded = true;
            }
        }
        catch(err){
            console.log(err);
        }
    }

    res.render('userFriends/search-1', {query, userSearchedId, userExists, userAdded});

});


//Add someone as friend
router.post('/add/:id',  isLoggedIn, async function (req, res) {
    let userId = req.params.id;
    let myId = req.user.get().id;
    let user;
    try{
        user = await User.findByPk(userId)
        let userEmail = user.toJSON().email;
        UserFriend.create({
            friendEmail:userEmail,
            friendId: userId,
            userId: myId
        })
        res.redirect('/userFriends');
    }
    catch(err){
        console.log(err);
    }
});


//Make a copy as this user of the recipe 
router.post('/save/:id',  isLoggedIn, async function (req, res) {
    let recipeID = req.params.id;
    let myId = req.user.get().id;
    
    try{
        let recipe = await Recipe.findByPk(recipeID);
        let ingredients = recipe.getIngredientLists();
        let recipeSteps = recipe.getRecipeSteps();
        recipe = recipe.toJSON();
        let newRecipe = await Recipe.create({
            recipeName: recipe.recipeName,
            numSteps: recipe.numSteps,
            recipeCategoryId: recipe.recipeCategoryId,
            userId: myId,
            imageURL: recipe.imageURL
        })

        for(let i=0; i<ingredients.length; i++){
            let ingredient = ingredients[i].toJSON();
            await newRecipe.createIngredientList({
                ingredientName:ingredient.ingredientName, 
                ingredientQuantity: ingredient.ingredientQuantity, 
                quantityUnit: ingredient.quantityUnit, 
            })
        }
        for(let i=0; i<recipeSteps.length; i++){
            let recipeStep = ingredients[i].toJSON();
            await newRecipe.createRecipeStep({
                stepNumber: recipeStep.stepNumber, 
                instructions: recipeStep.instructions, 
                imageURL: recipeStep.imageURL

            })
        }

    }
    catch(err){
        console.log(err)
    }
});

//Create a menu request to that friend. 
router.post('/:id',isLoggedIn, async function (req, res) {
    let myId = req.user.get().id;
    let dateRequested = req.body.dateSelected;

    try{
        let recipe = await Recipe.findByPk(req.params.id);
        let userID = recipe.toJSON().userId;
        await Menu.create({
            dateToMake: dateRequested,
            recipeId: req.params.id,
            imageURL: req.body.imageURL,
            userId: userID,
            requestUserId: myId
        })
        
    }
    catch(err){
        console.log(err);
    }
});



router.delete('/:id',  isLoggedIn, async function (req, res) {
    try{
        UserFriend.destroy({
            where:{
                id:req.params.id
            }
        })
        res.redirect('/userFriends');
    }
    catch(err){
        console.log(err)
    }
});



module.exports = router;