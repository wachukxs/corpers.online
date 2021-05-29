// https://github.com/goldbergyoni/nodebestpractices

// https://www.codementor.io/@mattgoldspink/nodejs-best-practices-du1086jja

// NEVER THROW ERR, INSTEAD, SEND A RESPONSE TO THE FRONT END, OR PERFORM THE ACTION AGAIN (TRYING TO CORRECT AS MUCH AS POSSIBLE, AFTER INFERRING THE CAUSE OF THE ERROR)
// I need to use env for passwords too, and make sure previous commits of corpers.online repo doesn't show the password and username for ...
//https://github.com/Connarts/corpers.online.git
/*
this is what ran the server BEFORE on corpers.online subdomain in connarts.com.ng terminal:
    nohup npm start </dev/null &

    NOW it's:
    nohup node server.js </dev/null &

    (for some reason, after they crashed, npm can't install anythings neither will nodemon command run. I don't know what else is wrong.)
*/

// something to look in to incase we are just told to stop running https://github.com/nodejs/node-v0.x-archive/issues/1172#issuecomment-1401906
const express = require('express');
const http = require('http');
//var https = require('https');

const fs = require('fs');

inspect = require('util').inspect;
var Busboy = require('busboy');
//make sure only serving corpers can register!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! from the pattern matching in the sign up page, look for how js can manipulate it to make sure only serving members register!
const bodyParser = require('body-parser');
const multer = require('multer');

// using path module removes the buffer object from the req.files array of uploaded files,... incase we ever need this... info!
const path = require('path');

/* list (array) of accepted files */
const acceptedfiles = ['image/gif', 'image/jpeg', 'image/png', 'image/tiff', 'image/vnd.wap.wbmp', 'image/x-icon', 'image/x-jng', 'image/x-ms-bmp', 'image/svg+xml', 'image/webp', 'video/3gpp', 'video/mpeg', 'video/mp4', 'video/x-msvideo', 'video/x-ms-wmv', 'video/x-ms-asf', 'video/x-mng', 'video/x-flv', 'video/quicktime'];

/* handles SETTING the path for STORAGE and NAMING of files */
const storage = multer.diskStorage({
  destination: function (req, file, cb) { // 1350914 benchmark ?
    console.log('THE FILE', file)
    cb(null, './img/')
  },
  filename: function (req, file, cb) {
    console.log('the file details:', file)
    // we're adding a random number between 50 and 99 (to Date.now()) just to make sure no two filenames are thesame
    // from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    cb(null, (Math.floor(Math.random() * (100 - 50)) + 50) + Date.now() + file.originalname.slice(file.originalname.lastIndexOf('.'))) // get the file extension of the file you want to copy plus the '.' char 
  },
  fileFilter: function fileFilter(req, file, cb) {

    // The function should call `cb` with a boolean
    // to indicate if the file should be accepted

    // To reject this file pass `false`, like so:
    // cb(null, false)

    // To accept the file pass `true`, like so:
    // cb(null, true)

    // You can always pass an error if something goes wrong:
    // cb(new Error('I don\'t have a clue!'))

    // try to catch this error and show it to the user, for now we're just ignoring unacceptable files
    cb(null, acceptedfiles.includes(file.mimetype))

  }
})

const upload = multer({
  storage: storage
})


// https://developers.google.com/drive/api/v3/quickstart/nodejs
// https://stackoverflow.com/q/54166810
const readline = require('readline');
const {
  google
} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive'];
// const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'google/token.json';


let auth;
// Load client secrets from a local file.
fs.readFile('google/credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);

  console.log('GOT GGLE CRED')

  const credentials = JSON.parse(content)

  const {
    client_secret,
    client_id,
    redirect_uris
  } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);


  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getAccessToken(oAuth2Client);
    oAuth2Client.setCredentials(JSON.parse(token));

  });

  auth = oAuth2Client;

});


/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getAccessToken(oAuth2Client) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
    });
  });
}






const app = express();
const server = http.Server(app);

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

const nodemailer = require('nodemailer');

// var cookieparser = require('cookieparser');
const session = require('express-session');
const morgan = require('morgan');
const moment = require('moment');
// moment().format(); // keeps on showing the current time 

// io connects to the server
const io = require('socket.io')(server);
const mysql = require('mysql');
const dotenv = require('dotenv').config();
/*
var mysqloptions = {
  host            : process.env.DB_HOST,
  user            : process.env.DB_USER,
  password        : process.env.DB_PASSWORD,
  database        : process.env.DB_DATABASE,
  multipleStatements: true,
  port: 3306,
  connectTimeout: 1800000 // 10000 is 10 secs
};

const connection = mysql.createConnection(mysqloptions); // declare outside connectDB so it's a global variable
*/
const pool = mysql.createPool({
  connectionLimit: process.env.DB_CONLIMIT,
  host: process.env.DB_HOST_ONLINE || process.env.DB_HOST_LOCAL,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  acquireTimeout: 1800000, // 10000 is 10 secs
  multipleStatements: true // it allows for SQL injection attacks if values are not properly escaped
});

pool.on('acquire', function (connection) {
  console.log('Connection to DB with threadID %d acquired', connection.threadId);
});

/**function to send email */
// async..await is not allowed in global scope, must use a wrapper
async function main(email, name, state) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: process.env.CO_EMAIL_SERVER,
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: 'hi@corpers.online', // testAccount.user, // generated ethereal user
      pass: process.env.CO_EMAIL_PASSWORD // testAccount.pass // generated ethereal password
    }
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Corpers Online 🇳🇬" <hi@corpers.online>', // sender address
    to: email, // 'bar@example.com, baz@example.com', // list of receivers
    subject: 'Welcome to the Network', // Subject line
    text: `Here's a short introduction! ${name}, we're glad you're now online with us. We are psyched about it. 
      And we have some information for you. So you'd know what Corpers Online is really about. 
      Post images of house hold items or anything of value, with appropriate descriptions e.g. price, condition of the item etc., 
      to other corpers to sell. We imagine these are items you'd no longer need when you're about having your PoP. 
      Share the location of your PPA. Remember when you first got to ${state} ?
      How you were probably lost a bit, you most likely didn't know where your PPA was or any other place to begin with!
      Well, it's the same for most new corpers. 
      While sharing the location of your PPA, please include directions from a popular landmark 
      (like a popular junction, or building or name of place).
      Share accommodation details. We want to make it easy for corpers to find accommodation. 
      So when you're about having your PoP or leaving an accommodation you acquired during your service year, 
      share the details online.
      This is how it works. Your PoP is over and you're leaving ${state} state, 
      post the accommodation details so a corper can easily find accommodation without the stress of house agents. 
      Also, if your rent isn't over you can collect the rest from the incoming corper 
      so the corper just continues using the accommodation.
      
      
      TL;DR

      When ever you're online, think of other corpers in ${state}. 
      What kind of information would they need. Share valuable information you'd share to your younger self 
      when you first got to ${state} state. 
      We call this #Rule28.
      Of course, mind your language and how you interact online. We trust you've got this.`, // plain text body
    html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <title>Welcome to the Network</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      </head>
      <body style="margin: 0; padding: 0;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">	
              <tr>
                  <td style="padding: 10px 0 30px 0;">
                      <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border: 1px solid #cccccc; border-collapse: collapse;">
                          <tr>
                              <td align="center" bgcolor="#70bbd9" >
                                  <img src="cid:001@corpers.online" alt="${name}, welcome to corpers.online" style="display: block;width: 100%;height: auto;" />
                              </td>
                          </tr>
                          <tr>
                              <td bgcolor="#ffffff" style="padding: 40px 30px 40px 30px;">
                                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                      <tr>
                                          <td style="color: #153643; font-family: Arial, sans-serif; font-size: 24px;">
                                              <b>Here's a short introduction!</b>
                                          </td>
                                      </tr>
                                      <tr>
                                          <td style="padding: 20px 0 30px 0; color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;">
                                            <b>${name}</b>, we're glad you're now online with us. We are psyched about it. And we have some information for you. So you'd know what Corpers Online is really about.
                                          </td>
                                      </tr>
                                      <tr>
                                          <td>
                                              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                  <tr>
                                                      <td width="260" valign="top">
                                                          <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                              <tr>
                                                                  <td>
                                                                      <img src="cid:002@corpers.online" alt="" width="100%" height="140" style="display: block;" />
                                                                  </td>
                                                              </tr>
                                                              <tr>
                                                                  <td style="padding: 25px 0 0 0; color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;">
                                                                      <ul>
                                                                          <li>
                                                                              Post images of house hold items or anything of value, with appropriate descriptions e.g. price, condition of the item etc., to other corpers to sell. We imagine these are items you'd no longer need when you're about having your PoP.
                                                                          </li>
                                                                          <li>
                                                                              <!-- Share the route to your PPA. -->
                                                                              Share the location of your PPA. Remember when you first got to ${state} state ?
                                                                              How you were probably lost a bit, you most likely didn't know where your PPA was or any place to begin with!
                                                                              Well, it's the same for most new corpers. While sharing the location of your PPA, please include directions from a popular landmark (like a popular junction, or building or name of place)
                                                                          </li>
                                                                      </ul>
                                                                  </td>
                                                              </tr>
                                                          </table>
                                                      </td>
                                                      <td style="font-size: 0; line-height: 0;" width="20">
                                                          &nbsp;
                                                      </td>
                                                      <td width="260" valign="top">
                                                          <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                              <tr>
                                                                  <td>
                                                                      <img src="cid:003@corpers.online" alt="" width="100%" height="140" style="display: block;" />
                                                                  </td>
                                                              </tr>
                                                              <tr>
                                                                  <td style="padding: 25px 0 0 0; color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;">
                                                                      <ul>
                                                                          <li>
                                                                              Share accommodation details. We want to make it easy for corpers to find accommodation. So when you're about having your PoP or leaving an accommodation you acquired during your service year, share the details online.
                                                                              This is how it works. Your PoP is over and you're leaving your ${state}, post the accommodation details so a corper can easily find accommodation without the stress of house agents. Also, if your rent isn't over you can collect the rest from the incoming corper so the corper just continues using the accommodation. 
                                                                          </li>
                                                                      </ul>
                                                                      
                                                                  </td>
                                                              </tr>
                                                          </table>
                                                      </td>
                                                  </tr>
                                              </table>
                                          </td>
                                      </tr>
                                      <tr>
                                          <td style="padding: 20px 0 30px 0; color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 20px;">
                                              <h3>TL;DR</h3>
                                              When ever you're online, think of other corpers in ${state}. What kind of information would they need. Share valuable information you'd share to your younger self when you first got to ${state}. We call this <b>#Rule28</b>. <!-- If they click it, they should tweet sth about it -->
                                              Of course, mind your language and how you interact online. We trust you've got this.
                                          </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                          <tr>
                              <td bgcolor="#000000" style="padding: 30px 30px 30px 30px;">
                                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                      <tr>
                                          <td style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;" width="75%">
                                              &reg; Corpers Online ${new Date().getFullYear()}
                                          </td>
                                          <td align="right" width="25%">
                                              <table border="0" cellpadding="0" cellspacing="0">
                                                  <tr>
                                                      <td style="font-family: Arial, sans-serif; font-size: 12px; font-weight: bold;">
                                                          <a href="https://twitter.com/OnlineCorpers" style="color: #ffffff;">
                                                              <img src="cid:004@corpers.online" alt="TWTR" width="38" height="38" style="display: block;" border="0" />
                                                          </a>
                                                      </td>
                                                      <td style="font-size: 0; line-height: 0;" width="20">&nbsp;</td>
                                                      <td style="font-family: Arial, sans-serif; font-size: 12px; font-weight: bold;">
                                                          <a href="https://www.facebook.com/CorpersOnline/" style="color: #ffffff;">
                                                              <img src="cid:005@corpers.online" alt="FB" width="38" height="38" style="display: block;" border="0" />
                                                          </a>
                                                      </td>
                                                      <td style="font-size: 0; line-height: 0;" width="20">&nbsp;</td>
                                                      <td style="font-family: Arial, sans-serif; font-size: 12px; font-weight: bold;">
                                                          <a href="https://www.instagram.com/corpersonline/" style="color: #ffffff;">
                                                              <img src="cid:006@corpers.online" alt="IG" width="38" height="38" style="display: block;" border="0" />
                                                          </a>
                                                      </td>
                                                  </tr>
                                              </table>
                                          </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
      </body>
      </html>`, // html body
    attachments: [{
      filename: 'CORPERS ONLINE.png',
      path: 'https://corpers.online/work on/CORPERS ONLINE.png',
      cid: '001@corpers.online' //same cid value as in the html img src
    }, {
      filename: 'CORPERSONLINE.png',
      path: 'https://corpers.online/work on/CORPERSONLINE.png',
      cid: '002@corpers.online' //same cid value as in the html img src
    },
    {
      filename: 'rule28.png',
      path: 'https://corpers.online/work on/rule28.png',
      cid: '003@corpers.online' //same cid value as in the html img src
    },
    {
      filename: 'twitter.png',
      path: 'https://corpers.online/work on/twitter.png',
      cid: '004@corpers.online' //same cid value as in the html img src
    },
    {
      filename: 'facebook.png',
      path: 'https://corpers.online/work on/facebook.png',
      cid: '005@corpers.online' //same cid value as in the html img src
    },
    {
      filename: 'instagram.png',
      path: 'https://corpers.online/work on/instagram.png',
      cid: '006@corpers.online' //same cid value as in the html img src
    }
    ] // don't use .svg as attachment to embed in the email, it'll show in the email and still be an attachment (not what we want)
  }, (error, info) => {
    if (error) {
      console.log(error);
      // res.status(400).send({success: false})
    } else {
      console.log(info);
      // res.status(200).send({success: true});

      console.log('Message sent: %s', info.messageId);
      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
    }
  });

}

/*
  // https://github.com/mysqljs/mysql/issues/900 (scroll to 2nd to last answer) PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR use pool
  function dbCon () {
      connection.connect(function (err) {
          
          // The server is either down or restarting (and it takes a while sometimes).
          
          if (err) {
              console.log('error when connecting to db:', err);

              //We introduce a delay before attempting to reconnect,
              //to avoid a hot loop, and to allow our node script to
              //process asynchronous requests in the meantime.
              
              //If you're also serving http, display a 503 error.
              
              setTimeout(dbCon, 2000);
          }
          console.log(new Date(Date.now()).toGMTString(), ': connected to DB with id', connection.threadId);
      });

      // this is the error that happens after/during active connection, when a query is fundamentally wrong maybe due to quering a non-existing table
      connection.on('error', function (err) {
          console.log(new Date(Date.now()).toGMTString(), ': database error', err.code); // e.g. 'ER_BAD_DB_ERROR'

            //Connection to the MySQL server is usually
            //lost due to either server restart, or a
            //connnection idle timeout (the wait_timeout
            //server variable configures this)
          
          if (err.code === 'PROTOCOL_CONNECTION_LOST') {
              dbCon();
          } else {
              throw err;
          }
          // connect to the database again regardless of whatever error
          dbCon();
      });
  };

  dbCon();
*/

/*
var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://localhost:27017/';
*/

const portnumber = process.env.PORT || process.env.LOCAL_PORT || 8081
server.listen(portnumber , function () { // auto change port if port is already in use, handle error gracefully
  console.log('node server listening on port :%s', portnumber);
}); //  throw err; // Unhandled 'error' event // Error: listen EADDRINUSE ::process.env.[portnumber]

console.info(`This server's process PID is ${process.pid} running on platform ${process.platform}`);
fs.writeFile('PID.txt', process.pid, (err) => {
  if (err) throw err;
  console.log('New PID gotten!');
});

function handle(signal) {
  console.log(`Received ${signal} signal.`);
  // clear the PID.txt
  fs.writeFile('PID.txt', '', (err) => {
    if (err) throw err;
    console.log('Server Stopped. Cleared PID!');
  });
  // process.abort();
  process.exit(); // later consider process.exitCode
}

process.on('SIGINT', handle)

process.on('SIGHUP', handle)

process.on('uncaughtException', function (err) {
  console.warn('\tuncaughtException:\n\t', err);
  process.exit(1) // mandatory (as per the Node.js docs)
  // https://nodejs.dev/error-handling-in-nodejs
});

// WARNING: app.listen(80) will NOT work here!
/**
 * It is important to note that res.render() will look in a views folder for the view.
 * So we only have to define pages/index since the full path is views/pages/index.
 */
app.set('view engine', 'ejs');

app.use(express.static('node_modules'));
app.use(express.static('js'));
app.use(express.static('css'));
app.use('/graphic', express.static('img'));
app.use(express.static('testimg'));


// set morgan to log info about our requests for development use.
app.use(morgan('dev'));

var z;
/**
 * https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
 * 
 * This function checks for all 'empties' like null, undefined, '', ' ', {}, [].
 */

var isEmpty = function (data) {
  if (typeof data === 'object') {
    if (JSON.stringify(data) === '{}' || JSON.stringify(data) === '[]') {
      return true;
    } else if (!data) {
      return true;
    }
    return false;
  } else if (typeof data === 'string') {
    if (!data.trim()) {
      return true;
    }
    return false;
  } else if (typeof data === 'undefined') {
    return true;
  } else {
    return false;
  }
};
// gracefully hangle 404 errors with express.js ---------------- we shouldn't see CANNOT ger /about or /profile etc.

// express-session deprecated req.secret; provide secret option server.js:449:9
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

// The app.locals object has properties that are local variables within the application.
app.locals.title = 'Corpers Online';
// => 'My App'

app.locals.email = process.env.THE_EMAIL;
// => 'me@myapp.com'


// before any route method, declare session variable // WHY ?
// var _session;

app.get(['/', '/home', '/index', '/homepage'], function (req, res) {
  /* _session = req.session;
  _session.d = 'k'; */
  res.type('html');
  // res.contentType('*/*');
  // res.sendFile(__dirname + '/index.html');
  res.render('pages/index', {
    // houses: results1,
    // pictures: results2
  });
});

app.get(['/about', '/about-us'], function (req, res) {
  /* _session = req.session;
  _session.d = 'k'; */
  res.type('html');
  // res.contentType('*/*');
  // res.sendFile(__dirname + '/index.html');
  res.render('pages/about', {
    // houses: results1,
    // pictures: results2
  });
});
// https://blog.daftcode.pl/how-to-make-uploading-10x-faster-f5b3f9cfcd52

app.get('/allstateslgas', function (req, res) {

  res.set('Content-Type', 'application/json');
  fs.readFile('moreplaces.json', (err, data) => {
    let jkl = JSON.parse(data);
    // let's hope there's no err
    res.send(jkl);
  })
});

app.get('/allppas', function (req, res) {
  res.set('Content-Type', 'application/json');
  // JSON.parse(['4','3','2','3','2','4'])
  // JSON.parse([4,3,2,3,2,4])
  // JSON.stringify([4,3,2,3,2,4]) JSON.parse(JSON.stringify([4,3,2,3,2,4]))
  // JSON.stringify(['4','3','2','3','2','4']) // JSON.parse(JSON.stringify(['4','3','2','3','2','4']))
  var query = "SELECT type_of_ppa FROM info WHERE type_of_ppa != ''";
  pool.query(query, function (error, results, fields) {

    if (error) throw error;
    console.log('it', results)
    var listoftypesofppas = [];
    for (let index = 0; index < results.length; index++) {
      const element = results[index].type_of_ppa;
      listoftypesofppas.push(element);

    }
    /**
 *  [ RowDataPacket { type_of_ppa: 'Radio Station' },
RowDataPacket { type_of_ppa: 'School' },
RowDataPacket { type_of_ppa: 'rew qrqew' } ]
 */
    let jkl = JSON.parse(JSON.stringify(listoftypesofppas));
    // let's hope there's no err
    res.send(jkl);
  });

});

app.get(['/AB', '/AD', '/AK', '/AN', '/BA', '/BY', '/BN', '/BO', '/CR', '/DT', '/EB', '/ED', '/EK', '/EN', '/FC', '/GM', '/IM', '/JG', '/KD', '/KN', '/KT', '/KB', '/KG', '/KW', '/LA', '/NS', '/NG', '/OG', '/OD', '/OS', '/OY', '/PL', '/RV', '/SO', '/TR', '/YB', '/ZM'], function (req, res) {
  // console.log('tryna login ', req.session.id, req.session.loggedin);
  if (req.session.loggedin) {
    res.set('Content-Type', 'text/html');
    // res.sendFile(__dirname + '/state.html');
    res.render('pages/state', {
      // houses: results1,
      // pictures: results2
    });
  } else {
    res.redirect('/login');
  }
});

/**an array of the NYSC abbrevation standard of all the states in nigeria */
var states_short = ['AB', 'AD', 'AK', 'AN', 'BA', 'BY', 'BN', 'BO', 'CR', 'DT', 'EB', 'ED', 'EK', 'EN', 'FC', 'GM', 'IM', 'JG', 'KD', 'KN', 'KT', 'KB', 'KG', 'KW', 'LA', 'NS', 'NG', 'OG', 'OD', 'OS', 'OY', 'PL', 'RV', 'SO', 'TR', 'YB', 'ZM'];

/**an array of all the states in nigeria */
var states_long = ['ABIA', 'ADAMAWA', 'AKWA IBOM', 'ANAMBRA', 'BAUCHI', 'BAYELSA', 'BENUE', 'BORNO', 'CROSS RIVER', 'DELTA', 'EBONYI', 'EDO', 'EKITI', 'ENUGU', 'FCT - ABUJA', 'GOMBE', 'IMO', 'JIGAWA', 'KADUNA', 'KANO', 'KASTINA', 'KEBBI', 'KOGI', 'KWARA', 'LAGOS', 'NASSARAWA', 'NIGER', 'OGUN', 'ONDO', 'OSUN', 'OYO', 'PLATEAU', 'RIVERS', 'SOKOTO', 'TARABA', 'YOBE', 'ZAMFARA'];

// new Date(Date.now()).getFullYear().toString().substring(2,4)
_r = '/';
for (index = 0; index < states_short.length; index++) {
  _r += states_short[index] + (index + 1 == states_short.length ? '/' : '|');
}
var r = new Date(Date.now()).getFullYear();

_r += r.toString().substring(2, 4) + '|' + (r - 1).toString().substring(2, 4) + '|' + (r - 2).toString().substring(2, 4) + '[abc]/[0-9]{4}/';

// '/user/' + r.toString().substring(2,4) + '|' + (r - 1).toString().substring(2,4) + '|' + (r - 2).toString().substring(2,4) + '[abc]/[0-9]{4}'
// '/user/17|18|19[abc]/[0-9]{4}'

// do later
/* app.get(_r, function userIdHandler(req, res) {
  console.log('\nreq.route:', req.route);
  console.log('\nreq.params:', req.params);
  console.log('\n_r:', _r);
  res.send('GET');
}); */

app.get(['/AB/:batch', '/AD/:batch', '/AK/:batch', '/AN/:batch', '/BA/:batch', '/BY/:batch', '/BN/:batch', '/BO/:batch', '/CR/:batch', '/DT/:batch', '/EB/:batch', '/ED/:batch', '/EK/:batch', '/EN/:batch', '/FC/:batch', '/GM/:batch', '/IM/:batch', '/JG/:batch', '/KD/:batch', '/KN/:batch', '/KT/:batch', '/KB/:batch', '/KG/:batch', '/KW/:batch', '/LA/:batch', '/NS/:batch', '/NG/:batch', '/OG/:batch', '/OD/:batch', '/OS/:batch', '/OY/:batch', '/PL/:batch', '/RV/:batch', '/SO/:batch', '/TR/:batch', '/YB/:batch', '/ZM/:batch'], function (req, res) {
  // console.log('tryna login ', req.session.id, req.session.loggedin);
  if (req.session.loggedin) {
    res.set('Content-Type', 'text/html');
    // res.sendFile(__dirname + '/state.html');
    res.render('pages/state', {
      // houses: results1,
      // pictures: results2
    });
  } else {
    res.redirect('/login');
  }
});

/**great resource for express route regex https://www.kevinleary.net/regex-route-express/ & https://forbeslindesay.github.io/express-route-tester/ */
var years = parseInt(new Date(Date.now()).getFullYear().toFixed().slice(2, 4));
var yearrange = '(' + (years - 1).toString() + '|' + years.toString() + ')';

app.get('/:state((AB|AD|AK|AN|BA|BY|BN|BO|CR|DT|EB|ED|EK|EN|FC|GM|IM|JG|KD|KN|KT|KB|KG|KW|LA|NS|NG|OG|OD|OS|OY|PL|RV|SO|TR|YB|ZM|ab|ad|ak|an|ba|by|bn|bo|cr|dt|eb|ed|ek|en|fc|gm|im|jg|kd|kn|kt|kb|kg|kw|la|ns|ng|og|od|os|oy|pl|rv|so|tr|yb|zm))/:batch_stream((' + yearrange /**(18|19)*/ + '([abcACB])))/:lastfour(([0-9]{4}))', function (req, res) { // ['/AB/:batch/:code', '/AD/:batch/:code', '/AK/:batch/:code', '/AN/:batch/:code', '/BA/:batch/:code', '/BY/:batch/:code', '/BN/:batch/:code', '/BO/:batch/:code', '/CR/:batch/:code', '/DT/:batch/:code', '/EB/:batch/:code', '/ED/:batch/:code', '/EK/:batch/:code', '/EN/:batch/:code', '/FC/:batch/:code', '/GM/:batch/:code', '/IM/:batch/:code', '/JG/:batch/:code', '/KD/:batch/:code', '/KN/:batch/:code', '/KT/:batch/:code', '/KB/:batch/:code', '/KG/:batch/:code', '/KW/:batch/:code', '/LA/:batch/:code', '/NS/:batch/:code', '/NG/:batch/:code', '/OG/:batch/:code', '/OD/:batch/:code', '/OS/:batch/:code', '/OY/:batch/:code', '/PL/:batch/:code', '/RV/:batch/:code', '/SO/:batch/:code', '/TR/:batch/:code', '/YB/:batch/:code', '/ZM/:batch/:code']
  // console.log('tryna login ', req.session.statecode, req.session.id, req.session.loggedin);
  // they should be able to change state code too !!!!!!!!!!!! --later
  console.log('\n\n\nreq.params', req.params.batch, req.params.code) // req.path is shorthand for url.parse(req.url).pathname
  // when they update their profile. it should immediately reflect. so set it in the session object after a successfully update


  /** this query runs so we can get the number of unread messages the user has */
  var query = "SELECT * FROM chats WHERE message_to = '" + req.path.substring(1, 12).toUpperCase() + "' AND message IS NOT NULL AND message_sent = false ;"
  if (req.session.loggedin) {
    res.set('Content-Type', 'text/html');
    // res.sendFile(__dirname + '/account.html');
    pool.query(query, function (error, results, fields) {

      if (error) throw error;
      res.render('pages/account', { // having it named account.2 returns error cannot find module '2'
        statecode: req.session.statecode.toUpperCase(),
        statecode2: req.path.substring(1, 12).toUpperCase(),
        servicestate: req.session.servicestate,
        batch: req.session.batch,
        name_of_ppa: req.session.name_of_ppa,
        total_num_unread_msg: results.filter((value, index, array) => {
          return value.message_to == req.path.substring(1, 12).toUpperCase() && value.message_sent == 0
        }).length
      });
    });

  } else {
    res.redirect('/login');
  }
});

app.get('/newsearch', function (req, res) {
  // maybe make use of [req.originalUrl .baseUrl .path] later. req.params too

  // "/search?type=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address + "&top=" + item.type_of_ppa; // nop type pa

  // "/search?type=" + item.group + "&it=" + item.input_time + "&sn=" + item.streetname + "&sc=" + item.statecode; // sn sc it
  res.set('Content-Type', 'text/html');
  // res.sendFile(__dirname + '/search and places/index.html');
  console.log('req.query:', req.query); // find every thing that is req.query.search.query

  var mustquery = "SELECT DISTINCT name_of_ppa, type_of_ppa, ppa_address, ppa_geodata, ppa_directions FROM info WHERE (name_of_ppa != '' OR null and type_of_ppa != '' OR null and ppa_address != '' OR null and ppa_geodata != '' OR null); SELECT * FROM accommodations WHERE expire > UTC_DATE ; SELECT geo_data, name, address, street, type_of_place FROM places WHERE lga = '' AND geo_data != '' ;"; // AND `acc_geodata` != '' \\ [for the 2nd query] // we should be selecting accommodations with geo data, so we have to nudge the corpers to provide geodata

  // if we know where the ppa is, get the geo data and show it on the map
  if (req.query.nop) {
    // should we only be getting data from info ? how about [ppas in] places table ?????????????
    // we have req.query.nop=name_of_ppa + req.query.pa=ppa_address + req.query.top=type_of_ppa // also select ppa closer to it and other relevant info we'll find later
    pool.query(mustquery + "SELECT name_of_ppa, ppa_address, type_of_ppa, ppa_geodata, ppa_directions FROM info WHERE name_of_ppa = '" + req.query.nop + "'", function (error, results, fields) { // bring the results in ascending order

      if (error) { // gracefully handle error e.g. ECONNRESET || ETIMEDOUT || PROTOCOL_CONNECTION_LOST, in this case re-execute the query or connect again, act approprately
        console.log(error);
        throw error;
      } else if (!isEmpty(results) /* && results[3].ppa_geodata != '' */) {
        // we're not adding the GeoJSON results to an array because it's only one result
        for (index = 0; index < results[3].length; index++) {
          /**
           * {
                  "type": "Feature",
                  "properties": {
                      "name": "Coors Field",
                      "amenity": "Hospital",
                      "popupContent": "The Amenity [Hospital], then the location/street name."
                  },
                  "geometry": {
                      "type": "Point",
                      "coordinates": [ 7.5098633766174325, 5.515524804961825 ]
                  }
              }
           */
          // unstringify the ppa_geodata entry
          // results[index]['ppa_geodata'] = JSON.parse(results[index].ppa_geodata);

          // re-arrange to GeoJSON Format
          results[3][index].type = "Feature";

          results[3][index].properties = {};
          results[3][index].properties.ppa_geodata = JSON.parse(results[3][index].ppa_geodata);
          results[3][index].properties.ppa_address = results[3][index].ppa_address;
          results[3][index].properties.type_of_ppa = results[3][index].type_of_ppa;
          results[3][index].properties.name_of_ppa = results[3][index].name_of_ppa;

          // shouldn't we add name of PPA and other details as well ?!?!?

          results[3][index].geometry = {};
          results[3][index].geometry.type = "Point";
          results[3][index].geometry.coordinates = [JSON.parse(results[3][index].ppa_geodata).longitude, JSON.parse(results[3][index].ppa_geodata).latitude];

          console.log(JSON.parse(results[3][index].ppa_geodata).latlng, '======++++++++====', JSON.parse(results[3][index]['ppa_geodata']).longitude, JSON.parse(results[3][index]['ppa_geodata']).latitude);

          // delete results[3][index]['ppa_geodata'];
          // delete results[3][index]['type_of_ppa'];
          // delete results[3][index]['ppa_address'];

          // delete redundate data like longitude, latitude, and latlng in ppa_geodata after reassigning values
        }
      }

      ppa_details = {
        user: {}
      };

      if (req.session.statecode) {
        ppa_details.user.statecode = req.session.statecode.toUpperCase();
      }
      if (req.session.servicestate) {
        ppa_details.user.servicestate = req.session.servicestate;
      }
      if (req.session.batch) {
        ppa_details.user.batch = req.session.batch;
      }
      if (req.session.name_of_ppa) {
        ppa_details.user.name_of_ppa = req.session.name_of_ppa;
      }
      ppa_details.theacc = []; // make it empty
      ppa_details.theppa = results[3]; // JSON.stringify(results);
      ppa_details.nop = results[3]; // this variable is ambigious, nop == name of place, or name of ppa ... but we need it for now, just rush work for now
      ppa_details.ppas = results[0];
      ppa_details.accommodations = results[1];
      ppa_details.places = results[2];

      console.log('let\'s see nop that was searched for', ppa_details.theppa);
      // having it named 'pages/account.2' returns error cannot find module '2'
      res.render('pages/newsearch2', ppa_details);

    });
  } else if (req.query.rr) { // if it's an accomodation
    // req.query.it=input_time + req.query.sn=item.streetname + req.query.sc=item.statecode
    pool.query(mustquery + "SELECT * FROM accommodations WHERE rentrange = '" + req.query.rr + "' AND input_time = '" + req.query.it + "'", function (error, results, fields) {

      if (error) { // gracefully handle error e.g. ECONNRESET || ETIMEDOUT || PROTOCOL_CONNECTION_LOST, in this case re-execute the query or connect again, act approprately
        console.log(error);
        throw error;
      } else if (!isEmpty(results) /* && results[3].acc_geodata != '' */) {
        // we're not adding the GeoJSON results to an array because it's only one result
        for (index = 0; index < results[3].length; index++) {
          /**
           * {
                  "type": "Feature",
                  "properties": {
                      "name": "Coors Field",
                      "amenity": "Hospital",
                      "popupContent": "The Amenity [Hospital], then the location/street name."
                  },
                  "geometry": {
                      "type": "Point",
                      "coordinates": [ 7.5098633766174325, 5.515524804961825 ]
                  }
              }
           */
          // unstringify the acc_geodata entry
          // results[index]['acc_geodata'] = JSON.parse(results[index].acc_geodata);

          // re-arrange to GeoJSON Format
          // results[3][index].type = "Feature"; // we don't need this for acc, even for ppa

          results[3][index].properties = {};

          if (results[3][index].acc_geodata != '') {
            results[3][index].properties.acc_geodata = JSON.parse(results[3][index].acc_geodata);
            results[3][index].properties.acc_geodata.latlng = {
              "lat": results[3][index].properties.acc_geodata.geometry.coordinates[1],
              "lng": results[3][index].properties.acc_geodata.geometry.coordinates[0]
            }

            results[3][index].geometry = {};
            results[3][index].geometry.type = "Point";
            results[3][index].geometry.coordinates = [JSON.parse(results[3][index].acc_geodata).longitude, JSON.parse(results[3][index].acc_geodata).latitude];
          } else {
            // results[3][index].properties.acc_geodata = '';
          }

          results[3][index].properties.address = results[3][index].address;
          results[3][index].properties.type = results[3][index].type;
          results[3][index].properties.price = results[3][index].price;

          // shouldn't we add name of PPA and other details as well ?!?!?

          if (results[3][index].acc_geodata != '') {
            console.log(JSON.parse(results[3][index].acc_geodata).latlng, '======++++++++====', JSON.parse(results[3][index]['acc_geodata']).longitude, JSON.parse(results[3][index]['acc_geodata']).latitude);
          }
          // delete results[3][index]['acc_geodata'];
          // delete results[3][index]['type'];
          // delete results[3][index]['address'];

          // delete redundate data like longitude, latitude, and latlng in acc_geodata after reassigning values
        }
      }

      accommodation_details = {};
      accommodation_details.ppas = results[0];
      accommodation_details.accommodations = results[1];
      accommodation_details.places = results[2];
      accommodation_details.theacc = results[3];
      accommodation_details.nop = JSON.stringify(results[3]); // this variable is ambigious, nop == name of place, or name of ppa ... but we need it for now, just rush work for now
      accommodation_details.theppa = undefined;
      // accommodation_details.nop = '[]' // || undefined; // initialize to empty because the frontend is expecting nop to be somthing. // somehow it's an array when it get to the front end, not string!!!!
      res.render('pages/newsearch2', accommodation_details);
    })

  } else if (req.query.type == 'accommodations') { // if it's an accomodation
    // req.query.it=input_time + req.query.sn=item.streetname + req.query.sc=item.statecode
    // inputing time from js to sql causes ish
    pool.query(mustquery + "SELECT * FROM accommodations WHERE statecode = '" + req.query.sc + "' AND input_time = '" + moment(new Date(req.query.it)).format('YYYY-MM-DD HH:mm:ss') + "' AND streetname = '" + req.query.sn + "'", function (error, results, fields) {
      console.log('should be here', results[3])
      if (error) { // gracefully handle error e.g. ECONNRESET || ETIMEDOUT || PROTOCOL_CONNECTION_LOST, in this case re-execute the query or connect again, act approprately
        console.log(error);
        throw error;
      } else if (!isEmpty(results) /* && results[3].acc_geodata != '' */) {
        // we're not adding the GeoJSON results to an array because it's only one result
        for (index = 0; index < results[3].length; index++) {
          /**
           * {
                  "type": "Feature",
                  "properties": {
                      "name": "Coors Field",
                      "amenity": "Hospital",
                      "popupContent": "The Amenity [Hospital], then the location/street name."
                  },
                  "geometry": {
                      "type": "Point",
                      "coordinates": [ 7.5098633766174325, 5.515524804961825 ]
                  }
              }
           */
          // unstringify the acc_geodata entry
          // results[index]['acc_geodata'] = JSON.parse(results[index].acc_geodata);

          // re-arrange to GeoJSON Format
          // results[3][index].type = "Feature"; // we don't need this for acc, even for ppa
          // here needs work
          results[3][index].properties = {};

          if (results[3][index].acc_geodata != '') {
            results[3][index].properties.acc_geodata = JSON.parse(results[3][index].acc_geodata);
            results[3][index].properties.acc_geodata.latlng = {
              "lat": results[3][index].properties.acc_geodata.geometry.coordinates[1],
              "lng": results[3][index].properties.acc_geodata.geometry.coordinates[0]
            }

            results[3][index].geometry = {};
            results[3][index].geometry.type = "Point";
            results[3][index].geometry.coordinates = [JSON.parse(results[3][index].acc_geodata).longitude, JSON.parse(results[3][index].acc_geodata).latitude];
          } else {
            // results[3][index].properties.acc_geodata = '';
          }

          results[3][index].properties.address = results[3][index].address;
          results[3][index].properties.type = results[3][index].type;
          results[3][index].properties.price = results[3][index].price;

          // shouldn't we add name of PPA and other details as well ?!?!?

          if (results[3][index].acc_geodata != '') {
            console.log(JSON.parse(results[3][index].acc_geodata).latlng, '======++++++++====', JSON.parse(results[3][index]['acc_geodata']).longitude, JSON.parse(results[3][index]['acc_geodata']).latitude);
          }

          // delete results[3][index]['acc_geodata'];
          // delete results[3][index]['type'];
          // delete results[3][index]['address'];

          // delete redundate data like longitude, latitude, and latlng in acc_geodata after reassigning values
        }
      }

      accommodation_details = {};
      accommodation_details.ppas = results[0];
      accommodation_details.accommodations = results[1];
      accommodation_details.places = results[2];
      accommodation_details.theacc = results[3];
      accommodation_details.nop = JSON.stringify(results[3]); // this variable is ambigious, nop == name of place, or name of ppa ... but we need it for now, just rush work for now
      accommodation_details.theppa = undefined;
      // accommodation_details.nop = '[]' // || undefined; // initialize to empty because the frontend is expecting nop to be somthing. // somehow it's an array when it get to the front end, not string!!!!
      // console.log('what we shold see');
      res.render('pages/newsearch2', accommodation_details);
    })

  } else {
    // SELECT DISTINCT name_of_ppa, type_of_ppa, ppa_address,ppa_geodata FROM info WHERE (name_of_ppa != '' OR null and type_of_ppa != '' OR null and ppa_address != '' OR null and ppa_geodata != '' OR null)

    pool.query("SELECT DISTINCT name_of_ppa, type_of_ppa, ppa_address, ppa_geodata, ppa_directions FROM info WHERE (name_of_ppa != '' OR null and type_of_ppa != '' OR null and ppa_address != '' OR null and ppa_geodata != '' OR null); SELECT * FROM accommodations WHERE expire > UTC_DATE ; SELECT geo_data, name, address, street, type_of_place FROM places WHERE lga = '' AND geo_data != '' ;", function (error, results, fields) {

      if (error) { // gracefully handle error e.g. ECONNRESET || ETIMEDOUT || PROTOCOL_CONNECTION_LOST, in this case re-execute the query or connect again, act approprately
        console.log(error);
        throw error;
      }
      console.log('looking for ooo', results)
      _details = {};
      _details.ppas = results[0];
      _details.accommodations = results[1];
      _details.places = results[2];
      _details.theppa = []; // empty
      _details.theacc = []; // empty
      _details.nop = undefined; // initialize to empty because the frontend is expecting nop to be somthing. // somehow it's an array when it get to the front end, not string!!!!
      res.render('pages/newsearch2', _details);
    })

  }



});

app.get('/search', function (req, res) {
  // maybe make use of [req.originalUrl .baseUrl .path] later. req.params too

  // "/search?type=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address + "&top=" + item.type_of_ppa; // nop type pa

  // "/search?type=" + item.group + "&it=" + item.input_time + "&sn=" + item.streetname + "&sc=" + item.statecode; // sn sc it
  res.set('Content-Type', 'text/html');
  // res.sendFile(__dirname + '/search and places/index.html');
  console.log('req.query:', req.query); // find every thing that is req.query.search.query

  // if we know where the ppa is, get the geo data and show it on the map
  // if we don't know where the ppa is, ask the corper to show us on the map, we can even do this from the front end
  if (req.query.nop) {
    // should we only be getting data from info ? how about [ppas in] places table ?????????????
    // we have req.query.nop=name_of_ppa + req.query.pa=ppa_address + req.query.top=type_of_ppa
    // also select ppa closer to it and other relevant info we'll find later
    // also if we don't have the geo data for a school, we can try searching else where for it...
    // also we should track where the search is from coming from
    pool.query("SELECT name_of_ppa, ppa_address, type_of_ppa, ppa_geodata FROM info WHERE name_of_ppa = '" + req.query.nop + "'", function (error, results, fields) { // bring the results in ascending order
      console.log(results[0].ppa_geodata != '', 'we want to check', results)
      if (error) { // gracefully handle error e.g. ECONNRESET || ETIMEDOUT || PROTOCOL_CONNECTION_LOST, in this case re-execute the query or connect again, act approprately
        console.log(error);
        throw error;
      } else if (!isEmpty(results) && results[0].ppa_geodata != '') {
        // we're not adding the GeoJSON results to an array because it's only one result
        for (index = 0; index < results.length; index++) {
          /**
           * {
                  "type": "Feature",
                  "properties": {
                      "name": "Coors Field",
                      "amenity": "Hospital",
                      "popupContent": "The Amenity [Hospital], then the location/street name."
                  },
                  "geometry": {
                      "type": "Point",
                      "coordinates": [ 7.5098633766174325, 5.515524804961825 ]
                  }
              }
           */
          // unstringify the ppa_geodata entry
          // results[index]['ppa_geodata'] = JSON.parse(results[index].ppa_geodata);

          // re-arrange to GeoJSON Format
          results[index].type = "Feature";

          results[index].properties = {};
          results[index].properties.ppa_geodata = JSON.parse(results[index].ppa_geodata);
          results[index].properties.ppa_address = results[index].ppa_address;
          results[index].properties.type_of_ppa = results[index].type_of_ppa;
          results[index].properties.name_of_ppa = results[index].name_of_ppa;

          // shouldn't we add name of PPA and other details as well ?!?!?

          results[index].geometry = {};
          results[index].geometry.type = "Point";
          results[index].geometry.coordinates = [JSON.parse(results[index].ppa_geodata).longitude, JSON.parse(results[index].ppa_geodata).latitude];

          console.log(JSON.parse(results[index].ppa_geodata).latlng, '======++++++++====', JSON.parse(results[index]['ppa_geodata']).longitude, JSON.parse(results[index]['ppa_geodata']).latitude);

          delete results[index]['ppa_geodata'];
          delete results[index]['type_of_ppa'];
          delete results[index]['ppa_address'];

          // delete redundate data like longitude, latitude, and latlng in ppa_geodata after reassigning values
        }
      }

      ppa_details = {};

      if (req.session.statecode) {
        ppa_details.user.statecode = req.session.statecode.toUpperCase();
      }
      if (req.session.servicestate) {
        ppa_details.user.servicestate = req.session.servicestate;
      }
      if (req.session.batch) {
        ppa_details.user.batch = req.session.batch;
      }
      if (req.session.name_of_ppa) {
        ppa_details.user.name_of_ppa = req.session.name_of_ppa;
      }
      ppa_details.theppa = results[0]; // JSON.stringify(results);

      console.log('let\'s see nop that was searched for', ppa_details.theppa);
      // having it named 'pages/account.2' returns error cannot find module '2'
      res.render('pages/search', ppa_details);

    });
  } else if (req.query.rr) { // if it's an accomodation
    // req.query.it=input_time + req.query.sn=item.streetname + req.query.sc=item.statecode
    pool.query("SELECT * FROM accommodations WHERE rentrange = '" + req.query.rr + "' AND input_time = '" + moment(new Date(req.query.it)).format('YYYY-MM-DD HH:mm:ss') + "'", function (error, results, fields) {

      accommodation_details = {};
      accommodation_details.nop = '[]'; // initialize to empty because the frontend is expecting nop to be somthing. // somehow it's an array when it get to the front end, not string!!!!
      res.render('pages/search', accommodation_details);
    })

  } else {
    // SELECT DISTINCT name_of_ppa, type_of_ppa, ppa_address,ppa_geodata FROM info WHERE (name_of_ppa != '' OR null and type_of_ppa != '' OR null and ppa_address != '' OR null and ppa_geodata != '' OR null)

    pool.query("SELECT DISTINCT name_of_ppa, type_of_ppa, ppa_address, ppa_geodata, ppa_directions FROM info WHERE (name_of_ppa != '' OR null and type_of_ppa != '' OR null and ppa_address != '' OR null and ppa_geodata != '' OR null); SELECT * FROM accommodations WHERE expire > UTC_DATE", function (error, results, fields) {

      if (error) { // gracefully handle error e.g. ECONNRESET || ETIMEDOUT || PROTOCOL_CONNECTION_LOST, in this case re-execute the query or connect again, act approprately
        console.log(error);
        throw error;
      }
      console.log('looking for ooo', results)
      _details = {};
      _details.ppas = results[0];
      _details.accommodations = results[1];
      _details.theppa = [];
      _details.nop = undefined; // initialize to empty because the frontend is expecting nop to be somthing. // somehow it's an array when it get to the front end, not string!!!!
      res.render('pages/search', _details);
    })

  }



});

app.get('/chat', function (req, res) {
  res.set('Content-Type', 'text/html');
  // res.sendFile(__dirname + '/chat.html');
  // req.query.posts.who and req.query.posts.when

  // to get old chats

  /**
   * WARNING !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!11
   * TIME IS AN IMPORTANT ISSUE HERE. AND TIME CONVERSION TOO...
   * utc + 1 is our time zone [when converting], or use moment .js
   */

  if (req.session.loggedin && req.query.posts) { // we need to be sure that they clicked from /account
    var postresult;
    // console.log('\n\n\n\n\n uhmmmm', req.query.posts.who, req.query.posts.when, req.query.posts.type, moment(new Date(parseInt(req.query.posts.when))).format('YYYY-MM-DD HH:mm:ss'));
    // console.log( new Date(parseInt(req.query.posts.when)).toISOString().slice(0, 19).replace('T', ' ') ); // typeof req.query.posts.when = string

    // ALSO SELECT OLDMESSAGES THAT ARE NOT SENT... THEN COUNT THEM... 
    if (req.query.posts.type == 'accommodation') {
      var query = "SELECT * FROM accommodations WHERE statecode = '" + req.query.posts.who + "' AND input_time = '" + moment(new Date(parseInt(req.query.posts.when))).format('YYYY-MM-DD HH:mm:ss') + "' ; "
        // + " SELECT * FROM chats WHERE room LIKE '%" + req.query.s + "%' AND message IS NOT NULL ;"
        +
        " SELECT chats.room, chats.message, chats.message_from, chats.message_to, chats.media, chats.time, chats.read_by_to, chats.time_read, chats._time, chats.message_sent, info.firstname AS sender_firstname, info.lastname AS sender_lastname FROM chats, info WHERE info.statecode = chats.message_from AND chats.room LIKE '%" + req.query.s + "%' AND chats.message IS NOT NULL ;"
        // + " SELECT * FROM chats WHERE room LIKE '%" + req.query.s + "%' AND message IS NOT NULL AND message_sent = false ;";
        +
        " SELECT * FROM chats WHERE message_to = '" + req.query.s + "' AND message IS NOT NULL AND message_sent = false ;" +
        " SELECT * FROM chats WHERE message_from = '" + req.query.s + "' AND message IS NOT NULL AND message_sent = false ;" +
        " SELECT firstname, lastname FROM info WHERE statecode = '" + req.query.posts.who.toUpperCase() + "' ;";

    } else if (req.query.posts.type == 'sale') { // we will only do escrow payments for products sale
      var query = "SELECT * FROM posts WHERE statecode = '" + req.query.posts.who + "' AND post_time = '" + req.query.posts.when + "' ;"
        // + " SELECT * FROM chats WHERE room LIKE '%" + req.query.s + "%' AND message IS NOT NULL ;"
        +
        " SELECT chats.room, chats.message, chats.message_from, chats.message_to, chats.media, chats.time, chats.read_by_to, chats.time_read, chats._time, chats.message_sent, info.firstname AS sender_firstname, info.lastname AS sender_lastname FROM chats, info WHERE info.statecode = chats.message_from AND chats.room LIKE '%" + req.query.s + "%' AND chats.message IS NOT NULL ;"
        // + " SELECT * FROM chats WHERE room LIKE '%" + req.query.s + "%' AND message IS NOT NULL AND message_sent = false ;";
        +
        " SELECT * FROM chats WHERE message_to = '" + req.query.s + "' AND message IS NOT NULL AND message_sent = false ;" +
        " SELECT * FROM chats WHERE message_from = '" + req.query.s + "' AND message IS NOT NULL AND message_sent = false ;" +
        " SELECT firstname, lastname FROM info WHERE statecode = '" + req.query.posts.who.toUpperCase() + "' ;";

    }
    /**SELECT chats.room, chats.message, chats.message_from, chats.message_to, chats.media, chats.time, chats.read_by_to, chats.time_read, chats._time, chats.message_sent, info.firstname AS sender_firstname, info.lastname AS sender_lastname FROM chats, info WHERE info.statecode = chats.message_from AND chats.room LIKE '%AB/17B/1234%' AND chats.message IS NOT NULL   */

    pool.query(query, function (error, results, fields) {

      if (error) throw error;

      // console.info('\nold chats', results[1], '\nfrom db successfully');
      // so if the newchat has chatted before, i.e. is in oldchats, then just make it highlighted
      // then send it to the chat page of the involved parties so they are remainded of what they want to buy
      res.render('pages/newchat', { // having it named account.2 returns error cannot find module '2'
        statecode: req.session.statecode.toUpperCase(),
        statecode2: req.query.s,
        servicestate: req.session.servicestate,
        batch: req.session.batch,
        name_of_ppa: req.session.name_of_ppa,
        postdetails: (isEmpty(results[0]) ? null : results[0]), // tell user the post no longer exists, maybe it was bought or something, we should delete it if it was bought, we hope not to use this function
        newchat: {
          statecode: req.query.posts.who.toUpperCase(),
          name: results[4][0]
        },
        posttime: req.query.posts.when,
        posttype: req.query.posts.type,
        oldchats: results[1], // leave it like this!!
        oldunreadchats: results[2], // messages that was sent to this user but this user hasn't seen them
        oldunsentchats: results[3], // messages this user sent but hasn't deliver, i.e. the receipent hasn't seen it
        total_num_unread_msg: results[2].filter((value, index, array) => {
          return value.message_to == req.query.s && value.message_sent == 0
        }).length
      });


    });

  } else if (req.session.loggedin) {
    res.set('Content-Type', 'text/html');
    // res.sendFile(__dirname + '/account.html');
    // console.log('wanna chat', req.session.statecode, req.query.s);
    var query = // "SELECT * FROM chats WHERE room LIKE '%" + req.query.s + "%' AND message IS NOT NULL;"
      " SELECT chats.room, chats.message, chats.message_from, chats.message_to, chats.media, chats.time, chats.read_by_to, chats.time_read, chats._time, chats.message_sent, info.firstname AS sender_firstname, info.lastname AS sender_lastname FROM chats, info WHERE info.statecode = chats.message_from AND chats.room LIKE '%" + req.query.s + "%' AND chats.message IS NOT NULL ;" +
      " SELECT * FROM chats WHERE message_to = '" + req.query.s + "' AND message IS NOT NULL AND message_sent = false ;" +
      " SELECT * FROM chats WHERE message_from = '" + req.query.s + "' AND message IS NOT NULL AND message_sent = false ;";
    pool.query(query, function (error, results, fields) {

      if (error) throw error;

      // console.info('got unread chats from db successfully', results[1]);

      // then send it to the chat page of the involved parties so they are remainded of what they want to buy
      res.render('pages/newchat', { // having it named account.2 returns error cannot find module '2'
        statecode: req.session.statecode.toUpperCase(),
        statecode2: req.query.s,
        servicestate: req.session.servicestate,
        batch: req.session.batch,
        name_of_ppa: req.session.name_of_ppa,
        oldchats: results[0], // leave it like this!!
        newchat: null,
        oldunreadchats: results[1], // (isEmpty(results[1]) ? null : results[1])
        oldunsentchats: results[2],
        total_num_unread_msg: results[1].filter((value, index, array) => {
          return value.message_to == req.query.s && value.message_sent == 0
        }).length
      });
    });

  } else {
    res.redirect('/login');
  }



});

app.get(['/map', '/maps'], function (req, res) { // try to infer their location from their IP Address then send to the front end
  res.set('Content-Type', 'text/html');
  // res.sendFile(__dirname + '/map.html');


  // what about name of the ppa ? this way of selecting might prove inefficient when we have large data set from all the states meanwhile this corper just need data from within a particular state.
  // also select ppa_directions from info and it should be like a reveal, corpers would click 'read directions' and it'll show them
  pool.query("SELECT ppa_address, ppa_geodata, type_of_ppa FROM info WHERE ppa_address != '' AND ppa_geodata != '' AND type_of_ppa != '' ; SELECT geo_data, name, address, lga, street, type_of_place, region FROM places ; SELECT type_of_ppa FROM info WHERE type_of_ppa != '' ", function (error, results, fields) { // bring the results in ascending order

    if (error) { // gracefully handle error e.g. ECONNRESET || ETIMEDOUT || PROTOCOL_CONNECTION_LOST, in this case re-execute the query or connect again, act approprately
      console.log(error);
      throw error;
    } else if (!isEmpty(results)) {
      console.log('geo data for map', results);


      // JSON.parse(JSON.stringify([{ g: 'g', l: 'l' }, { g: 'g', l: 'l' }, { g: 'g', l: { g: 'g', l: { g: 'g', l: 'l' } } }]))

      // JSON.parse(JSON.stringify(results));

      // for the results from places table
      for (let index = 0; index < results[1].length; index++) {
        // re-arrange to GeoJSON Format
        results[1][index].type = "Feature";

        results[1][index].properties = {};
        results[1][index].properties.geodata = JSON.parse(results[1][index].geo_data); // we're always expecting a json here else err
        results[1][index].properties.address = results[1][index].address;
        results[1][index].properties.type = results[1][index].type_of_place;

        // we can add lga, name, and maybe region

        results[1][index].geometry = {};
        results[1][index].geometry.type = "Point";
        results[1][index].geometry.coordinates = [JSON.parse(results[1][index].geo_data).longitude, JSON.parse(results[1][index].geo_data).latitude];

        console.log(JSON.parse(results[1][index].geo_data).latlng, '/////', JSON.parse(results[1][index]['geo_data']).longitude, JSON.parse(results[1][index]['geo_data']).latitude);

        delete results[1][index]['geo_data'];
        delete results[1][index]['type_of_place'];
        delete results[1][index]['address'];

        // delete redundate data like longitude, latitude, and latlng in ppa_geodata after reassigning values

      }

      // for the results from info table
      // format to GeoJSON Format https://tools.ietf.org/html/rfc7946
      for (index = 0; index < results[0].length; index++) {

        // re-arrange to GeoJSON Format
        results[0][index].type = "Feature";

        results[0][index].properties = {};
        results[0][index].properties.geodata = JSON.parse(results[0][index].ppa_geodata);
        results[0][index].properties.address = results[0][index].ppa_address;
        results[0][index].properties.type = results[0][index].type_of_ppa;

        results[0][index].geometry = {};
        results[0][index].geometry.type = "Point";
        results[0][index].geometry.coordinates = [JSON.parse(results[0][index].ppa_geodata).longitude, JSON.parse(results[0][index].ppa_geodata).latitude];

        console.log(JSON.parse(results[0][index].ppa_geodata).latlng, '======++++++++====', JSON.parse(results[0][index]['ppa_geodata']).longitude, JSON.parse(results[0][index]['ppa_geodata']).latitude);

        delete results[0][index]['ppa_geodata'];
        delete results[0][index]['type_of_ppa'];
        delete results[0][index]['ppa_address'];

        // delete redundate data like longitude, latitude, and latlng in ppa_geodata after reassigning values
      }

      var listoftypesofppas = ["ATM", "Bank", "School", "Hospital", "Corporate office", "Industory", "Mosque", "Bus stop", "Shop", "Stadium", "Airport", "Market", "Church", "Hotel", "University"];


      /**
       * add ppas that weren't in listoftypesofppas but other corpers have added them, 
       * over time, when some types of ppas become common, we add them to listoftypesofppas
       * 
       * we'd make this better so that 'school' and 'School' isn't in the array
       */
      for (let index = 0; index < results[2].length; index++) {
        const element = results[2][index].type_of_ppa;
        if (!results[2][element]) {
          listoftypesofppas.push(element)
        }
      }
    }

    res.render('pages/map', {
      statecode: req.session.statecode,
      servicestate: req.session.servicestate,
      mapdata: JSON.stringify(results[0].concat(results[1])),
      types: listoftypesofppas
    });
  });


});


app.get('/login', function (req, res) {
  res.set('Content-Type', 'text/html');
  res.render('pages/login');
});

app.get('/contact', function (req, res) {
  res.set('Content-Type', 'text/html');
  res.render('pages/contact');
});

app.get('/count', function (req, res) {
  res.set('Content-Type', 'text/html');
  res.render('pages/count'); // show number of people online, then per state. something nice and interactive and definately real time too
});

// 
// upload.none()
app.post('/contact', bodyParser.urlencoded({
  extended: true,
  type: 'application/x-www-form-urlencoded'
}), function (req, res) {
  console.log('the message', req.body);

  pool.query("INSERT INTO feedbacks ( name, subject, email, message ) VALUES (" + pool.escape(req.body.name) + ',' + pool.escape(req.body.subject) + ',' + pool.escape(req.body.email) + ',' + pool.escape(req.body.message) + ")", function (error, results, fields) {

    if (error) throw error;

    if (results.affectedRows === 1) {
      res.status(200).send('OK'); //.render('pages/404');
    }
  });
});

app.post('/sayhi', bodyParser.urlencoded({
  extended: true,
  type: 'application/x-www-form-urlencoded'
}), function (req, res) {
  console.log('the message', req.body);
  if (isEmpty(req.body.message)) {
    // console.log('empty');
    res.status(406).send('Not Acceptable'); //.render('pages/404'); // returns Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client
    // res.render('pages/404');
  } else {
    // console.log('NOT empthy');
    pool.query("INSERT INTO feedbacks ( message ) VALUES (" + pool.escape(req.body.message) + ")", function (error, results, fields) {

      if (error) throw error;

      if (results.affectedRows === 1) {
        res.status(200).send('OK'); //.render('pages/404');
      }
    });

  }
});

app.post('/subscribe', upload.none(), function (req, res) {
  console.log('the sublist', req.body);
  if (isEmpty(req.body.email)) {
    res.status(406).send('Not Acceptable');
  } else {
    // console.log('NOT empthy');
    pool.query("INSERT INTO subscribers ( email ) VALUES (" + pool.escape(req.body.email) + ")", function (error, results, fields) {

      if (error) {
        console.log('the error code:', error.code)
        switch (error.code) { // do more here
          case 'ER_DUP_ENTRY': // ER_DUP_ENTRY if an email exists already
            res.status(406).send('Not Acceptable');
            break;
        }
        // throw error;
      } else if (results.affectedRows === 1) {
        res.status(200).send('OK');
      }
    });

  }
});

app.get('/signup', upload.none(), function (req, res) {
  res.set('Content-Type', 'text/html');
  // res.sendFile(__dirname + '/register.html');
  res.render('pages/signup');
});

// somehow logout doesn't work because the app/broswer doesn't go through app.get('/user/:who') when the back button is clicked after loggin out socket.io('/user) picks up the request first ...somehow

// find a more authentic way to calculate the numbers of corpers online using io(/user) --so even if they duplicate pages, it won't double count

var iouser = io.of('/user').on('connection', function (socket) { // when a new user is in the TIMELINE

  socket.join(socket.handshake.query.statecode.substring(0, 2));
  console.log('how many', io.sockets.clients.length, iouser.clients.length);
  socket.on('ferret', (asf, name, fn) => {
    // this funtion will run in the client to show/acknowledge the server has gotten the message.
    fn('woot ' + name + asf);
  });
  socket.emit('callback', {
    this: 'is the call back'
  });

  // find a way so if the server restarts (maybe because of updates and changes to this file) and the user happens to be in this URL log the user out of this url
  // console.log('well', socket.handshake.query.last_post, isEmpty(socket.handshake.query.last_post) );

  // console.log('socket.id: ', socket.id, ' connected on', new Date(Date.now()).toGMTString());
  // console.log('everythin: \n', iouser.connected );

  // console.log('\nsocket.handshake.query.statecode.substring(0, 2)?', socket.handshake.query.statecode.substring(0, 2));
  // it's still not very perfect, count each unique url or something
  iouser.emit('corpersCount', {
    count: Object.keys(iouser.connected).length /* new Map(iouser.connected).size || Object.keys(iouser.connected).length */
  }); // emit total corpers online https://stackoverflow.com/questions/126100/how-to-efficiently-count-the-number-of-keys-properties-of-an-object-in-javascrip

  // find a way to work with cookies in socket.request.headers object for loggining in users again

  // logot out time SELECT TIMESTAMPDIFF(MINUTE , session_usage_details.login_time , session_usage_details.logout_time) AS time

  //-------- optimize by running the two seperate queries (above & below) in parallel later

  // when any user connects, send them (previous) posts in the db before now (that isn't in their timeline)
  // find a way to handle images and videos
  /** sender, statecode, type, text, price, location, post_time, input_time */

  // posts currently in user's time line is socket.handshake.query.utl.split(',')

  var pUTL = socket.handshake.query.putl.split(',');
  var aUTL = socket.handshake.query.autl.split(',');
  console.log('socket query parameter(s) [user timeline]\n', 'acc:' + aUTL.length, ' posts:' + pUTL.length);

  // SELECT * FROM posts WHERE post_time > 1545439085610 ORDER BY posts.post_time ASC (selects posts newer than 1545439085610 | or posts after 1545439085610)

  // right now, this query selects newer posts always | ''.split(',') returns a query with length 1 where the first elemeent is an empty string

  // ordering by ASC starts from oldest, so the first result is the oldest post and the newer ones is the last and that's what corpers see first

  // so we're selecting posts newer than the ones currently in the user's timeline. or the server closed the connection error

  // ways to convert from js format to sql format
  // var d = new Date(aUTL[aUTL.length - 1]).toISOString().slice(0, 19).replace('T', ' '); // or use moment.js library

  // moment is better because it makes it exactly as it was, the other just uses string manipulation and it's always an hour behind original time
  var e = moment(new Date(aUTL[aUTL.length - 1])).format('YYYY-MM-DD HH:mm:ss');
  // remember to check if the query to know if the time is actually greater than or less
  // console.log(e, 'time causing the ish', aUTL[aUTL.length - 1], pUTL[pUTL.length - 1]); // when timeline is empty, e is "Invalid Date"

  // we stopped using sender column from posts table, so it's null !

  /// there's much work on this section maybe, just to make sure sql sees and calculates the value as they should (or NOT ????)
  var getpostsquery = "SELECT * FROM posts WHERE statecode LIKE '%" + socket.handshake.query.statecode.substring(0, 2) + "%'" + (pUTL.length > 1 ? ' AND post_time > "' + pUTL[pUTL.length - 1] + '" ORDER by posts.post_time ASC' : ' ORDER by posts.post_time ASC') +
    "; SELECT * FROM accommodations WHERE statecode LIKE '%" + socket.handshake.query.statecode.substring(0, 2) + "%'" + (aUTL.length > 1 ? ' AND input_time > "' + e + '" ORDER by accommodations.input_time ASC' : ' ORDER BY accommodations.input_time ASC');
  pool.query(getpostsquery, function (error, results, fields) { // bring the results in ascending order

    if (error) { // gracefully handle error e.g. ECONNRESET & ETIMEDOUT, in this case re-execute the query or connect again, act approprately
      console.log('>>>>>>****', error);
      throw error;
    } else if (!isEmpty(results[0]) || !isEmpty(results[1])) { // formerly !isEmpty(results) but results is [[...], [...]]
      // console.log('posts', results);



      // FOR THE POSTS - sales just converting their post time value to a worded age & making the media value okay
      Object.entries(results[0]).forEach(
        ([key, value]) => {
          //console.log( 'post number ' + key, value.text);

          // fix the time here too by converting the retrieved post_time colume value to number because SQL converts the value to string when saving (because we are using type varchar to store the data-number value)
          // value.age = moment(Number(value.post_time)).fromNow();
          value.age = moment(Number(value.post_time))
            .fromNow();

          //if there is image(s) in the post we're sending to user from db then convert it to array.
          if (value.media) {
            // value.media = value.media.split('  '); // previously on how we handled media(images) when we stored them in base64

            // console.log('? ', (value.media.substring(0, 23) === "https://api.mapbox.com/"),(value.media.substring(0, 23) === "https://api.mapbox.com/" ? value.media : value.media.split(',')) );

            value.media = (value.media.substring(0, 23) === "https://api.mapbox.com/" ? value.media : value.media.split(',')); // make only the url be in the array && we can't use .split(',') because there's ','s in the url

            // ---this logic is expensive and buggy
            /* // if what we stored is a map link, ie. a url...
            try {
              value.media = new URL(value.media).toString();
            } catch (error) { // if it isn't
              value.media = value.media.split(',');
            } */

          }

          // send the posts little by little, or in batches so it'll be faster.

          // --socket.emit('boardcast message', { to: 'be received by everyoneELSE', post: value });

          // console.log('sent BCs'); // commented here out so we don't flood the output with too much data, uncomment when you're doing testing.
        }
      );


      // FOR THE ACCOMMODATIONS - accommodations -- just converting their post time value to a worded age
      Object.entries(results[1]).forEach(
        ([key, value]) => {

          //fix the time here too by converting the retrieved post_time colume value to number because SQL converts the value to string when saving (because we are using type varchar to store the data-number value)

          // value.age = moment(new Date(value.input_time)).fromNow();
          value.age = moment(value.post_time) // remove new Date(value.input_time) later
            .fromNow();
          // console.log('acc v:', value);
          // --socket.emit('boardcast message', { to: 'be received by everyoneELSE', post: value });

        }
      );

      var allposts = results[0].concat(results[1]);

      /**
       * "It's also worth noting that unlike many other JavaScript array functions, 
       * Array.sort actually changes, or mutates the array it sorts.
       * To avoid this, you can create a new instance of the array to be sorted and modify that instead."
       * This sorting function/algorithm and the comment above came from 
       * https://www.sitepoint.com/sort-an-array-of-objects-in-javascript/ 
       * I don't really understand it 
       * (read: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Description)
       * */
      function compareFun_to_sort(a, b) {
        return a.post_time - b.post_time; // sort according to post time
      }

      allposts.sort(compareFun_to_sort);
      // FOR THE ACCOMMODATIONS - accommodations
      Object.entries(allposts).forEach(
        ([key, value]) => {

          // console.log('acc v:', value);
          socket.emit('boardcast message', {
            to: 'be received by everyoneELSE',
            post: value
          });

        }
      );

    } else {
      socket.emit('boardcast message', {
        to: 'be received by everyoneELSE',
        post: {}
      });
      console.log('emitting empty posts, first user or the tl is empty');
    }
  });



  socket.on('boardcast message', (data, fn) => {
    console.log(socket.client.id + ' sent boardcast mesage on /user to everyone.');

    data.age = moment(data.post_time).fromNow();

    // if there are images in the post user boardcasted, before we save them to db, convert to string with double spaces ( '  ' ) between each image
    if (data.images) {

      var q = '';
      var l = data.images.length;
      data.images.forEach(function (item, index, array) {
        // console.log(item, index);
        q = l === index + 1 ? q.concat(item) : q.concat(item + '  ');

        // save each image
        console.log('checking', item.slice(item.indexOf(':') + 1, item.indexOf(';'))); // map picture won't save because they aren't in dataURL format
        pool.query("INSERT INTO media (post_time, media, media_type) VALUES ('" + data.post_time + "', '" + item + "', " + pool.escape(item.slice(item.indexOf(':') + 1, item.indexOf(';'))) + ")");
      });

    }
    // save to db --put picture in different columns // increse packet size for media (pixs and vids)                                                                                                                & when using pool.escape(data.text), there's no need for the enclosing single quotes incase the user has ' or any funny characters
    pool.query("INSERT INTO posts( sender, statecode, type, text, media, price, location, post_time) VALUES ('" + data.sender + "', '" + data.statecode + "', '" + (data.type ? data.type : "") + "', " + pool.escape(data.text) + ", '" + (data.images ? q : "") + "', " + pool.escape(data.price) + ", " + pool.escape(data.location) + ",'" + data.post_time + "')", function (error, results, fields) {

      if (error) throw error;

      if (results.affectedRows === 1) {
        console.info('saved post to db successfully');

        socket.in(socket.handshake.query.statecode.substring(0, 2)).emit('boardcast message', {
          to: 'be received by everyoneELSE',
          post: data
        });
      }
    });

    // this funtion will run in the client to show/acknowledge the server has gotten the message.
    fn(data.post_time);
  });

  socket.on('disconnect', function () {
    iouser.emit('corpersCount', {
      count: Object.keys(iouser.connected).length
    }); // todo the disconnected socket should boardcast, let's not waste things and time abeg
  });

});

app.get('/posts', function (req, res) {
  // set resposnse type to application/json
  res.setHeader('Content-Type', 'application/json');
  // get response
  // so we're selecting posts newer than the ones currently in the user's timeline. or the server closed the connection error

  // SELECT * FROM accommodations ORDER BY input_time DESC LIMIT 55; SELECT ppa_address, ppa_geodata, type_of_ppa FROM info WHERE ppa_address != '' AND ppa_geodata != '' AND type_of_ppa != ''
  console.log('search query parameters', req.query)

  if (req.query.s) {
    var q = "SELECT streetname, type, input_time, statecode, price, rentrange FROM accommodations WHERE statecode LIKE '" + req.query.s.substring(0, 2) + "%' ORDER BY input_time DESC LIMIT 55; SELECT name_of_ppa, ppa_address, type_of_ppa, city_town FROM info WHERE ppa_address != '' AND statecode LIKE '" + req.query.s.substring(0, 2) + "%'";
  } else {
    var q = '';
    for (let index = 0; index < states_short.length; index++) {
      const element = states_short[index];
      q += "SELECT streetname, type, input_time, statecode, price, rentrange FROM accommodations WHERE statecode LIKE '" + element + "%' ORDER BY input_time DESC LIMIT 55; SELECT name_of_ppa, ppa_address, type_of_ppa, city_town FROM info WHERE ppa_address != '' AND statecode LIKE '" + element + "%' ;"; // the trailing ';' is very important
    }
    // var q = "SELECT streetname, type, input_time, statecode, price, rentrange FROM accommodations ORDER BY input_time DESC LIMIT 55; SELECT name_of_ppa, ppa_address, type_of_ppa, city_town FROM info WHERE ppa_address != ''";
  }

  // console.log('search sql query ', q)
  pool.query(q, function (error, results, fields) { // bring the results in ascending order

    if (error) { // gracefully handle error e.g. ECONNRESET || ETIMEDOUT || PROTOCOL_CONNECTION_LOST, in this case re-execute the query or connect again, act approprately
      console.log(error);
      throw error;
    } else if (!isEmpty(results)) {
      // res.json({er: 'er'}); // auto sets content-type header with the correct content-type
      // res.send({ user: 'tobi' });
      console.log('\n[=', results.length, results)
      // res.status(200).send({ data: {ppas: ppa, accommodations: acc} }); // {a: acc, p: ppa}

      if (req.query.s) {
        var thisisit = {
          data: {
            ppas: results[1],
            accommodations: results[0]
          }
        };
      } else {
        var thisisit = {
          data: {}
        };
        for (let index = 0, k = 0; index < results.length; index += 2, k++) {
          // never increment index like ++index or index++ or -- because you'd be changing the value of index in the next iteration
          // const element = results[index];

          // the first query // and subsequent even numbered index values of the results from the query will be in results[index]
          /* for (let i = 0; index < results[index].length; index++) {
            if (results[index][i].input_time) {
              results[index][i].age = moment(new Date(results[index][i].input_time)).fromNow()
            }
            
          } */
          console.log('\n', index, k)
          thisisit.data[states_long[k]] = results[index].concat(results[index + 1])
          // thisisit.data[states_long[index+1]] = results[index+1]
          // the last result of thisisit is undefined because states_long[37 + 1] is above the last index of results
        }
      }

      res.status(200).send(thisisit); // {a: acc, p: ppa}
      // console.log('>>>>>>>>>>>>', thisisit)
    }
  });

  // res.status(200).send({ data: ["ghfc ty", "rewfhb iwre", "hblg er ieur\n\nthat apostrophe", "The happening place in Abia is NCCF!", "Well and NACC too. But NCCF would Never die!!!", "dsaf df asd", "5u96y j94938\nfdsig eor\n\ndfsnhgu es9rgre\n\ndsigj90e9re", "gfh r", "gejge rniog eoigrioerge ", "gf er rg erg", "fdg erei sug serugeis gr  \n\n\n\n\nThis", "test df gf byyyyyyyyy mee", "Okay. ", "This is it. And yep.", "I could sing. ... Oh"] });
});

app.get('/profile', function (req, res) {
  if (req.session.loggedin) {
    res.set('Content-Type', 'text/html');
    // res.sendFile(__dirname + '/profile.html');
    res.render('pages/profile', {
      statecode: req.session.statecode.toUpperCase(),
      servicestate: req.session.servicestate,
      batch: req.session.batch
      // select all distinct ppa type / address / name and send it to the front end as suggestions for the input when the corpers type
    });
  } else {
    res.render('pages/login');
  }

});

// do a function or end point that returns all the LGAs of a state (that it collects as )

app.get('/newprofile', function (req, res) {
  fs.readFile('moreplaces.json', (err, data) => {
    let jkl = JSON.parse(data);
    // let's hope there's no err


    if (req.session.loggedin) {
      var jn = req.session.statecode.toUpperCase()

      /**an array of all the local government in the state */
      var lgas = jkl.states[states_short.indexOf(jn.slice(0, 2))][states_long[states_short.indexOf(jn.slice(0, 2))]];
      // use the ones from their service state // AND servicestate = '" + req.session.servicestate + "'
      pool.query("SELECT name_of_ppa FROM info WHERE name_of_ppa != '' ; SELECT ppa_address from info WHERE ppa_address != '' AND servicestate = '" + req.session.servicestate + "'; SELECT city_town FROM info WHERE city_town != '' AND servicestate = '" + req.session.servicestate + "'; SELECT region_street FROM info WHERE region_street != '' AND servicestate = '" + req.session.servicestate + "'", function (error2, results2, fields2) {

        if (error2) throw error2;
        // console.log('PPAs', results2);

        res.set('Content-Type', 'text/html');
        // res.sendFile(__dirname + '/new profile/index.html');
        res.render('pages/newprofile', {
          statecode: req.session.statecode.toUpperCase(),
          servicestate: req.session.servicestate.toUpperCase(),
          batch: req.session.batch,
          names_of_ppas: results2[0], // array of objects ie names_of_ppas[i].name_of_ppa
          ppa_addresses: results2[1],
          cities_towns: results2[2],
          regions_streets: results2[3],
          states: states_long,
          lgas: lgas
          // select all distinct ppa type / address / name and send it to the front end as suggestions for the input when the corpers type
        });
      });
    } else {
      res.render('pages/login');
    }

  })
});

app.post('/profile', bodyParser.urlencoded({
  extended: true /* , type: 'application/x-www-form-urlencoded' */
}), function (req, res) {
  // cater for fields we already have, so that we don't touch them eg. servicestate
  // UPDATE 'info' SET 'firstname'=[value-1],'lastname'=[value-2],'accommodation_location'=[value-3],'servicestate'=[value-4],'batch'=[value-5],'name_of_ppa'=[value-6],'statecode'=[value-7],'email'=[value-8],'middlename'=[value-9],'password'=[value-10],'phone'=[value-11],'dateofreg'=[value-12],'lga'=[value-13],'city_town'=[value-14],'region_street'=[value-15],'stream'=[value-16],'type_of_ppa'=[value-17],'ppa_address'=[value-18],'travel_from_state'=[value-19],'travel_from_city'=[value-20],'spaornot'=[value-21] WHERE email = req.body.email
  // UPDATE info SET 'accommodation_location'=req.body.accommodation_location,'servicestate'=req.body.servicestate,'name_of_ppa'=[value-6],'lga'=req.body.lga,'city_town'=req.body.city_town,'region_street'=req.body.region_street,'stream'=req.body.stream,'type_of_ppa'=req.body.type_of_ppa,'ppa_address'=req.body.ppa_address,'travel_from_state'=req.body.travel_from_state,'travel_from_city'=req.body.travel_from_city,'spaornot'=req.body.spaornot WHERE email = req.body.email
  // var sqlquery = "INSERT INTO info(servicestate, lga, city_town, region_street, stream, accommodation_location, type_of_ppa, travel_from_state, travel_from_city) VALUES ('" + req.body.servicestate + "', '" + req.body.lga + "', '" + req.body.city_town + "', '" + req.body.region_street + "', '" + req.body.stream + "', '" + req.body.accommodation_location + "', '" + req.body.type_of_ppa + "', '" + req.body.travel_from_state + "', '" + req.body.travel_from_city + "', '" + req.body.spaornot + "' )";

  // var sqlquery = "UPDATE info SET accommodation_location = '" + req.body.accommodation_location + "', servicestate = '" + req.body.servicestate + "', name_of_ppa = '" + req.body.name_of_ppa + "', lga = '" + req.body.lga + "', city_town = '" + req.body.city_town + "', region_street = '" + req.body.region_street + "',   stream = '" + req.body.stream + "' , type_of_ppa = '" + req.body.type_of_ppa + "', ppa_address = '" + req.body.ppa_address + "', travel_from_state = '" + req.body.travel_from_state + "', travel_from_city = '" + req.body.travel_from_city + "', spaornot = '" + req.body.spaornot + "' WHERE email = '" + req.body.email + "' " ;

  /*[req.body.accommodation_location, req.body.servicestate, req.body.name_of_ppa, req.body.lga, req.body.city_town, req.body.region_street, req.body.stream, req.body.type_of_ppa, req.body.ppa_address, req.body.travel_from_state, req.body.travel_from_city, req.body.spaornot, req.body.email],*/
  console.log('\n\nthe req.body for /newprofile', req.body, '\n\n', req.body.statecode);
  // console.log('\n\n', req);
  var sqlquery = "UPDATE info SET accommodation_location = '" + (req.body.accommodation_location ? req.body.accommodation_location : '') +
    (req.body.ss ? "', servicestate = '" + req.body.ss : '') // if there's service state(i.e. corper changed service state in real life and from front end), insert it.
    +
    "', name_of_ppa = '" + req.body.name_of_ppa +
    "', ppa_directions = '" + req.body.ppadirections +
    "', lga = '" + req.body.lga + "', city_town = '" + req.body.city_town + "', region_street = '" +
    req.body.region_street + "',   stream = '" + req.body.stream + "' , type_of_ppa = '" +
    req.body.type_of_ppa + "', ppa_geodata = '" + (req.body.ppa_geodata ? req.body.ppa_geodata : '') + "', ppa_address = '" + req.body.ppa_address + "', travel_from_state = '" +
    req.body.travel_from_state + "', travel_from_city = '" + req.body.travel_from_city +
    (req.body.newstatecode ? "', statecode = '" + req.body.newstatecode.toUpperCase() : '') + // if there's a new statecode ...
    /* "', accommodationornot = '" + (req.body.accommodationornot ? req.body.accommodationornot : 'yes') + */
    "', wantspaornot = '" +
    req.body.wantspaornot + "' WHERE statecode = '" + req.session.statecode.toUpperCase() + "' "; // always change state code to uppercase, that's how it is in the db


  pool.query(sqlquery, function (error, results, fields) {
    console.log('updated user profile data: ', results);
    if (error) throw error;
    // go back to the user's timeline
    if (results.changedRows === 1 && !isEmpty(req.body)) {
      if (req.body.name_of_ppa) {
        req.session.name_of_ppa = req.body.name_of_ppa;
      }
      /* 
      // todo later...

      statecode: req.session.statecode.toUpperCase(),
      servicestate: req.session.servicestate,
      batch: req.session.batch, */

      if (req.body.newstatecode) { // if they are changing statecode to a different state, then their service state in the db should change and their ppa details too should change, tell them to change the ppa details if they don't change it
        // change statecode in other places too
        // this works because rooms only have one instance for every two corpers or statecode, so there's no DD/17B/7778-AB/17B/2334 and AB/17B/2334-DD/17B/7778 only one of it, same reason why there's no LIMIT 1 in the SELECT statement in REPLACE function
        var updatequery = "UPDATE chats SET room = (SELECT REPLACE( ( SELECT DISTINCT room WHERE room LIKE '%" + req.session.statecode.toUpperCase() + "%' ) ,'" + req.session.statecode.toUpperCase() + "','" + req.body.newstatecode.toUpperCase() + "')) ; " +
          " UPDATE chats SET message_from = '" + req.body.newstatecode.toUpperCase() + "' WHERE message_from = '" + req.session.statecode.toUpperCase() + "' ; " +
          " UPDATE chats SET message_to = '" + req.body.newstatecode.toUpperCase() + "' WHERE message_to = '" + req.session.statecode.toUpperCase() + "' ;" +
          " UPDATE posts SET statecode = '" + req.body.newstatecode.toUpperCase() + "' WHERE statecode = '" + req.session.statecode.toUpperCase() + "' ; " +
          " UPDATE accommodations SET statecode = '" + req.body.newstatecode.toUpperCase() + "' WHERE statecode = '" + req.session.statecode.toUpperCase() + "' ";
        pool.query(updatequery, function (error, results, fields) {
          console.log('updated statecode ', results);
          if (error) throw error;
          // connected!
          // at least ONE or ALL of these MUST update, not necessarily all that why we are using || and NOT && because it could be possible they've not chatted or posted anything at all, but they must have at least registered!
          if (results[0].affectedRows > 0 || results[1].affectedRows > 0 || results[2].affectedRows > 0 || results[3].affectedRows > 0 || results[4].affectedRows > 0) {
            // then status code is good
            console.log('we\'re really good with the update')

            // then change the session statecode
            req.session.statecode = req.body.newstatecode.toUpperCase();

            res.status(200).redirect(req.body.newstatecode.toUpperCase()); // if there's new statecode
          } else {
            console.log('we\'re bad with the update') // we should find out what went wrong
            /**
             * 
             * 
             * results looks like:
             * 
             * OkPacket {
                fieldCount: 0,
                affectedRows: 1,
                insertId: 0,
                serverStatus: 2,
                warningCount: 1,
                message: '',
                protocol41: true,
                changedRows: 0 
              }

              so we'd want to check out message attribute
             */

            // we should redirect to somewhere and not just block the whole system!!!!!!!!!!
          }
        });
        // should we save every change of statecode that ever occured ?
        // SELECT room FROM `chats` WHERE message_from = 'AB/17B/1234' or message_to = 'AB/17B/1234'

        // UPDATE `chats` SET `room`=[value-1],`message_from`=[value-3],`message_to`=[value-4] WHERE message_from = 'AB/17B/1234' or message_to = 'AB/17B/1234'
        //- UPDATE `chats` SET `message_from`=[value-3] WHERE message_from = 'AB/17B/1234'
        //- UPDATE `chats` SET `message_to`=[value-4] WHERE message_to = 'AB/17B/1234'

        // SELECT room from chats WHERE message_from = 'AB/17B/1234' or message_to = 'AB/17B/1234'
        // SELECT `room` FROM `chats` WHERE room LIKE '%AB/17B/1234%'

        // should know when who they are chatting with is online and when they are typing

        // for room change, consider using REPLACE('str', 'str_to_replace', 'replacement_str')
        // for room change, consider using REPLACE(SELECT `room` FROM `chats` WHERE room LIKE '%AB/17B/1234%', 'AB/17B/1234', 'OD/19B/7778')
        //- REPLACE(SELECT `room` FROM `chats` WHERE room LIKE '%AB/17B/1234%', 'AB/17B/1234', 'OD/19B/7778')

        // for room formation, concat('str1', 'str2', ..., 'strN'), or concat_ws('seperator', 'str1', 'str2', ..., 'strN')


      } else { // if no newstatecode
        res.status(200).redirect(req.session.statecode.toUpperCase() /* + '?e=y' */); // [e]dit=[y]es|[n]o
      }
      // res.sendStatus(200);
    } else {
      // res.sendStatus(500);
      res.status(500).redirect('/newprofile' + '?e=n'); // [e]dit=[y]es|[n]o
    }
  });

});

app.post('/addplace', upload.none(), function (req, res) {
  // handle post request, add data to database.
  console.log('came here /addplace', req.body);
  if (!isEmpty(req.body)) {
    console.log('we are returning a response')
    var sqlquery = "INSERT INTO places( geo_data, name, address, lga, street, type_of_place, region ) VALUES ('" + req.body.geodata + "','" + req.body.nameOfPlace + "', '" + req.body.address + "', " + pool.escape(req.body.lga) + ", " + pool.escape('') + ", " + pool.escape(req.body.category) + ",'" + req.body.town + "')"

    pool.query(sqlquery, function (error, results, fields) {
      console.log('inserted data from: ', results);
      if (error) throw error;
      // connected!
      if (results.affectedRows === 1) {
        // then status code is good
        res.status(200).send('OK'); // the 'OK' is what the front end sees as event.target.responseText

      } else {
        // this is really important for the form to get response
        res.sendStatus(500);
        // === res.status(500).send('Internal Server Error')
      }
    });

  }
});

app.post('/posts', /* upload.array('see', 12), */ function (req, res, next) {
  // console.log('req.method', req.method)
  // console.log('req.headers', req.headers)
  var busboy = new Busboy({
    headers: req.headers
  });
  var _media = []; // good, because we re-initialize on new post
  var _text = {};

  busboy.on('file', function (fieldname, filestream, filename, transferEncoding, mimetype) {

    filestream.on('data', function (data) {
      console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
    });

    filestream.on('end', function () {
      console.log('File [' + fieldname + '] Finished. Got ' + 'bytes');
    });

    // if we listend for 'file', even if there's no file, we still come here
    // so we're checking if it's empty before doing anything.

    // this is not a good method

    /**One thing you might be able to try is to read 0 bytes from the stream first and see if you get the appropriate 'end' event or not (perhaps on the next tick) */

    if (filename != '') { // filename: 1848-1844-1-PB.pdf, encoding: 7bit, mimetype: application/pdf
      /* var obj = {
          filestream: file_stream,
          mimetype: mimetype,
          filename: filename
      }; */
      // var _id = authorize(JSON.parse(cred_content), uploadFile, obj)

      var fileMetadata = {
        'name': filename, // Date.now() + 'test.jpg',
        parents: ['15HYR0_TjEPAjBjo_m9g4aR-afULaAzrt'] // upload to folder CorpersOnline-TEST 15HYR0_TjEPAjBjo_m9g4aR-afULaAzrt
      };
      var media = {
        mimeType: mimetype,
        body: filestream // fs.createReadStream("C:\\Users\\NWACHUKWU\\Pictures\\ad\\IMG-20180511-WA0001.jpg")
      };

      const drive = google.drive({
        version: 'v3',
        auth
      });
      drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id',
      }).then(
        function (file) {

          console.log('upload File Id: ', file.data.id); // save to db
          // console.log('File: ', file);
          _media.push(file.data.id)

        }, function (err) {
          // Handle error
          console.error(err);

        }
      ).catch(function (err) {
        console.log('some other error ??', err)
      }).finally(() => {

        var sqlquery = "INSERT INTO posts( media, statecode, type, text, price, location, post_time) VALUES ('" + (_media.length > 0 ? _media : _text.mapimage ? _text.mapimage : '') + "','" + req.session.statecode + "', '" + (_text.type ? _text.type : "sale") + "', " + pool.escape(_text.text) + ", " + pool.escape((_text.price ? _text.price : "")) + ", " + pool.escape(req.session.location) + ",'" + _text.post_time + "')"

        pool.query(sqlquery, function (error, results, fields) {
          console.log('inserted data from: ', results);
          if (error) throw error;
          // ER_BAD_NULL_ERROR: Column 'location' cannot be null
          // connected!
          if (results.affectedRows === 1) {
            // then status code is good
            // res.sendStatus(200);

            // once it saves in db them emit to other users
            iouser.to(req.session.statecode.substring(0, 2)).emit('boardcast message', {
              to: 'be received by everyoneELSE',
              post: {
                statecode: req.session.statecode,
                location: req.session.location,
                media: (_media.length > 0 ? _media : false),
                post_time: _text.post_time,
                type: _text.type,
                mapdata: (_text.mapimage ? _text.mapimage : ''),
                text: _text.text,
                age: moment(Number(_text.post_time)).fromNow(),
                price: (_text.price ? _text.price : '')
              }
            });
          } else {
            // this is really important for the form to get response
            res.sendStatus(500);
            // === res.status(500).send('Internal Server Error')
          }
        });

      });



    } else {
      var sqlquery = "INSERT INTO posts( media, statecode, type, text, price, location, post_time) VALUES ('" + (_media.length > 0 ? _media : _text.mapimage ? _text.mapimage : '') + "','" + req.session.statecode + "', '" + (_text.type ? _text.type : "sale") + "', " + pool.escape(_text.text) + ", " + pool.escape((_text.price ? _text.price : "")) + ", " + pool.escape(req.session.location) + ",'" + _text.post_time + "')"

      pool.query(sqlquery, function (error, results, fields) {
        console.log('inserted data from: ', results);
        if (error) throw error;
        // ER_BAD_NULL_ERROR: Column 'location' cannot be null
        // connected!
        if (results.affectedRows === 1) {
          // then status code is good
          res.sendStatus(200);

          // once it saves in db them emit to other users
          iouser.to(req.session.statecode.substring(0, 2)).emit('boardcast message', {
            to: 'be received by everyoneELSE',
            post: {
              statecode: req.session.statecode,
              location: req.session.location,
              media: (_media.length > 0 ? _media : false),
              post_time: _text.post_time,
              type: _text.type,
              mapdata: (_text.mapimage ? _text.mapimage : ''),
              text: _text.text,
              age: moment(Number(_text.post_time)).fromNow(),
              price: (_text.price ? _text.price : '')
            }
          });
        } else {
          // this is really important for the form to get response
          res.sendStatus(500);
          // === res.status(500).send('Internal Server Error')
        }
      });
    }


    // https://stackoverflow.com/questions/26859563/node-stream-data-from-busboy-to-google-drive
    // https://stackoverflow.com/a/26859673/9259701
    filestream.resume() // must always be last in this callback else server HANG

  });

  busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, transferEncoding, mimetype) {
    console.log('Field [' + fieldname + ']: value: ' + inspect(val));
    _text[fieldname] = val; // inspect(val); // seems inspect() adds double quote to the value
    console.warn('fielddname Truncated:', fieldnameTruncated, valTruncated, transferEncoding, mimetype);
  });

  // answer this question: https://stackoverflow.com/questions/26859563/node-stream-data-from-busboy-to-google-drive

  busboy.on('finish', function () {
    console.log('Done parsing form!', _text, _media);
    // res.writeHead(303, { Connection: 'close', Location: '/' });
    // res.end();


  });

  // handle post request, add data to database... do more
  // console.log('it: :', req.body)
  // console.log('it: : :', req.files)
  if (!isEmpty(req.body)) { // no need to check for req.files, since that's optional and we must always get req.body

  } else {
    // res.sendStatus(500);
  }

  return req.pipe(busboy)

});

app.post('/signup', bodyParser.urlencoded({
  extended: true
}), function (req, res) {
  // handle post request, add data to database.
  // implement the hashing of password before saving to the db
  // also when some one signs up, it counts as login time too, so we should include it in usage details table

  // we can find the service state with req.body.statecode.slice(0, 2) which gives the first two letters


  var theservicestate = states_long[states_short.indexOf(req.body.statecode.slice(0, 2).toUpperCase())];

  var thestream = req.body.statecode.slice(5, 6).toUpperCase();

  function getstream(sb) {
    return sb == 'A' ? 1 : sb == 'B' ? 2 : sb == 'C' ? 3 : 4; // because we're sure it's gonna be 'D'
  }

  var sqlquery = "INSERT INTO info(email, firstname, middlename, password, lastname, statecode, batch, servicestate, stream) VALUES ('" + req.body.email + "', '" + req.body.firstname + "', '" + req.body.middlename + "', '" + req.body.password + "', '" + req.body.lastname + "', '" + req.body.statecode.toUpperCase() + "', '" + req.body.statecode.slice(3, 6).toUpperCase() + "', '" + theservicestate + "' , '" + getstream(thestream) + "'  )";
  pool.query(sqlquery, function (error, results, fields) {
    console.log('inserted data from: ', results);
    if (error) {
      console.log('the error code:', error.code, error.sqlMessage)
      switch (error.code) { // do more here
        case 'ER_DUP_ENTRY': // ER_DUP_ENTRY if a statecode or email exists already
          if (error.sqlMessage.includes('PRIMARY', req.body.statecode.toUpperCase())) { // Duplicate entry 'TR/19A/1234' for key 'PRIMARY'
            res.redirect('/signup?m=ds'); // [m]essage = [d]uplicate [s]tatecode
          } else if (error.sqlMessage.includes('email', req.body.email)) { // Duplicate entry 'uyu@yud.eww' for key 'email'
            res.redirect('/signup?m=de'); // [m]essage = [d]uplicate [e]mail
          }

          break;
      }
      // throw error;
    }

    // "else if" is very important
    else if (results.affectedRows === 1) {
      req.session.statecode = req.body.statecode.toUpperCase();
      req.session.loggedin = true;
      req.session.servicestate = theservicestate;
      req.session.batch = req.body.statecode.toUpperCase().slice(3, 6);
      req.session.loggedin = true;
      req.session.location = req.session.servicestate;

      main(req.body.email, req.body.firstname, theservicestate).catch(console.error);

      res.redirect(req.body.statecode.toUpperCase());
    }
  });

});

app.get('/t', function (req, res) {
  res.set('Content-Type', 'text/html');
  res.sendFile(__dirname + '/test.html');
});
app.post('/accommodations', upload.array('roomsmedia', 12), function (req, res) {
  console.log('accommodation', req.body, req.files);

  // if there are images in the post user boardcasted
  if (req.files.length > 0) {
    // save the files in an array
    var arraymedia = [];

    /* var l = req.files.length;
    req.files.forEach(function (item, index, array) {
      console.log('item:\n', item,'index:\n', index);
    }); */

    // insert and work with the media
    Object.entries(req.files).forEach(
      ([key, value]) => {
        // console.log('key:', key, 'value:', value);

        // rename/change the file name appropriately // Date.now() part of name + get what's in the pic + file extension
        value.filename = value.filename.slice(0, value.filename.lastIndexOf('.')) + req.body[value.size] + value.originalname.slice(value.originalname.lastIndexOf('.'));

        /** When using the "single"
         data come in "req.file" regardless of the attribute "name". 
        **/
        var tmp_path = value.path;

        /** The original name of the uploaded file
            stored in the variable "originalname".
        **/
        // var target_path = 'img/' + value.originalname;
        var target_path = 'img/' + value.filename;

        /** A better way to copy the uploaded file. **/
        var src = fs.createReadStream(tmp_path);
        var dest = fs.createWriteStream(target_path);
        src.pipe(dest);

        src.on('end', function () {
          // res.render('complete');
          console.log('complete, pushing', value.originalname, value.filename);

          arraymedia.push(value.filename); // returns a number!

          // when we're done, insert in db and emit to other users

          console.log('COMPARING key and req.files.length', key + 1, req.files.length, ((parseInt(key) + 1) === req.files.length)); // key is a number with string data type,
          if (((parseInt(key) + 1) === req.files.length)) {
            console.log('media array null ?', arraymedia);
            var sqlquery = "INSERT INTO accommodations( statecode, streetname, type, price, media, rentrange, rooms, address, directions, tenure, expire, post_location, post_time, acc_geodata) VALUES ('" +
              req.session.statecode + "', '" + req.body.streetname + "', '" + req.body.accommodationtype + "', '" + req.body.price + "', '" +
              arraymedia + "', '" + req.body.rentrange + "', '" + req.body.rooms + "','" + req.body.address + "','" + req.body.directions + "','" +
              req.body.tenure + "','" + (req.body.expiredate ? req.body.expiredate : '') + "', " + pool.escape(req.session.location) + ", " + pool.escape(req.body.post_time) + ",'" + (req.body.acc_geodata ? req.body.acc_geodata : '') + "')";

            pool.query(sqlquery, function (error, results, fields) {
              console.log('inserted data from: ', results);
              if (error) throw error;
              // connected!
              if (results.affectedRows === 1) {
                // then status code is good
                res.sendStatus(200);

                console.log('me before you', moment(Number(req.body.post_time)).fromNow(), req.body.post_time);
                console.log('price', req.body.price);

                // once it saves in db them emit to other users
                iouser.emit('boardcast message', { // or 'accommodation'
                  to: 'be received by everyoneELSE',
                  post: {
                    statecode: req.session.statecode,
                    streetname: req.body.streetname,
                    rentrange: req.body.rentrange,
                    rooms: req.body.rooms,
                    tenure: req.body.tenure,
                    expiredate: (req.body.expiredate ? req.body.expiredate : ''),
                    post_location: req.session.location,
                    media: arraymedia,
                    post_time: new Date().toLocaleString(), // not sure we need and make use of post time
                    type: req.body.accommodationtype,
                    address: req.body.address,
                    directions: req.body.directions,
                    age: moment(Date.now()).fromNow(),
                    price: req.body.price
                  }
                });
              } else {

                // this is really important for the form to get response
                res.sendStatus(500);
                // === res.status(500).send('Internal Server Error')
              }
            });

          }


        });
        src.on('error', function (err) {
          console.log('error: ', err);
        });

        dest.on('close', function () {
          console.log('dooneeeee\n');
        })

      }
    );

  } else {
    var sqlquery = "INSERT INTO accommodations( statecode, streetname, type, price, media, rentrange, rooms, address, directions, tenure, expire, post_location, post_time, acc_geodata) VALUES ('" +
      req.session.statecode + "', '" + req.body.streetname + "', '" + req.body.accommodationtype + "', '" + req.body.price + "', '" +
      '' /**media is empty */ + "', '" + req.body.rentrange + "', '" + req.body.rooms + "','" + req.body.address + "','" + req.body.directions + "','" +
      req.body.tenure + "','" + (req.body.expiredate ? req.body.expiredate : '') + "', " + pool.escape(req.session.location) + ", " + pool.escape(req.body.post_time) + ",'" + (req.body.acc_geodata ? req.body.acc_geodata : '') + "')";

    pool.query(sqlquery, function (error, results, fields) {
      console.log('inserted data from: ', results);
      if (error) throw error;
      // connected!
      if (results.affectedRows === 1) {
        // then status code is good
        res.sendStatus(200);

        console.log('me before you', moment(Number(req.body.post_time)).fromNow(), req.body.post_time);
        console.log('price', req.body.price);

        // once it saves in db them emit to other users
        iouser.emit('boardcast message', { // or 'accommodation'
          to: 'be received by everyoneELSE',
          post: {
            statecode: req.session.statecode,
            streetname: req.body.streetname,
            rentrange: req.body.rentrange,
            rooms: req.body.rooms,
            tenure: req.body.tenure,
            expiredate: (req.body.expiredate ? req.body.expiredate : ''),
            post_location: req.session.location,
            media: [], // make an empty array or sth else ...just make it empty
            post_time: new Date().toLocaleString(), // not sure we need and make use of post time
            type: req.body.accommodationtype,
            address: req.body.address,
            directions: req.body.directions,
            age: moment(Date.now()).fromNow(),
            price: req.body.price
          }
        });
      } else {

        // this is really important for the form to get response
        res.sendStatus(500);
        // === res.status(500).send('Internal Server Error')
      }
    });
  }
  // ----------------------------------------------- delete this later. not yet, until we so if else for when there are no files.
  /* pool.query("INSERT INTO accommodations( statecode, streetname, type, price, media, rentrange, rooms, address, tenure, expire) VALUES ('" +
    req.session.statecode + "', '" + req.body.streetname + "', '" + req.body.accommodationtype + "', '" + req.body.price + "', '" +
    arraymedia + "', '" + req.body.rentrange + "', '" + req.body.rooms + "','" + req.body.address + "','" + req.body.tenure + "','" + (req.body.expiredate ? req.body.expiredate : '') +
    "')", function (error, results, fields) {

    if (error) {
      res.sendStatus(404); // handle here effectively, the server should not crash for whatsoever reason!. HANDLE ALL ERROR EFFECTIVELY! We tryna run a business
      throw error;
    }

    if (results.affectedRows === 1) {
      console.info('saved post to db successfully');
      res.sendStatus(200);
      // iouser.emit('boardcast message', { to: 'be received by everyoneELSE', post: data });
    }
  }); */


})


app.get('/logout', function (req, res) {
  // add when user logged out to database
  console.log('came here /logout for ', req.session.id);
  req.session.loggedin = false;
  req.session.destroy(function (err) {
    // cannot access session here
    console.log('session destroyed');
  });
  res.redirect('/');

});

app.get('/news', function (req, res) {
  res.sendFile(__dirname + '/news.html');
});

var ioindex = io.of('/').on('connection', function (socket) { // when a new user connects at all

  // emit to everyone except the sending socket
  // socket.broadcast.emit('hey', {for: 'everyone else @' + new Date(Date.now()).toLocaleString() });

  // this particular socket (user) sends 'news' to everyone including self
  // socket.emit('news', { hello: 'world from ' + socket.client.id });

  // when we receive 'boardcast msg' from any connected socket
  socket.on('boardcast message', function (data) {

    // io.emit sends to EVERYONE
    socket.broadcast.emit('boardcast message', {
      will: 'be received by everyoneELSE',
      msg: data,
      from: 'user ' + socket.client.id + ' online'
    });
  });
});


var iomap = io.of('/map').on('connection', function (socket) { // when a new user connects to the map

  socket.on('addplace', function (data) {
    console.log('got some info', data)
  });

  socket.on('gotposition', function (data) {

  });

  socket.on('tracking', (asf, fn) => { // asf is what we sent from client
    // this funtion will run in the client to show/acknowledge the server has gotten the message.
    // console.log('trk', asf);
    fn(asf); // takes only one argument
  });
});


var iosignup = io.of('/signup').on('connection', function (socket) { // when a new user is in the signup page

});


var iologin = io.of('/login').on('connection', function (socket) { // when a new user is in the login page

  // when we receive 'login request' from any connected socket
  socket.on('login request', function (data) {
    console.log(data);
  });



});

var iocount = io.of('/count').on('connection', function (countsocket) {
  // once you connect, send the number
  countsocket.emit('count', {
    number: io.sockets.clients.length
  });

  // while, you're connected, if someone else logs in or comes 'online', sent the number
  io.on('connection', function (socket) {
    console.log(io.sockets.clients.length, typeof io.sockets.clients.length); // clients counts the different ipaddresses connected
    console.log('+1')
    countsocket.emit('count', {
      number: io.sockets.clients.length
    });

    // if someone goes offline or dissconnects, send the number
    socket.on('disconnect', function () {
      console.log(io.sockets.clients.length, typeof io.sockets.clients.length);
      console.log('-1')
      countsocket.emit('count', {
        number: io.sockets.clients.length
      });
    });

  })


});

// truly only save rooms when a message has started in that room. 
// then once chat page is open, use .ejs variables to send all the rooms the user has been in from the express query parameter

var chat = io
  .of('/chat')
  .on('connection', function (socket) {

    // get user details...
    pool.query("SELECT firstname, lastname FROM info WHERE statecode = '" + socket.handshake.query.from + "'", function (error, results, fields) { // bring the results in ascending order

      if (error) {
        console.log(error);
        throw error;
      } else if (!isEmpty(results)) {
        // console.log('we should get to this point', results[0]);
        socket.names = results[0]
      } else {
        console.log('we should not get to this point', results);
      }

    });

    // immediately join all the rooms presently online they are involved in, someone wants to chat with you
    var everyRoomOnline = Object.keys(chat.adapter.rooms)
    console.log('everyRoomOnline: ', everyRoomOnline);
    for (index = 0; index < everyRoomOnline.length; index++) {
      const onlineRoom = everyRoomOnline[index];

      if (onlineRoom.includes(socket.handshake.query.from)) {
        console.log('\nsaw onlineRoom', `${onlineRoom} is got in ${socket.handshake.query.from}`);
        socket.join(onlineRoom);
      }

    } // ON EVERY MESSAGE, WE CAN ITERATE THROUGH ALL THE CONNECTED ROOMS AND IF A ROOM CONTAINS BOTH THE .TO AND .FROM, WE SEND TO THAT ROOM BUT THIS METHOD IS INEFFICIENT, IF THE ROOM ISN'T ALREADY EXISTING, CREATE IT AND JOIN, ELSE JUST ONLY JOIN

    // socket.handshake.query.to and socket.handshake.query.from

    // [so we save traffic, a bit maybe] also select old rooms, i.e. rooms not in everyOnlineRooms, also show that these rooms[the participants] are online[maybe with green in the front end][from chat.adapter.rooms object]

    var query = " SELECT DISTINCT room FROM chats WHERE room LIKE '%" + socket.handshake.query.from + "%' AND message IS NOT NULL "; // every room you've ever been mention in, i.e. consisting of who you sent message to and who sent message to you

    pool.query(query, function (error, results, fields) {

      if (error) throw error;

      if (!isEmpty(results)) { // an array of objects with the columns as keys
        console.info('got rooms from db successfully', results);
        // join old rooms
        for (index = 0; index < results.length; index++) {
          const offlineRoom = results[index].room;

          if (offlineRoom.includes(socket.handshake.query.from)) {
            console.log('\nsaw offlineRoom', `${offlineRoom} is got in ${socket.handshake.query.from}`);
            socket.join(offlineRoom, () => {
              console.log('\nand joined', `${offlineRoom}`);
            });
          }

        }

      } else if (isEmpty(results)) {
        // console.info('got empty rooms from db successfully', results);
      }
    });

    // save all the ever rooms a socket has been in, and output it so 

    // then every socket joins a room where their state code is mentioned [an array]

    // and if this new room is a room that isn't saved, it means it's a new room, save it. we know by checking the output of the results of all rooms a socket is mentioned in with this new room value

    // for now we are supporting only two per room
    // only join rooms that has more than one participant. else why is it a room? and you can't chat alone with yourself!
    // don't join rooms with the same state codes!! 
    // only join a room a socket isn't already in --socket.io already takes care of this!!


    /**
     * save all incoming message to db
     * save who to message time attachments [link to the file, array datatype]
     * 
     * when sockets come online, check if they have any unread message, then send it to them,
     * 
     * the room name will be both involved parties statecode. if more, then all their statecode or something unique
     * 
     * how do we know read and unread messages ?
     * 
     * check all connected sockets if that state code is online, 
     * send message to them and wait for the reciept funtion to run to mark the message as read
     * 
     * if they are not online then the message is unread
     * 
     * when they come online, check if they have any unread message, then send it to them,
     * 
     * and when they see the message, it should mark that it has been read... how ?
     */

    socket.on('hi', function (msg) {
      console.log('\nwhat we got:', msg);
    });

    socket.on('ferret', (asf, name, fn) => {
      // this funtion will run in the client to show/acknowledge the server has gotten the message.
      fn('from server: we got the message woot ' + name + asf);
    });

    /**this function checks if a corper is online, it takes the corper's statecode on a socket's query parameter and the socket namespace to check */
    function corperonline(sc, ns) {
      console.log('checking if someone is online')
      var x = Object.keys(ns.sockets);
      var t = false; // false
      for (const s of x) {
        if (ns.sockets[s].handshake.query.from == sc) { // if they're online
          t = s; // true // return the socket.id
          console.log('they are/were...', s)
          break;
        }
      }
      return t;
    }

    socket.on('message', (msg, fn) => {
      // declare the encapsulating object
      var m = {
        'from': {},
        'to': {}
      };

      if (socket.handshake.query.from != ('' || null) && msg.to != ('' && socket.handshake.query.from && null)) { // send message only to a particular room
        /* var m = {
          'from': { 'statecode': socket.handshake.query.from },
          'to': { 'statecode': msg.to },
          'it': msg
        }; */
        m.from.statecode = socket.handshake.query.from, m.to.statecode = msg.to, m.it = msg;
        m.from.firstname = socket.names.firstname, m.from.lastname = socket.names.lastname;

        var everyRoomOnline = Object.keys(chat.adapter.rooms)
        // ON EVERY MESSAGE, WE CAN ITERATE THROUGH ALL THE CONNECTED ROOMS AND IF A ROOM CONTAINS BOTH THE .TO AND .FROM, WE SEND TO THAT ROOM BUT THIS METHOD IS INEFFICIENT, IF THE ROOM ISN'T ALREADY EXISTING, CREATE IT AND JOIN, ELSE JUST ONLY JOIN
        // console.log('\n\n\n\nevery online room', everyRoomOnline)

        //// in the IFs statements, check if the receipient sockets are online too before sending!!!

        var c_online = corperonline(msg.to, chat);
        //[TODO]// check if they are both in the room before sending to the room. [DONE]

        // THE TWO IF STATEMENTS HAVE THE SAME LOGIC BUT DIFFERENT IMPLMENTATION

        if (chat.adapter.rooms[socket.handshake.query.from + '-' + msg.to] && c_online) {
          // In the array!
          var room = socket.handshake.query.from + '-' + msg.to;
          console.log('is in room ?', chat.adapter.rooms[room].sockets[socket.id]);
          if (!chat.adapter.rooms[room].sockets[socket.id]) { // if the sending socket is NOT in the room

          }

          if (!chat.adapter.rooms[room].sockets[c_online]) {
            chat.sockets[c_online].join(room, () => {
              console.log(msg.to, "wasn't in", room, "just joined")
            })
          }
          socket.join(room, () => {
            // to do, add the socket the message is sent to to the room too
            socket.to(room).broadcast.emit('message', m); // broadcast to everyone in the room
            m.sent = true;
          });
          console.log('\n\ngot close to deliver ? 001', !m.sent)
        } else if (chat.adapter.rooms[msg.to + '-' + socket.handshake.query.from] && c_online) {
          // In the array!
          console.log(socket.id, 'what ??????', c_online) // chat.sockets[c_online].id
          var room = msg.to + '-' + socket.handshake.query.from;

          console.log('are in room ? sender = ', chat.adapter.rooms[room].sockets[socket.id], 'receipent =', chat.adapter.rooms[room].sockets[c_online]);
          if (chat.adapter.rooms[room].sockets[socket.id] && chat.adapter.rooms[room].sockets[c_online]) { // if they are both online and in the room
            socket.to(room).broadcast.emit('message', m);
          } else {
            chat.sockets[c_online].join(room, () => {
              socket.join(room, () => {
                socket.to(room).broadcast.emit('message', m);
                m.sent = true;
              });
            })
          }

          console.log('\n\ngot close to deliver ? 02', !m.sent) // something is wrong here. if new delete all messages. and a new corper open a new chat with another corper. if the initiating corper sends messages, the other corper receives, the other corpers sends messages, the initiating corper doens't receive it immeidately 
        } else {
          // Not in the array
          // then add both sockets...from and to ...to thesame room [to get the .to, find the socket that the query.from is msg.to]

          var room = socket.handshake.query.from + '-' + msg.to;

          if (c_online) {
            chat.sockets[c_online].join(room, () => {
              socket.join(room, () => {
                socket.to(room).broadcast.emit('message', m);
                m.sent = true;
              });
            })
          } else { // they must be offline
            console.log('\n\ndid not deliver', !m.sent)
            // emit an incremented number of unread message to other necessary pages, after inserting to database
            var socket_id = corperonline(msg.to, iouser)
            // console.log('akkkhhhh', iouser)
            if (socket_id) {
              console.log('\n\nfound socket', socket_id)
              iouser.to(socket_id).emit('totalunreadmsg', 1)
            }
            m.sent = false;
          }
        }

        // socket.emit('message', m); // only the socket (itself) sees it.
        fn(m) // run on client machine
        // save message to db
        var q = "INSERT INTO chats (room, message_from, message_to, time, message, message_sent) VALUES ('" + room + "', '" + socket.handshake.query.from + "', '" + msg.to + "', '" + msg.time + "', " + pool.escape(msg.message) + ", " + pool.escape(m.sent) + ")";
        pool.query(q, function (error, results, fields) {
          if (error) throw error;
          // connected!
          if (results.affectedRows === 1) { // when we've saved it, the corper can now join the room
            console.log('\n\nsaved message to db')
            if (!m.sent) {
              // to number of unread message to database
            }
          }
        });
      }

    });
    // Handle typing event
    socket.on('typing', function (data) {
      socket.broadcast.emit('typing', data);
    });

    socket.on('read', (m, fn) => {
      var q = "UPDATE chats SET message_sent = true WHERE message IS NOT NULL AND message_from = '" + m.message_from + "' AND message_to = '" + m.message_to + "'";
      pool.query(q, function (error, results, fields) {
        if (error) throw error;
        // connected!
        if (results.changedRows > 0) { // when we've saved it, the corper can now join the room
          console.log('\n\nupdated messages delivered');
          // emit to the message_from if online to know that the message_to has read the message [so double tick on both ends]
          fn(m); // fn takes only one parameter
        }
      });

      // this funtion will run in the client to show/acknowledge the server has gotten the message.
      // emit an event to message_from to know that his/her message has been read
    });

    // io.sockets.in(room).emit('message', 'what is going on, party people?'); // room is something unique. sockets.room

    //everyone, including self, in /chat will get it
    chat.emit('hi!', {
      test: 'from chat',
      '/chat': 'will get, it ?'
    });

  });

var news = io
  .of('/news')
  .on('connection', function (socket) {
    socket.emit('item', {
      news: 'item'
    });
  });

var about = io
  .of('/profile')
  .on('connection', function (socket) {
    socket.emit('item', {
      abt: 'item'
    });
  });

/*
socket.binary(value)
Specifies whether the emitted data contains binary. Increases performance when specified. Can be true or false.

socket.binary(false).emit('an event', { some: 'data' });
*/












// --- always last
app.use(function (req, res, next) {
  // res.status(404).send("Sorry can't find that! If you could just go back, please, or go <a href='/'>home</a>. Thank You.")

  res.render('pages/404', { // check the url they navigated to that got them lost, and try to offer suggestions in the front end that'll match why they got lost... maybe they missed a letter in their statecode url

  });
});