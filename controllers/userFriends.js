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
        res.render('userFriends/index' , {allFriends});
    }
    catch (err) {
        console.log(err);
    }
    

});

//Search friends by email. If friend is already associated, note that. If not, show button to add
router.get('/',  isLoggedIn, async function (req, res) {

});









module.exports = router;