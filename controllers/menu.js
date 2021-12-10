const express = require('express');
const router = express.Router();

router.get('/',  async function (req, res) {
    let dateObj = new Date();
 let date = dateObj.getUTCDate();
    console.log(date);
});


module.exports = router;