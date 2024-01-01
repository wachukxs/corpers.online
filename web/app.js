// const app = require('express')(); // ?
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const morgan = require("morgan");
const db = require("../models");
// const crypto = require('crypto')
// const MySQLStore = require('express-mysql-session')(session);

// initialize sequelize with session store
// let SequelizeStore = require("connect-session-sequelize")(session.Store);

const swaggerUi = require("swagger-ui-express");

// might switch from using knex to SequelizeStore
const KnexSessionStore = require("connect-session-knex")(session);

const Knex = require("knex");

// refactor import of routes!!!!
const welcomeRoutes = require("../controllers/welcome");
const actionsRoutes = require("../controllers/actions");
const byeRoutes = require("../controllers/bye");
const blogRoutes = require("../controllers/blog");

const corpMemberRoutes = require("../controllers/corpMembers");
const saleRoutes = require("../controllers/sale");
const accommodationRoutes = require("../controllers/accommodations");
const chatRoutes = require("../controllers/chats");

const testRoutes = require("../controllers/test");

const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.js")[env];

/* let sequelizeStore = new SequelizeStore({ not using because https://stackoverflow.com/questions/49476080/express-session-not-persistent-after-redirect
    db: db.sequelize,
    checkExpirationInterval: 7 * 24 * 60 * 60 * 1000, // The interval at which to cleanup expired sessions in milliseconds.
    expiration: 7 * 24 * 60 * 60 * 1000  // The maximum age (in milliseconds) of a valid session.
}).sync(); */

/**
 * Syncing the whole sequelize
 */
/* db.sequelize
  .sync({
    force: true,
  })
  .then(
    (_done) => {
      console.log(`Done syncing tables`);
    },
    (_err) => {
      console.error(`err syncing tables:\n\n`, _err);
    }
  )
  .catch((_reason) => {
    // catches .VIRTUAL data type when altering db
    console.error(`caught this error while syncing tables:\n\n`, _reason);
  }); */

const knex = Knex({
  client: "mysql",
  connection: config,
});
// catching knex error // https://github.com/knex/knex/issues/407#issuecomment-52858626
knex
  .raw("select 1+1 as result")
  .then(
    function () {
      console.log("there is a valid connection in the (knex) pool");
    },
    function (_err) {
      console.error("there is NO valid connection in the (knex) pool", _err);
    }
  )
  .catch((_fail) => {
    console.error(
      "err: there really is NO valid connection in the (knex) pool",
      _fail
    );
  });

const knexSessionStore = new KnexSessionStore({
  knex,
  sidfieldname: "sessionId",
  createtable: true,
  tablename: "_Sessions", // Defaults to 'sessions' // Note: don't use 'Session' ...it's for connect-sequelize-store
});

let expressSessionOptions = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: knexSessionStore, // mySQLSessionStore, // sequelizeStore,
  cookie: {
    httpOnly: true,
    key: "you_online",
    // sameSite: 'strict', // https://github.com/expressjs/session/issues/660#issuecomment-514384297
    // domain: 'corpers.online',
    // path: '',
  },
  proxy: true, // if you do SSL outside of node.
};

let morganFormat = "tiny";
if (app.get("env") === "production") {
  // process.env.NODE_ENV
  app.set("trust proxy", 1); // trust first proxy
  expressSessionOptions.cookie.secure = true;
  morganFormat =
    ':remote-addr - :remote-user [:date[web]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';
}

// set morgan to log info about our requests for development use.
app.use(morgan(morganFormat));

/**
 * use cors
 * 
 * Used regex for our live domain because it's shorter. As opposed to listing 6 similar domains.
 */
let allowedOrigins = [/https\:\/\/(www\.)?corpers\.(ng|online|com\.ng)/]; // our live domains.
if (app.get("env") !== "production") {
  // process.env.NODE_ENV
  allowedOrigins = allowedOrigins.concat([
    /http\:\/\/localhost(\:\d{3,5})?/,
    /http\:\/\/192\.168\.\d{1,3}\.\d{1,3}(\:\d{3,5})?/,
  ]);
}
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// app.use(session(mySQLSessionOptions));
// app.use(session(sequelizeSessionOptions));

app.use(session(expressSessionOptions));

// The app.locals object has properties that are local variables within the application.
app.locals.title = "Corpers Online";

app.locals.email = process.env.THE_EMAIL;

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());
app.use(cookieParser(process.env.SESSION_SECRET));

// https://stackoverflow.com/a/55787532/9259701
// app.use('/assets', express.static('assets'))
// app.use('/graphic', express.static('img')); // use /graphic for img folder
// app.use('/sw.js', express.static('./sw.js'));

// TODO: uncomment when we are ready for swagger and done removing redirects
// app.use('(/api/v1.0)?', [actionsRoutes, byeRoutes, welcomeRoutes, blogRoutes, corpMemberRoutes, saleRoutes, accommodationRoutes, chatRoutes]);

app.use("/api/v1.0", [
  actionsRoutes,
  byeRoutes,
  welcomeRoutes,
  blogRoutes,
  corpMemberRoutes,
  saleRoutes,
  accommodationRoutes,
  chatRoutes,
]);

app.use(testRoutes);
const swaggerFile = require("../swagger-output.json");
// hot-fix
app.use(
  ["/api/v1.0/docs?", "/docs?"],
  swaggerUi.serve,
  swaggerUi.setup(swaggerFile)
);

// must be last route because of 404 pages/error
app.use(function (req, res) {
  // check the url they navigated to that got them lost, and try to offer suggestions in the front end that'll match why they got lost... maybe they missed a letter in their state_code url

  res.status(404).send({ message: "hey, that url does not exist" });
});

/**
 * open https://using-umami.herokuapp.com/ to see amazing metrics
 *
 * should we be using res.locals as opposed to req.session?
 */
const helmet = require("helmet");
app.use(helmet());

module.exports = app; // app.get('env')

/**
 * running on heroku at
 * Creating app... done, ⬢ corpers-online
 * https://corpers-online.herokuapp.com/ | https://git.heroku.com/corpers-online.git
 */

/**
 * use 
 * 
if(thisSession.hasOwnProperty('merchant_id')){

}

to do a middleware to check we have data before creating a new model
or do we find a module for it?

maybe use helpers. if we're gonna do it ourselves
 */
