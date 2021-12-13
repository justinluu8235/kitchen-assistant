require('dotenv').config();
const express = require('express');
const layouts = require('express-ejs-layouts');
const app = express();
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('./config/ppConfig');
const isLoggedIn = require('./middleware/isLoggedIn');

const SECRET_SESSION = process.env.SECRET_SESSION;
//console.log(SECRET_SESSION);

app.set('view engine', 'ejs');

app.use(require('morgan')('dev'));    //morgan is for testing
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(layouts);
app.use(methodOverride('_method'));
app.use(session({
  secret: SECRET_SESSION,    // What we actually will be giving the user on our site as a session cookie
  resave: false,             // Save the session even if it's modified, make this false
  saveUninitialized: true    // If we have a new session, we save it, therefore making that true
}));

app.use(flash());    // It's a message telling user whether they are logged in or not 

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  console.log(res.locals);
  res.locals.alerts = req.flash();
  res.locals.currentUser = req.user;
  next();
});

//import controllers
app.use('/recipes', require('./controllers/recipes'));
app.use('/menu', require('./controllers/menu'));
app.use('/shoppingList', require('./controllers/shoppingList'));
app.use('/pantry', require('./controllers/pantry'));
app.use('/searchRecipes', require('./controllers/searchRecipes'));
app.use('/userFriends', require('./controllers/userFriends'));













app.get('/', isLoggedIn, (req, res) => {
  res.render('index');
})

app.get('/home', (req, res) => {
  res.render('home');
})


// Add this above /auth controllers
app.get('/profile', isLoggedIn, (req, res) => {
  const { id, name, email } = req.user.get(); 
  res.render('profile', { id, name, email });
});

// controllers
app.use('/auth', require('./controllers/auth'));




const PORT = process.env.PORT || 8000;



const server = app.listen(PORT, () => {
  console.log(`🎧 You're listening to the smooth sounds of port ${PORT} 🎧`);
});

module.exports = server;
