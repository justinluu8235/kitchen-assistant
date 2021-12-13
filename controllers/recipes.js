const express = require('express');
const { RowDescriptionMessage } = require('pg-protocol/dist/messages');
const router = express.Router();
const isLoggedIn = require('../middleware/isLoggedIn');
const { Recipe, Menu,  User, RecipeCategory, IngredientList, RecipeStep, ShoppingList, PantryStockList } = require('../models');
const user = require('../models/user');


//Finds the user currently loggedin and gets their recipes
router.get('/', isLoggedIn, async function (req, res) {
    let userId = req.user.get().id;
    let user;
    //Find the user and add the recipe to the user
    try {
        user = await User.findByPk(userId);
    }
    catch (err) {
        console.log(err);
    }

    try {
        let allRecipes = await user.getRecipes();
        res.render('recipes/index', { allRecipes });
    }
    catch (err) {

    }
});


//Create a new recipe page
router.get('/new', isLoggedIn, function (req, res) {
    res.render('recipes/new');
});


//Get Route - Edit an individual recipe. Get that recipe's info
router.get('/edit/:id', async function (req, res) {
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
        recipeStepsArr = await recipe.getRecipeSteps({

            order: ['stepNumber'],
        });

    }
    catch (err) {
        console.log(err);
    }

    res.render('recipes/edit', { recipe, recipeCategory, recipeStepsArr, ingredientsArr })
})


//View an individual recipe
router.get('/:id', async function (req, res) {
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

    res.render('recipes/show', { recipe, recipeStepsArr, ingredientsArr });


})





//Take in recipe name, ingredients, instructions and create a recipe 
router.post('/', isLoggedIn, async function (req, res) {
    let userId = req.user.get().id;

    //Create a Recipe and grab its id
    let recipeId = await addRecipe(userId, req.body.recipeName, req.body.categoryName);
    for (let i = 0; i < req.body.ingredientName.length; i++) {
        await addIngredients(recipeId, req.body.ingredientName[i], req.body.ingredientQuantity[i], req.body.quantityUnit[i]);
    }

    for (let i = 0; i < req.body.instructions.length; i++) {
        await addRecipeSteps(recipeId, i + 1, req.body.instructions[i]);
    }

    res.redirect(`recipes/${recipeId}`);
});


//Generate shopping list with the recipe's ingredients
router.post('/:id', isLoggedIn, async function (req, res) {
    let myId = req.user.get().id;
    let recipe;
    let ingredientList;
    let recipeID = Number(req.params.id);
    //Grab the recipe
    try {
     
        recipe = await Recipe.findByPk(recipeID);
        ingredientList = await recipe.getIngredientLists();
        let pantryItemsArr = await PantryStockList.findAll({
            where: {
                userId:myId
            }
        });
        //Gather pantry items
        let items = [];
        for (let i = 0; i < pantryItemsArr.length; i++) {
            let pantryItem = pantryItemsArr[i];
            items.push(pantryItem.toJSON().itemName);
        }
        console.log(ingredientList);
        for (let i = 0; i < ingredientList.length; i++) {
            let ingredient = ingredientList[i].toJSON();
            //Create shopping list item only if not in pantry
            if (!items.includes(ingredient.ingredientName)) {
                // await ShoppingList.create({
                //     shoppingListItem: ingredient.ingredientName,
                //     ingredientQuantity: ingredient.ingredientQuantity,
                //     quantityUnit: ingredient.quantityUnit
                // })

                let results = await ShoppingList.findOrCreate({
                    where:{
                        shoppingListItem: ingredient.ingredientName, 
                        quantityUnit: ingredient.quantityUnit,
                        userId:myId
                    },
                    defaults:{
                        ingredientQuantity: ingredient.ingredientQuantity,
                    }
                })
                console.log(results);
                if(!results[1]){
                    let existingShoppingListItem = results[0];
                    existingShoppingListItem = existingShoppingListItem.toJSON();
                    let newQuantity = Number(existingShoppingListItem.ingredientQuantity) + Number(ingredient.ingredientQuantity);
                    let existingId = existingShoppingListItem.id;
                    await ShoppingList.update({
                        ingredientQuantity: newQuantity,
                    },
                    {
                        where: {
                            id:existingId,
                            userId:myId
                        }
                    })
                }




            }
        }
        res.redirect('/recipes')
    }
    catch (err) {
        console.log(err);
    }

});

//Put - Save edited data of an Recipe
router.put('/:id', async function (req, res) {
    let recipeID = Number(req.params.id);
    await updateRecipe(recipeID, req.body.recipeName, req.body.categoryName);

    await updateIngredients(recipeID, req.body.ingredientName, req.body.ingredientQuantity, req.body.quantityUnit);

    await updateRecipeSteps(recipeID, req.body.instructions);

    res.redirect(`/recipes/${recipeID}`);
})




router.delete('/:id', isLoggedIn, async function (req, res) {
    Recipe.destroy({
        where: {
            id: Number(req.params.id)
        }
    })
        .then(function (rowsDeleted) {

            res.redirect('/recipes');
        })
        .catch(function (err) {
            console.log('Error', err);
            res.render('404', { message: 'Abum was not deleted. Please try again' })
        })
        
        Menu.destroy({
            where: {
                recipeId: Number(req.params.id)
            }
        })
            .then(function (rowsDeleted) {
    
                res.redirect('/recipes');
            })
            .catch(function (err) {
                console.log('Error', err);
                res.render('404', { message: 'Abum was not deleted. Please try again' })
            })

});





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
        recipe.createIngredientList({
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


async function updateRecipe(recipeID, name, category) {
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
                    id: recipeID
                }
            }
        );
    }
    catch (err) {
        console.log(err);
    }



}

async function updateIngredients(recipeID, ingredientNameArr, quantityArr, unitArr) {
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


    //If the amount of edited ingredients is less than what it started with 
    if (ingredientsArr.length > ingredientNameArr.length) {
        //Update what's there
        for (let i = 0; i < ingredientNameArr.length; i++) {
            let ingredient = ingredientsArr[i];
            let ingredientID = ingredient.toJSON().id;
            try {
                await ingredient.update({
                    ingredientName: ingredientNameArr[i],
                    ingredientQuantity: quantityArr[i],
                    quantityUnit: unitArr[i]
                }, {
                    where: ingredientID
                })
            }
            catch (err) {
                console.log(err);
            }
        }
        //Delete the extra ones on the database
        for (let i = ingredientNameArr.length; i < ingredientsArr.length; i++) {
            let ingredient = ingredientsArr[i];
            let ingredientID = ingredient.toJSON().id;
            try {
                await IngredientList.destroy({
                    where: {
                        id: ingredientID
                    }
                })
            }
            catch (err) {
                console.log(err);
            }
        }


    }
    //If amount of ingredients is more than what we started with
    else if (ingredientNameArr.length > ingredientsArr.length) {
        //Update what's in the database
        for (let i = 0; i < ingredientsArr.length; i++) {
            let ingredient = ingredientsArr[i];
            let ingredientID = ingredient.toJSON().id;
            try {
                await ingredient.update({
                    ingredientName: ingredientNameArr[i],
                    ingredientQuantity: quantityArr[i],
                    quantityUnit: unitArr[i]
                }, {
                    where: ingredientID
                })
            }
            catch (err) {
                console.log(err);
            }
        }

        //Anything extra, create a new one 
        for (let i = ingredientsArr.length; i < ingredientNameArr.length; i++) {
            try {
                await addIngredients(recipeID, ingredientNameArr[i], quantityArr[i], unitArr[i]);
            }
            catch (err) {
                console.log(err)
            }
        }
    }
    else {
        for (let i = 0; i < ingredientsArr.length; i++) {
            let ingredient = ingredientsArr[i];
            let ingredientID = ingredient.toJSON().id;
            try {
                await ingredient.update({
                    ingredientName: ingredientNameArr[i],
                    ingredientQuantity: quantityArr[i],
                    quantityUnit: unitArr[i]
                }, {
                    where: ingredientID
                })
            }
            catch (err) {
                console.log(err);
            }
        }
    }

}

async function updateRecipeSteps(recipeID, instructionsArr) {
    let recipe;
    let recipeStepArr;
    //Grab the recipe
    try {
        recipe = await Recipe.findByPk(recipeID);
    }
    catch (err) {
        console.log(err);
    }

    try {
        recipeStepArr = await recipe.getRecipeSteps({

            order: ['stepNumber'],
        });

    }
    catch (err) {
        console.log(err);
    }

    //if amount of instructions is less than before editing
    if (instructionsArr.length < recipeStepArr.length) {
        //Update what's there
        for (let i = 0; i < instructionsArr.length; i++) {
            let instruction = recipeStepArr[i];
            let instructionID = instruction.toJSON().id;
            try {
                await instruction.update({
                    stepNumber: i + 1,
                    instructions: instructionsArr[i]
                }, {
                    where: instructionID
                })
            }
            catch (err) {
                console.log(err);
            }
        }
        //Destroy the extra in the database
        for (let i = instructionsArr.length; i < recipeStepArr.length; i++) {
            let instruction = recipeStepArr[i];
            console.log(instruction.toJSON());
            let instructionID = instruction.toJSON().id;
            try {
                await RecipeStep.destroy({
                    where: {
                        id: instructionID
                    }
                })
            }
            catch (err) {
                console.log(err);
            }
        }
    }
    //Amount of instruction is more than in our db
    else if (instructionsArr.length > recipeStepArr.length) {
        //Update what's there
        for (let i = 0; i < recipeStepArr.length; i++) {
            let instruction = recipeStepArr[i];
            let instructionID = instruction.toJSON().id;
            try {
                await instruction.update({
                    stepNumber: i + 1,
                    instructions: instructionsArr[i]
                }, {
                    where: instructionID
                })
            }
            catch (err) {
                console.log(err);
            }
        }

        //Create the rest
        for (let i = recipeStepArr.length; i < instructionsArr.length; i++) {

            try {
                await addRecipeSteps(recipeID, i + 1, instructionsArr[i]);
            }
            catch (err) {
                console.log(err);
            }
        }
    }
    else {
        for (let i = 0; i < instructionsArr.length; i++) {
            let instruction = recipeStepArr[i];
            let instructionID = instruction.toJSON().id;
            try {
                await instruction.update({
                    stepNumber: i + 1,
                    instructions: instructionsArr[i]
                }, {
                    where: instructionID
                })
            }
            catch (err) {
                console.log(err);
            }
        }
    }


}

module.exports = router;