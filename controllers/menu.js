const express = require('express');
const router = express.Router();
const { Menu, Recipe } = require('../models');

//Sorts the data on the menu by date
//Display whats on the menu by date. 
//Have the option to add ingredients to shopping list or view recipe
router.get('/',  async function (req, res) {
    let menu = {};
    
    try{
        let menuList = await Menu.findAll();
        console.log(menuList);
        for(let i=0; i<menuList.length; i++){
            let menuItem = menuList[i].toJSON();
            let dateToMake = menuItem.dateToMake;
            let recipeId = menuItem.recipeId; 
            let recipe = await Recipe.findByPk(recipeId);
            recipe = recipe.toJSON();
            recipe.menuId = menuItem.id;
            if(menu[dateToMake] == undefined){
                menu[dateToMake]  = [recipe]
            }
            else{
                menu[dateToMake].push(recipe);
            }
        }
        console.log(menu);
        res.render('menu/index', {menu});
    }
    catch(err){
        console.log(err);
    }
    
});

//Creates a menu item when added from the recipes list
router.post('/:id',  async function (req, res) {
    let dateRequested = req.body.dateSelected;
    try{
        await Menu.create({
            dateToMake: dateRequested,
            recipeId: req.params.id,
            imageURL: req.body.imageURL
        })
        
    }
    catch(err){
        console.log(err);
    }
});

//Deletes a menu item from the menu list
router.delete('/:id', async function (req, res) {

    try{
        await Menu.destroy({
            where: {
                id:Number(req.params.id)
            }
        })
        res.redirect('/menu')
        
    }
    catch(err){
        console.log(err);
    }

});


module.exports = router;