const express = require('express');
const router = express.Router();
const isLoggedIn = require('../middleware/isLoggedIn');
const { UserFriend, User } = require('../models');


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
    //Find the user and add the recipe to the user
    try {
        user = await User.findByPk(userId);
    }
    catch (err) {
        console.log(err);
    }


    try {
        let allRecipes = await user.getRecipes();
        res.render('userFriends/showRecipes', { allRecipes });
    }
    catch (err) {
        console.log(err);
    }
});



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