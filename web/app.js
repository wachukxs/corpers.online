// const app = require('express')(); // ?
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const morgan = require('morgan');

const welcomeRoutes = require('../routes/welcome');
const actionsRoutes = require('../routes/actions');
const byeRoutes = require('../routes/bye');
const blogRoutes = require('../routes/blog');

app.set('view engine', 'ejs');

// express-session deprecated req.secret; provide secret option server.js:449:9
app.use(session({
    secret: process.env.SESSION_SECRET || 'sth%shh@shhhs"shhh==|skf$kinda,£right?',
    resave: false,
    saveUninitialized: true
}));

// set morgan to log info about our requests for development use.
app.use(morgan('dev'));

// The app.locals object has properties that are local variables within the application.
app.locals.title = 'Corpers Online';
// => 'My App'

app.locals.email = process.env.THE_EMAIL;
// => 'me@myapp.com'

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// https://stackoverflow.com/a/55787532/9259701
app.use('/assets', express.static('assets'))
app.use('/graphic', express.static('img'));

app.use(actionsRoutes);
app.use(byeRoutes);
app.use(welcomeRoutes);
app.use(blogRoutes);
// must always be last route, must be last route because of 404 pages/error
app.use(function (req, res, next) {
    res.render('pages/404', { // check the url they navigated to that got them lost, and try to offer suggestions in the front end that'll match why they got lost... maybe they missed a letter in their statecode url
    });
});

/**
 * If you’re writing a web application,
 * there are a lot of common best practices
 * that you should follow to secure your application:
 * (1)XSS Protection
 * (2)Prevent Clickingjacking using X-Frame-Options
 * (3)Enforcing all connections to be HTTPS
 * (4)Setting a Context-Security-Policy header
 * 
 * Disabling the X-Powered-By header
 * so attackers can’t narrow down their attacks to specific software
 * 
 * Instead of remembering to configure all these headers,
 * Helmet will set them all to sensible defaults for you,
 * and allow you to tweak the ones that you need.
 * 
 * It’s incredibly simple to set up on an Express.js application:
 */
var helmet = require('helmet');
app.use(helmet());

module.exports = app;

/**
 * running on heroku at
 * Creating app... done, ⬢ powerful-castle-11756
 * https://powerful-castle-11756.herokuapp.com/ | https://git.heroku.com/powerful-castle-11756.git
 */