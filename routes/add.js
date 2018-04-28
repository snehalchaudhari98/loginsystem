var express = require('express');
var router = express.Router();

function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    else {
        req.flash('danger','Please login');
        res.redirect('/users/login');
    }
}
/* GET users listing. */
router.get('/',function(req, res, next) {
    res.render('add', {
        title: 'add article',
    });
});



module.exports = router;
