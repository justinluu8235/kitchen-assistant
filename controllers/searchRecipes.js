const express = require('express');
const router = express.Router();
const axios = require('axios');




const API_KEY = "2901de0d76fa46d1a71c015c429873f6";
router.get('/', function (req, res) {
    
    const id = 716342;

    axios.get(`https://api.spoonacular.com/recipes/${id}/analyzedInstructions?apiKey=${API_KEY}`)
        .then(function (response) {
            console.log(response.data[0].steps);

            //res.render('searchRecipes/index',{data})
        })
        .catch(function (err) {
            console.log(err);
        });

  
});





module.exports = router;