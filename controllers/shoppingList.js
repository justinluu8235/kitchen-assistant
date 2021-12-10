const express = require('express');
const { RowDescriptionMessage } = require('pg-protocol/dist/messages');
const router = express.Router();
const isLoggedIn = require('../middleware/isLoggedIn');
const { ShoppingList } = require('../models');


router.get('/', isLoggedIn, async function (req, res) {
    let list;
    try{
        list = await ShoppingList.findAll();
    
    }
    catch(error){
        console.log(error);
    }


    res.render('shoppingList/index', {list});
});


router.post('/', isLoggedIn, async function (req, res) {
    let listItem;
    try{
        listItem = await ShoppingList.create({
            shoppingListItem: req.body.shoppingListItem,
            ingredientQuantity: req.body.ingredientQuantity,
            quantityUnit: req.body.quantityUnit
        })

    }
    catch(error){
        console.log(error);
    }

    res.redirect('/shoppingList');
});


router.delete('/:id', isLoggedIn, async function (req, res) {
    ShoppingList.destroy({
        where: {
            id:Number(req.params.id)
        }
    })
    .then(function (rowsDeleted) {

        res.redirect('/shoppingList');
    })
    .catch(function (error) {
        console.log('Error', err);
        res.render('404', { message: 'Abum was not deleted. Please try again' })
    })

});


module.exports = router;