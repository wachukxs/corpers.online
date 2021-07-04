// const app = require('express')(); // ?
const express = require('express');
const app = express();
// const bodyParser = require('body-parser'); // https://stackoverflow.com/a/24330353/9259701
const cookieParser = require('cookie-parser')
const session = require('express-session');
const morgan = require('morgan');
// const crypto = require('crypto')
// const MySQLStore = require('express-mysql-session')(session);

// initalize sequelize with session store
// let SequelizeStore = require("connect-session-sequelize")(session.Store);

const KnexSessionStore = require('connect-session-knex')(session);

const Knex = require('knex');

// refactor import of routes!!!!
const welcomeRoutes = require('../controllers/welcome');
const actionsRoutes = require('../controllers/actions');
const byeRoutes = require('../controllers/bye');
const blogRoutes = require('../controllers/blog');

const corpMemberRoutes = require('../controllers/corpMembers')
const saleRoutes = require('../controllers/sale')
const accommodationRoutes = require('../controllers/accommodations')
const chatRoutes = require('../controllers/chats')

const testRoutes = require('../controllers/test');

app.set('view engine', 'ejs');

// const connectionPool = require('../not_models/db').connectionPool;
// let mySQLSessionStore = new MySQLStore({}, connectionPool);

const sequelize = require('../not_models/db').sequelize

/* let sequelizeStore = new SequelizeStore({ not using because https://stackoverflow.com/questions/49476080/express-session-not-persistent-after-redirect
    db: sequelize,
    checkExpirationInterval: 7 * 24 * 60 * 60 * 1000, // The interval at which to cleanup expired sessions in milliseconds.
    expiration: 7 * 24 * 60 * 60 * 1000  // The maximum age (in milliseconds) of a valid session.
}).sync(); */


const knex = Knex({
    client: 'pg',
    connection: {
        host: sequelize.config.host,
        user: sequelize.config.username,
        password: sequelize.config.password,
        database: sequelize.config.database,
        ssl: {
            require: true, // This will help you. But you will see new error
            rejectUnauthorized: false // This line will fix new error
        }
    },
});

const knexSessionStore = new KnexSessionStore({
    knex,
    createtable: true,
    tablename: '_Session', // wanna make it _Sessions || Sessions// optional. Defaults to 'sessions' // tip: don't use 'Session' ...it's for connect-sequelize-store
});

let expressSessionOptions = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: knexSessionStore, // mySQLSessionStore, // sequelizeStore,
    cookie: {
        httpOnly: true,
        key: 'you_online',
        // sameSite: 'strict', // https://github.com/expressjs/session/issues/660#issuecomment-514384297
        // domain: 'corpers.online',
        // path: '',
    },
    proxy: true, // if you do SSL outside of node.
}

let morganFormat = 'tiny'
if (app.get('env') === 'production') { // process.env.NODE_ENV
    expressSessionOptions.cookie.secure = true; // hmmm
    morganFormat = ':remote-addr - :remote-user [:date[web]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'
}
// set morgan to log info about our requests for development use.
app.use(morgan(morganFormat))

// app.use(session(mySQLSessionOptions));
// app.use(session(sequelizeSessionOptions));
app.use(session(expressSessionOptions));

// The app.locals object has properties that are local variables within the application.
app.locals.title = 'Corpers Online';

app.locals.email = process.env.THE_EMAIL;

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
app.use(cookieParser(process.env.SESSION_SECRET))

// https://stackoverflow.com/a/55787532/9259701
app.use('/assets', express.static('assets'))
app.use('/graphic', express.static('img'));

app.use([actionsRoutes, byeRoutes, welcomeRoutes, blogRoutes, corpMemberRoutes, saleRoutes, accommodationRoutes, chatRoutes]);

app.use(testRoutes)
// must always be last route, must be last route because of 404 pages/error
app.use(function (req, res) {
    res.render('pages/404', { // check the url they navigated to that got them lost, and try to offer suggestions in the front end that'll match why they got lost... maybe they missed a letter in their statecode url
    });
});

/**
 * open https://using-umami.herokuapp.com/ to see amazing metrics
 * 
 * should we be using res.locals as opposed to req.session?
 */
var helmet = require('helmet');
app.use(helmet());

const ngstates = require('../utilities/ngstates');
const sitemap = require('express-sitemap')({ // comes last, after setting up express
    http: 'https',
    url: 'corpers.online',
    sitemapSubmission: '/sitemap.xml',
    hideByRegex: [ ngstates.states_short_paths_regex, /\/^AB$/, '/about' ],
    route: {
        '/[A-Z]{2}$/': {
            hide: true
        },
        '/[A-Z]{2}$/': {
            hide: true
        },
        r1: {
            hide: true
        },
        '/about': {
            hide: true
        }
    }
});
sitemap.generate4(welcomeRoutes)
sitemap.generate4(actionsRoutes)
sitemap.generate4(blogRoutes)
// sitemap.toFile() // uncomment till we figure out sitemap or use a diffrent library

module.exports = app; // app.get('env')

/**
 * running on heroku at
 * Creating app... done, ⬢ corpers-online
 * https://corpers-online.herokuapp.com/ | https://git.heroku.com/corpers-online.git
 */