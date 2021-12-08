const express = require('express');
const { RowDescriptionMessage } = require('pg-protocol/dist/messages');
const router = express.Router();
const isLoggedIn = require('../middleware/isLoggedIn');
const { Recipe, User, RecipeCategory } = require('../models')


router.get('/', isLoggedIn, function (req, res) {
    res.render('recipes/new');


});




router.post('/', isLoggedIn, async function (req, res) {
    let userId = req.user.get().id;

    let recipeCat;
    try {
        recipeCat = await RecipeCategory.findOrCreate({
            where: {
                categoryName: req.body.categoryName
            }
        });
    }
    catch (err) {
        console.log(err);
    }

    Recipe.create({
        recipeName: req.body.recipeName
    })
        .then(function (newRecipe) {
            User.findByPk(userId)
                .then(function (user) {
                    user.addRecipe(newRecipe);
                    user.save();
                    // recipeId = newRecipe.toJSON().id;
                    // console.log(recipeId);
                    recipeCat.addRecipe(newRecipe);
                    recipeCat.save();
                })
                .catch(function (err) {
                    console.log(err);
                })
        })
        .catch(function (err) {
            console.log(err);
        })


});




module.exports = router;