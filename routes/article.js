var express = require('express');
var router = express.Router();


let Article= require('../models/article');
let User= require('../models/user');

router.get('/:id',function (req,res) {
    Article.findById(req.params.id,function (err,article) {
        User.findById(article.author,function (err,user) {
            res.render('article', {
                article:article,
                author:user.name
            });
        });

    });
});



router.get('/edit/:id', ensureAuthenticated,function (req,res) {
    Article.findById(req.params.id,function (err,article) {
        if(article.author != req.user._id){             // should be !=
            req.flash('danger','Not Autherised !!');
            res.redirect('/allarticle');
        }
        res.render('edit_article', {
            title:'Edit article',
            article:article
        });
    });
});




router.post('/edit/:id',function (req,res) {
    let article={};
    article.title=req.body.title;
    article.author=req.body.author;
    article.body=req.body.body;

    let query={_id:req.params.id}

    Article.update(query,article,function (err) {
        if(err)
        {
            console.log(err);
            return;
        }
        else
        {
            req.flash('success','Article Updated');
            res.redirect('/allarticle');
        }
    });
});

router.delete('/:id',function (req,res) {


    if(!req.user._id){
        res.status(500).send();
    }
    let query={_id:req.params.id};
    Article.findById(req.params._id,function (err,article) {
       if(article.author !=req.user._id){
           res.status(500).send();
       }else{

           Article.remove(query,function (err) {
               if(err)
               {
                   console.log(err);
               }
               res.send('SUCCESS');
           });
       }

    });



});

function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    else {
        req.flash('danger','Please login');
        res.redirect('/users/login');
    }
}

module.exports = router;
