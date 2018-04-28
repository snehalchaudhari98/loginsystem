var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose=require('mongoose');
const bodyParser= require('body-parser');
const expressValidator= require('express-validator');
const flash= require('connect-flash');
const session=require('express-session');
const passport= require('passport');
const config= require('./config/database');



//mongoose.connect('mongodb://localhost/nodekb');
mongoose.connect(config.database);

let db=mongoose.connection;

db.once('open',function () {
    console.log('Connected to mongodb');
});


db.on('error',function (err) {
    console.log(err);
});

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/add');

var app = express();

let Article= require('./models/article');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// bodyparser middleware
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
//


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

app.use(require('connect-flash')());
app.use(function (req, res, next) {
    res.locals.messages = require('express-messages')(req, res);
    next();
});


app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
            , root    = namespace.shift()
            , formParam = root;

        while(namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param : formParam,
            msg   : msg,
            value : value
        };
    }
}));



// passport config
require('./config/passport')(passport);
//passport middleware
app.use(passport.initialize());
app.use(passport.session());


app.get('*', function(req, res, next){
    res.locals.user = req.user || null;
    next();
});



//app.use('/', indexRouter);

app.get('/',function (req,res) {
    Article.find({},function (err,articles) {
        if(err){
            console.log(err);
        }
        else{

            res.render('login', {
                title: 'login'
            });
        }


    });

});

app.get('/allarticle',ensureAuthenticated,function (req,res) {
    Article.find({},function (err,articles) {
        if(err){
            console.log(err);
        }
        else{

            res.render('index', {
                title: 'Articles',
                articles:articles
            });
        }


    });

});


let article= require('./routes/article');
let users= require('./routes/users');
app.use('/article',article);
app.use('/users',users);

app.use('/add', usersRouter);

app.post('/add',ensureAuthenticated,function (req,res) {
    req.checkBody('title','Title is required !!').notEmpty();
    //req.checkBody('author','Author is required !!').notEmpty();
    req.checkBody('body','Body is required !!').notEmpty();

    let errors=req.validationErrors();
    if(errors){
        res.render('add',{
            title:'Add article',
            errors:errors
        });
    }
    else {

        let article= new Article();
        article.title=req.body.title;
        article.author=req.user._id;
        article.body=req.body.body;

        article.save(function (err) {
            if(err)
            {
                console.log(err);
                return;
            }
            else
            {
                req.flash('success','Article Added');
                res.redirect('/allarticle');
            }
        });
    }


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



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
