const express = require('express');
const { RowDescriptionMessage } = require('pg-protocol/dist/messages');
const router = express.Router();
const isLoggedIn = require('../middleware/isLoggedIn');
const { PantryStockList, PantryCategory, ShoppingList } = require('../models');


//View pantry items - have the option to add, delete, add note out of stock on this page
router.get('/', isLoggedIn, function (req, res) {

    PantryStockList.findAll()
    .then(function(listList){
        res.render('pantry/index', {listList});
    })
    .catch(function(err){
        console.log(err);
    });

    
});


//Adding a pantry item
router.post('/', async function (req, res) {
    console.log('hi');

    try{

        result = await PantryCategory.findOrCreate({
            where: {
                categoryName: req.body.categoryName
            }
        });
        let pantryCategory = result[0];
        
        await pantryCategory.createPantryStockList({
            itemName: req.body.itemName,
            inStock: 1
        })

       
    }
    catch(error){
        console.log(error);
    }

    res.redirect('/pantry');
});


//Updating whether a pantry item is in stock or not. If out, add to shopping list. 
router.put('/:id', async function (req, res) {
    let pantryItem;
        try{
            pantryItem = await PantryStockList.findByPk(req.params.id);
            if(pantryItem.toJSON().inStock){
                console.log(pantryItem.toJSON().inStock)
                PantryStockList.update({
                    inStock: 0
                },
                {
                    where: {
                        id: req.params.id
                    }
                })

                ShoppingList.create({
                    shoppingListItem: pantryItem.toJSON().itemName,
                    ingredientQuantity: "a lot",
                    quantityUnit: "for the pantry"
                })
            }
            else{
                PantryStockList.update({
                    inStock: 1
                },
                {
                    where: {
                        id: req.params.id
                    }
                })
            }
            
        }
        catch(error){
            console.log(error);
        }
        res.redirect('/pantry');
});


router.delete('/:id', isLoggedIn, async function (req, res) {
    PantryStockList.destroy({
        where: {
            id:Number(req.params.id)
        }
    })
    .then(function (rowsDeleted) {

        res.redirect('/pantry');
    })
    .catch(function (error) {
        console.log('Error', err);
        res.render('404', { message: 'Abum was not deleted. Please try again' })
    })

});

module.exports = router;