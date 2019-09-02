//https://github.com/Connarts/corpers.online.git
/*
this is what ran the server BEFORE on corpers.online subdomain in connarts.com.ng terminal:
    nohup npm start </dev/null &

    NOW it's:
    nohup node server.js </dev/null &

    (for some reason, after they crashed, npm can't install anythings neither will nodemon command run. I don't know what else is wrong.)
*/

/**
 * aws elastic ip address 18.191.104.21 (corpers-online-env-1.8db6dt2nw6.us-east-2.elasticbeanstalk.com/)
 * 
 * former nameservers for corpers.online are ns14.whogohost.com and ns13.whogohost.com
 */

var express = require('express');
var http = require('http');
//var https = require('https');


/*
var fs = require('fs');
fs.readFile("641.jpg", function (err, data) {
    if (err) throw err;
    fs.writeFile('message.txt', data, (err) => {
      if (err) throw err;
      console.log('The file has been saved!');
    });
});

var rs = fs.createReadStream('641.jpg', {encoding: 'binary'});
chunks = [];
delay = 0;

rs.on('readable', function () {
  console.log('Image loading');
})

rs.on('data', function (doing) {
  chunks.push(doing);
  console.log(doing, '[][][][][][][][][][]');
  //socket.emit('img-chunks', doing);
  fs.writeFile('msg.txt', doing, (err) => {
    if (err) throw err;
    console.log('The other file has been saved!');
  });
})
//this doesn't append as they are read, it accumulates read data then sends the overall accumulated data (bad!), so we'll be sending the data as they are read and appending the read ones/data from the client end [with //socket.emit('img-chunks', doing);  ---so we'll uncomment it]
rs.on('end', function () {
  console.log('Image loaded');
  fs.writeFile('msg2.txt', chunks, (err) => {
    if (err) throw err;
    console.log('The other file has been saved!');
  });
})
*/


//make sure only serving corpers can register!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! from the pattern matching in the sign up page, look for how js can manipulate it to make sure only serving members register!
var bodyParser = require('body-parser');
var multer = require('multer');
// var upload = multer();

// using path module removes the buffer object from the req.files array of uploaded files,... incase we ever need this... info!
var path = require('path');

/* list (array) of accepted files */
const acceptedfiles = ['image/gif', 'image/jpeg', 'image/png', 'image/tiff', 'image/vnd.wap.wbmp', 'image/x-icon', 'image/x-jng', 'image/x-ms-bmp', 'image/svg+xml', 'image/webp', 'video/3gpp', 'video/mpeg', 'video/mp4', 'video/x-msvideo', 'video/x-ms-wmv', 'video/x-ms-asf', 'video/x-mng', 'video/x-flv', 'video/quicktime'];

/* handles SETTING the path for STORAGE and NAMING of files */
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // console.log('THE FILE', file)
    if (acceptedfiles.includes(file.mimetype)) {
      cb(null, './img/')
    } /* else { // try to catch this error and show it to the user, for now we're just ignoring unacceptable files
        err = new Error('file not accepted')
        cb(err, './test/')
      } */

  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname.slice(file.originalname.lastIndexOf('.'))) // get the file extension of the file you want to copy plus the '.' char 
  }
})

var upload = multer({ storage: storage })

var fs = require('fs');

var app = express();
var server = http.Server(app);

// var cookieparser = require('cookieparser');
var session = require('express-session');
var morgan = require('morgan');
var moment = require('moment');
// moment().format(); //keeps on showing the current time 

// io connects to the server
var io = require('socket.io')(server);
var mysql = require('mysql');
/*
var mysqloptions = {
  host: 'connarts.com.ng',
  user: 'connarts_ossai',
  password: "ossai'spassword",
  database: 'connarts_nysc',
  multipleStatements: true,
  port: 3306,
  connectTimeout: 1800000 // 10000 is 10 secs
};

var connection = mysql.createConnection(mysqloptions); // declare outside connectDB so it's a global variable
*/
var pool = mysql.createPool({
  connectionLimit: 15, // Default: 0
  host: 'localhost', // def change to connarts.com.ng before deployment
  user: 'connarts_ossai',
  password: "ossai'spassword",
  database: 'connarts_nysc',
  acquireTimeout: 1800000, // 10000 is 10 secs
  multipleStatements: true // it allows for SQL injection attacks if values are not properly escaped
});

pool.on('acquire', function (connection) {
  console.log('Connection to DB with threadID %d acquired', connection.threadId);
});

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
server.listen(8081, function () { // auto change port if port is already in use, handle error gracefully
  console.log('node server listening on port :8081');
}); //  throw er; // Unhandled 'error' event // Error: listen EADDRINUSE :::8081

// WARNING: app.listen(80) will NOT work here!
/**
 * It is important to note that res.render() will look in a views folder for the view.
 * So we only have to define pages/index since the full path is views/pages/index.
 */
app.set('view engine', 'ejs');

app.use(express.static('node_modules'));
app.use(express.static('js'));
app.use(express.static('css'));
app.use(express.static('img'));
app.use(express.static('testimg'));


// set morgan to log info about our requests for development use.
app.use(morgan('dev'));

// for parsing application/json
// app.use(bodyParser.json());

// for parsing application/xwww-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: true }));

// for parsing multipart/form-data
// app.use(upload.array());


var z;
/**
 * https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
 * 
 * Meanwhile we can have one function that checks for all 'empties' like null, undefined, '', ' ', {}, [].
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

app.use(session({
  secret: '"xiooi-=-09R$NDJ&("]]csd90',
  resave: false,
  saveUninitialized: true
}));

// The app.locals object has properties that are local variables within the application.
app.locals.title = 'Corpers Online';
// => 'My App'

app.locals.email = 'nwachukwuossai@gmail.com';
// => 'me@myapp.com'


// before any route method, declare session variable // WHY ?
// var _session;

app.get('/', function (req, res) {
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

// https://blog.daftcode.pl/how-to-make-uploading-10x-faster-f5b3f9cfcd52


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
var years = parseInt( new Date( Date.now() ).getFullYear().toFixed().slice( 2, 4 ) );
var yearrange = '(' + ( years - 1 ).toString() + '|' + years.toString() + ')';

app.get('/:state((AB|AD|AK|AN|BA|BY|BN|BO|CR|DT|EB|ED|EK|EN|FC|GM|IM|JG|KD|KN|KT|KB|KG|KW|LA|NS|NG|OG|OD|OS|OY|PL|RV|SO|TR|YB|ZM|ab|ad|ak|an|ba|by|bn|bo|cr|dt|eb|ed|ek|en|fc|gm|im|jg|kd|kn|kt|kb|kg|kw|la|ns|ng|og|od|os|oy|pl|rv|so|tr|yb|zm))/:batch_stream(('+yearrange/**(17|18|19)*/+'([abcACB])))/:lastfour(([0-9]{4}))', function (req, res) { // ['/AB/:batch/:code', '/AD/:batch/:code', '/AK/:batch/:code', '/AN/:batch/:code', '/BA/:batch/:code', '/BY/:batch/:code', '/BN/:batch/:code', '/BO/:batch/:code', '/CR/:batch/:code', '/DT/:batch/:code', '/EB/:batch/:code', '/ED/:batch/:code', '/EK/:batch/:code', '/EN/:batch/:code', '/FC/:batch/:code', '/GM/:batch/:code', '/IM/:batch/:code', '/JG/:batch/:code', '/KD/:batch/:code', '/KN/:batch/:code', '/KT/:batch/:code', '/KB/:batch/:code', '/KG/:batch/:code', '/KW/:batch/:code', '/LA/:batch/:code', '/NS/:batch/:code', '/NG/:batch/:code', '/OG/:batch/:code', '/OD/:batch/:code', '/OS/:batch/:code', '/OY/:batch/:code', '/PL/:batch/:code', '/RV/:batch/:code', '/SO/:batch/:code', '/TR/:batch/:code', '/YB/:batch/:code', '/ZM/:batch/:code']
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
        total_num_unread_msg: results.filter((value, index, array) => { return value.message_to == req.path.substring(1, 12).toUpperCase() && value.message_sent == 0 }).length
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

  // if we know where the ppa is, get the geo data and show it on the map
  if (req.query.nop) {
    // we have req.query.nop=name_of_ppa + req.query.pa=ppa_address + req.query.top=type_of_ppa // also select ppa closer to it and other relevant info we'll find later
    pool.query("SELECT name_of_ppa, ppa_address, type_of_ppa, ppa_geodata FROM info WHERE name_of_ppa = '" + req.query.nop + "'", function (error, results, fields) { // bring the results in ascending order

      if (error) { // gracefully handle error e.g. ECONNRESET || ETIMEDOUT || PROTOCOL_CONNECTION_LOST, in this case re-execute the query or connect again, act approprately
        console.log(error);
        throw error;
      }

      else if (!isEmpty(results)) {
        for (index = 0; index < results.length; index++) {
          // unstringify the ppa_geodata entry
          // results[index]['ppa_geodata'] = JSON.parse(results[index].ppa_geodata);

          // re-arrange to GeoJSON Format
          results[index].type = "Feature";

          results[index].properties = {};
          results[index].properties.ppa_geodata = JSON.parse(results[index].ppa_geodata);
          results[index].properties.ppa_address = results[index].ppa_address;
          results[index].properties.type_of_ppa = results[index].type_of_ppa;

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
      ppa_details.nop = JSON.stringify(results);

      console.log('let\'s see nop', ppa_details.nop);
      // having it named 'pages/account.2' returns error cannot find module '2'
      res.render('pages/newsearch', ppa_details /* {
        statecode: req.session.statecode.toUpperCase(),
        servicestate: req.session.servicestate,
        batch: req.session.batch,
        name_of_ppa: req.session.name_of_ppa,
        nop: JSON.stringify(results)
      } */);

    });
  } else if (req.query.rr) { // if it's an accomodation
    // req.query.it=input_time + req.query.sn=item.streetname + req.query.sc=item.statecode
    pool.query("SELECT * FROM accommodations WHERE rentrange = '" + req.query.rr + "' AND input_time = '" + req.query.it + "'", function (error, results, fields) {

      accommodation_details = {};
      accommodation_details.nop = '[]'; // initialize to empty because the frontend is expecting nop to be somthing. // somehow it's an array when it get to the front end, not string!!!!
      res.render('pages/newsearch', accommodation_details /* {
      statecode: req.session.statecode.toUpperCase(),
      servicestate: req.session.servicestate,
      batch: req.session.batch,
      name_of_ppa: req.session.name_of_ppa,
      nop: JSON.stringify(results)
    } */);
    })

  }

  else {
    res.render('pages/newsearch', {
      nop: undefined
    });
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
  if (req.query.nop) {
    // we have req.query.nop=name_of_ppa + req.query.pa=ppa_address + req.query.top=type_of_ppa // also select ppa closer to it and other relevant info we'll find later
    pool.query("SELECT name_of_ppa, ppa_address, type_of_ppa, ppa_geodata FROM info WHERE name_of_ppa = '" + req.query.nop + "'", function (error, results, fields) { // bring the results in ascending order

      if (error) { // gracefully handle error e.g. ECONNRESET || ETIMEDOUT || PROTOCOL_CONNECTION_LOST, in this case re-execute the query or connect again, act approprately
        console.log(error);
        throw error;
      }

      else if (!isEmpty(results)) {
        for (index = 0; index < results.length; index++) {
          // unstringify the ppa_geodata entry
          // results[index]['ppa_geodata'] = JSON.parse(results[index].ppa_geodata);

          // re-arrange to GeoJSON Format
          results[index].type = "Feature";

          results[index].properties = {};
          results[index].properties.ppa_geodata = JSON.parse(results[index].ppa_geodata);
          results[index].properties.ppa_address = results[index].ppa_address;
          results[index].properties.type_of_ppa = results[index].type_of_ppa;

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
      ppa_details.nop = JSON.stringify(results);

      console.log('let\'s see nop', ppa_details.nop);
      // having it named 'pages/account.2' returns error cannot find module '2'
      res.render('pages/search', ppa_details /* {
        statecode: req.session.statecode.toUpperCase(),
        servicestate: req.session.servicestate,
        batch: req.session.batch,
        name_of_ppa: req.session.name_of_ppa,
        nop: JSON.stringify(results)
      } */);

    });
  } else if (req.query.rr) { // if it's an accomodation
    // req.query.it=input_time + req.query.sn=item.streetname + req.query.sc=item.statecode
    pool.query("SELECT * FROM accommodations WHERE rentrange = '" + req.query.rr + "' AND input_time = '" + req.query.it + "'", function (error, results, fields) {

      accommodation_details = {};
      accommodation_details.nop = '[]'; // initialize to empty because the frontend is expecting nop to be somthing. // somehow it's an array when it get to the front end, not string!!!!
      res.render('pages/search', accommodation_details /* {
      statecode: req.session.statecode.toUpperCase(),
      servicestate: req.session.servicestate,
      batch: req.session.batch,
      name_of_ppa: req.session.name_of_ppa,
      nop: JSON.stringify(results)
    } */);
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
        + " SELECT chats.room, chats.message, chats.message_from, chats.message_to, chats.media, chats.time, chats.read_by_to, chats.time_read, chats._time, chats.message_sent, info.firstname AS sender_firstname, info.lastname AS sender_lastname FROM chats, info WHERE info.statecode = chats.message_from AND chats.room LIKE '%" + req.query.s + "%' AND chats.message IS NOT NULL ;"
        // + " SELECT * FROM chats WHERE room LIKE '%" + req.query.s + "%' AND message IS NOT NULL AND message_sent = false ;";
        + " SELECT * FROM chats WHERE message_to = '" + req.query.s + "' AND message IS NOT NULL AND message_sent = false ;"
        + " SELECT * FROM chats WHERE message_from = '" + req.query.s + "' AND message IS NOT NULL AND message_sent = false ;"
        + " SELECT firstname, lastname FROM info WHERE statecode = '" + req.query.posts.who.toUpperCase() + "' ;";

    } else if (req.query.posts.type == 'sale') { // we will only do escrow payments for products sale
      var query = "SELECT * FROM posts WHERE statecode = '" + req.query.posts.who + "' AND post_time = '" + req.query.posts.when + "' ;"
        // + " SELECT * FROM chats WHERE room LIKE '%" + req.query.s + "%' AND message IS NOT NULL ;"
        + " SELECT chats.room, chats.message, chats.message_from, chats.message_to, chats.media, chats.time, chats.read_by_to, chats.time_read, chats._time, chats.message_sent, info.firstname AS sender_firstname, info.lastname AS sender_lastname FROM chats, info WHERE info.statecode = chats.message_from AND chats.room LIKE '%" + req.query.s + "%' AND chats.message IS NOT NULL ;"
        // + " SELECT * FROM chats WHERE room LIKE '%" + req.query.s + "%' AND message IS NOT NULL AND message_sent = false ;";
        + " SELECT * FROM chats WHERE message_to = '" + req.query.s + "' AND message IS NOT NULL AND message_sent = false ;"
        + " SELECT * FROM chats WHERE message_from = '" + req.query.s + "' AND message IS NOT NULL AND message_sent = false ;"
        + " SELECT firstname, lastname FROM info WHERE statecode = '" + req.query.posts.who.toUpperCase() + "' ;";

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
        newchat: { statecode: req.query.posts.who.toUpperCase(), name: results[4][0] },
        posttime: req.query.posts.when,
        posttype: req.query.posts.type,
        oldchats: results[1], // leave it like this!!
        oldunreadchats: results[2], // messages that was sent to this user but this user hasn't seen them
        oldunsentchats: results[3], // messages this user sent but hasn't deliver, i.e. the receipent hasn't seen it
        total_num_unread_msg: results[2].filter((value, index, array) => { return value.message_to == req.query.s && value.message_sent == 0 }).length
      });


    });

  } else if (req.session.loggedin) {
    res.set('Content-Type', 'text/html');
    // res.sendFile(__dirname + '/account.html');
    // console.log('wanna chat', req.session.statecode, req.query.s);
    var query = // "SELECT * FROM chats WHERE room LIKE '%" + req.query.s + "%' AND message IS NOT NULL;"
      " SELECT chats.room, chats.message, chats.message_from, chats.message_to, chats.media, chats.time, chats.read_by_to, chats.time_read, chats._time, chats.message_sent, info.firstname AS sender_firstname, info.lastname AS sender_lastname FROM chats, info WHERE info.statecode = chats.message_from AND chats.room LIKE '%" + req.query.s + "%' AND chats.message IS NOT NULL ;"
      + " SELECT * FROM chats WHERE message_to = '" + req.query.s + "' AND message IS NOT NULL AND message_sent = false ;"
      + " SELECT * FROM chats WHERE message_from = '" + req.query.s + "' AND message IS NOT NULL AND message_sent = false ;";
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
        total_num_unread_msg: results[1].filter((value, index, array) => { return value.message_to == req.query.s && value.message_sent == 0 }).length
      });
    });

  } else {
    res.redirect('/login');
  }



});

app.get(['/map', '/maps'], function (req, res) {
  res.set('Content-Type', 'text/html');
  // res.sendFile(__dirname + '/map.html');

  pool.query("SELECT ppa_address, ppa_geodata, type_of_ppa FROM info WHERE ppa_address != '' AND ppa_geodata != '' AND type_of_ppa != ''", function (error, results, fields) { // bring the results in ascending order

    if (error) { // gracefully handle error e.g. ECONNRESET || ETIMEDOUT || PROTOCOL_CONNECTION_LOST, in this case re-execute the query or connect again, act approprately
      console.log(error);
      throw error;
    }

    else if (!isEmpty(results)) {
      console.log('geo data for map', results);

      // JSON.parse(JSON.stringify([{ g: 'g', l: 'l' }, { g: 'g', l: 'l' }, { g: 'g', l: { g: 'g', l: { g: 'g', l: 'l' } } }]))

      // JSON.parse(JSON.stringify(results));

      /* for (let index = 0; index < results.length; index++) {
        // unstringify the ppa_geodata entry
        results[index]['ppa_geodata'] = JSON.parse(results[index].ppa_geodata);

      } */

      // format to GeoJSON Format https://tools.ietf.org/html/rfc7946
      for (index = 0; index < results.length; index++) {
        // unstringify the ppa_geodata entry
        // results[index]['ppa_geodata'] = JSON.parse(results[index].ppa_geodata);

        // re-arrange to GeoJSON Format
        results[index].type = "Feature";

        results[index].properties = {};
        results[index].properties.ppa_geodata = JSON.parse(results[index].ppa_geodata);
        results[index].properties.ppa_address = results[index].ppa_address;
        results[index].properties.type_of_ppa = results[index].type_of_ppa;

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

    res.render('pages/map', {
      statecode: req.session.statecode,
      servicestate: req.session.servicestate,
      mapdata: JSON.stringify(results)
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

app.post('/contact', function (req, res) {
  console.log('the message', req.body);
  res.render('pages/contact');
});

app.get('/signup', function (req, res) {
  res.set('Content-Type', 'text/html');
  // res.sendFile(__dirname + '/register.html');
  res.render('pages/register');
});

// somehow logout doesn't work because the app/broswer doesn't go through app.get('/user/:who') when the back button is clicked after loggin out socket.io('/user) picks up the request first ...somehow

// find a more authentic way to calculate the numbers of corpers online using io(/user) --so even if they duplicate pages, it won't double count

var iouser = io.of('/user').on('connection', function (socket) { // when a new user is in the TIMELINE

  socket.join(socket.handshake.query.statecode.substring(0, 2));
  // console.log('how many', users.connected);
  socket.on('ferret', (asf, name, fn) => {
    // this funtion will run in the client to show/acknowledge the server has gotten the message.
    fn('woot ' + name + asf);
  });
  socket.emit('callback', { this: 'is the call back' });

  // find a way so if the server restarts (maybe because of updates and changes to this file) and the user happens to be in this URL log the user out of this url
  // console.log('well', socket.handshake.query.last_post, isEmpty(socket.handshake.query.last_post) );

  // console.log('socket.id: ', socket.id, ' connected on', new Date(Date.now()).toGMTString());
  // console.log('everythin: \n', iouser.connected );

  // console.log('\nsocket.handshake.query.statecode.substring(0, 2)?', socket.handshake.query.statecode.substring(0, 2));
  // it's still not very perfect, count each unique url or something
  iouser.emit('corpersCount', { count: Object.keys(iouser.connected).length /* new Map(iouser.connected).size || Object.keys(iouser.connected).length */ }); // emit total corpers online https://stackoverflow.com/questions/126100/how-to-efficiently-count-the-number-of-keys-properties-of-an-object-in-javascrip

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
  var getpostsquery = "SELECT * FROM posts WHERE statecode LIKE '%" + socket.handshake.query.statecode.substring(0, 2) + "%'" + (pUTL.length > 1 ? ' AND post_time > "' + pUTL[pUTL.length - 1] + '" ORDER by posts.post_time ASC' : ' ORDER by posts.post_time ASC')
    + "; SELECT * FROM accommodations WHERE statecode LIKE '%" + socket.handshake.query.statecode.substring(0, 2) + "%'" + (aUTL.length > 1 ? ' AND input_time > "' + e + '" ORDER by accommodations.input_time ASC' : ' ORDER BY accommodations.input_time ASC');
  pool.query(getpostsquery, function (error, results, fields) { // bring the results in ascending order

    if (error) { // gracefully handle error e.g. ECONNRESET & ETIMEDOUT, in this case re-execute the query or connect again, act approprately
      console.log('>>>>>>****', error);
      throw error;
    }


    else if (!isEmpty(results[0]) || !isEmpty(results[1])) { // formerly !isEmpty(results) but results is [[...], [...]]
      // console.log('posts', results);

      // FOR THE POSTS - sales
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

            value.media = (value.media.substring(0, 23) === "https://api.mapbox.com/" ? [value.media] : value.media.split(',')); // make only the url be in the array && we can't use .split(',') because there's ','s in the url

            // ---this logic is expensive and buggy
            /* // if what we stored is a map link, ie. a url...
            try {
              value.media = new URL(value.media).toString();
            } catch (error) { // if it isn't
              value.media = value.media.split(',');
            } */

          }

          // send the posts little by little, or in batches so it'll be faster.

          socket.emit('boardcast message', { to: 'be received by everyoneELSE', post: value });

          // console.log('sent BCs'); // commented here out so we don't flood the output with too much data, uncomment when you're doing testing.
        }
      );


      // FOR THE ACCOMMODATIONS - accommodations
      Object.entries(results[1]).forEach(
        ([key, value]) => {

          //fix the time here too by converting the retrieved post_time colume value to number because SQL converts the value to string when saving (because we are using type varchar to store the data-number value)

          // value.age = moment(new Date(value.input_time)).fromNow();
          value.age = moment(value.post_time || new Date(value.input_time)) // remove new Date(value.input_time) later
            .fromNow();
          // console.log('acc v:', value);
          socket.emit('boardcast message', { to: 'be received by everyoneELSE', post: value });

        }
      );

    } else {
      socket.emit('boardcast message', { to: 'be received by everyoneELSE', post: {} });
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

        socket.in(socket.handshake.query.statecode.substring(0, 2)).emit('boardcast message', { to: 'be received by everyoneELSE', post: data });
      }
    });

    // this funtion will run in the client to show/acknowledge the server has gotten the message.
    fn(data.post_time);
  });

  socket.on('disconnect', function () {
    iouser.emit('corpersCount', { count: Object.keys(iouser.connected).length }); // todo the disconnected socket should boardcast, let's not waste things and time abeg
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
    }


    else if (!isEmpty(results)) {
      // res.json({er: 'er'}); // auto sets content-type header with the correct content-type
      // res.send({ user: 'tobi' });
      console.log('\n[=', results.length, results)
      // res.status(200).send({ data: {ppas: ppa, accommodations: acc} }); // {a: acc, p: ppa}

      if (req.query.s) {
        var thisisit = { data: { ppas: results[1], accommodations: results[0] } };
      } else {
        var thisisit = { data: {} };
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
  let allslga = fs.readFileSync('moreplaces.json'); // maybe use the async .readFile('', (err, data) => {})
  let fjk = JSON.parse(allslga);
  
  if (req.session.loggedin) {
    var jn = req.session.statecode.toUpperCase()
    
    /**an array of all the local government in the state */
    var lgas = fjk.states[states_short.indexOf(jn.slice(0, 2))][ states_long[states_short.indexOf(jn.slice(0, 2))] ] ;
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

});

app.post('/profile', bodyParser.urlencoded({ extended: true/* , type: 'application/x-www-form-urlencoded' */ }), function (req, res) {
  // cater for fields we already have, so that we don't touch them eg. servicestate
  // UPDATE 'info' SET 'firstname'=[value-1],'lastname'=[value-2],'accomodation_location'=[value-3],'servicestate'=[value-4],'batch'=[value-5],'name_of_ppa'=[value-6],'statecode'=[value-7],'email'=[value-8],'middlename'=[value-9],'password'=[value-10],'phone'=[value-11],'dateofreg'=[value-12],'lga'=[value-13],'city_town'=[value-14],'region_street'=[value-15],'stream'=[value-16],'type_of_ppa'=[value-17],'ppa_address'=[value-18],'travel_from_state'=[value-19],'travel_from_city'=[value-20],'spaornot'=[value-21] WHERE email = req.body.email
  // UPDATE info SET 'accomodation_location'=req.body.accomodation_location,'servicestate'=req.body.servicestate,'name_of_ppa'=[value-6],'lga'=req.body.lga,'city_town'=req.body.city_town,'region_street'=req.body.region_street,'stream'=req.body.stream,'type_of_ppa'=req.body.type_of_ppa,'ppa_address'=req.body.ppa_address,'travel_from_state'=req.body.travel_from_state,'travel_from_city'=req.body.travel_from_city,'spaornot'=req.body.spaornot WHERE email = req.body.email
  // var sqlquery = "INSERT INTO info(servicestate, lga, city_town, region_street, stream, accomodation_location, type_of_ppa, travel_from_state, travel_from_city) VALUES ('" + req.body.servicestate + "', '" + req.body.lga + "', '" + req.body.city_town + "', '" + req.body.region_street + "', '" + req.body.stream + "', '" + req.body.accomodation_location + "', '" + req.body.type_of_ppa + "', '" + req.body.travel_from_state + "', '" + req.body.travel_from_city + "', '" + req.body.spaornot + "' )";

  // var sqlquery = "UPDATE info SET accomodation_location = '" + req.body.accomodation_location + "', servicestate = '" + req.body.servicestate + "', name_of_ppa = '" + req.body.name_of_ppa + "', lga = '" + req.body.lga + "', city_town = '" + req.body.city_town + "', region_street = '" + req.body.region_street + "',   stream = '" + req.body.stream + "' , type_of_ppa = '" + req.body.type_of_ppa + "', ppa_address = '" + req.body.ppa_address + "', travel_from_state = '" + req.body.travel_from_state + "', travel_from_city = '" + req.body.travel_from_city + "', spaornot = '" + req.body.spaornot + "' WHERE email = '" + req.body.email + "' " ;

  /*[req.body.accomodation_location, req.body.servicestate, req.body.name_of_ppa, req.body.lga, req.body.city_town, req.body.region_street, req.body.stream, req.body.type_of_ppa, req.body.ppa_address, req.body.travel_from_state, req.body.travel_from_city, req.body.spaornot, req.body.email],*/
  console.log('\n\nthe req.body for /newprofile', req.body, '\n\n', req.body.statecode);
  // console.log('\n\n', req);
  var sqlquery = "UPDATE info SET accommodation_location = '" + (req.body.accommodation_location ? req.body.accommodation_location : '') +
    "', servicestate = '" + req.body.ss + "', name_of_ppa = '" + req.body.name_of_ppa +
    "', lga = '" + req.body.lga + "', city_town = '" + req.body.city_town + "', region_street = '" +
    req.body.region_street + "',   stream = '" + req.body.stream + "' , type_of_ppa = '" +
    req.body.type_of_ppa + "', ppa_geodata = '" + (req.body.ppa_geodata ? req.body.ppa_geodata : null) + "', ppa_address = '" + req.body.ppa_address + "', travel_from_state = '" +
    req.body.travel_from_state + "', travel_from_city = '" + req.body.travel_from_city +
    /* "', accommodationornot = '" + (req.body.accommodationornot ? req.body.accommodationornot : 'yes') + */ "', wantspaornot = '" +
    req.body.wantspaornot + "' WHERE statecode = '" + req.session.statecode.toUpperCase() + "' "; // always change state code to uppercase, that's how it is in the db


  pool.query(sqlquery, function (error, results, fields) {
    console.log('updated user profile data: ', results);
    if (error) throw error;
    // go back to the user's timeline
    if (results.changedRows === 1 && !isEmpty(req.body)) {
      /* 
      // todo later...

      statecode: req.session.statecode.toUpperCase(),
      servicestate: req.session.servicestate,
      batch: req.session.batch, */
      req.session.name_of_ppa = req.body.name_of_ppa;
      res.status(200).redirect(req.session.statecode.toUpperCase() /* + '?e=y' */); // [e]dit=[y]es|[n]o
      // res.sendStatus(200);
    } else {
      // res.sendStatus(500);
      res.status(500).redirect('/newprofile' + '?e=n'); // [e]dit=[y]es|[n]o
    }
  });

});

app.post('/addplace', function (req, res) {
  // handle post request, add data to database.
  console.log('came here /addplace');
});

app.post('/posts', upload.array('see', 12), function (req, res, next) {
  // handle post request, add data to database... do more

  var sqlquery = "INSERT INTO posts( media, statecode, type, text, price, location, post_time) VALUES ('" + (req.files.length > 0 ? [...new Set(req.files.map(x => x.filename))] : '') + "','" + req.session.statecode + "', '" + (req.body.type ? req.body.type : "sale") + "', " + pool.escape(req.body.text) + ", " + pool.escape((req.body.price ? req.body.price : "")) + ", " + pool.escape(req.session.location) + ",'" + req.body.post_time + "')"

  pool.query(sqlquery, function (error, results, fields) {
    console.log('inserted data from: ', results);
    if (error) throw error;
    // connected!
    if (results.affectedRows === 1) {
      // then status code is good
      res.sendStatus(200);

      // once it saves in db them emit to other users
      iouser.to(req.session.statecode.substring(0, 2)).emit('boardcast message', {
        to: 'be received by everyoneELSE', post: {
          statecode: req.session.statecode,
          location: req.session.location,
          media: (req.files.length > 0 ? [...new Set(req.files.map(x => x.filename))] : false),
          post_time: req.body.post_time,
          type: req.body.type,
          text: req.body.text,
          age: moment(Number(req.body.post_time)).fromNow(),
          price: (req.body.price ? req.body.price : '')
        }
      });
    } else {
      // this is really important for the form to get response
      res.sendStatus(500);
      // === res.status(500).send('Internal Server Error')
    }
  });


});

app.post('/signup', bodyParser.urlencoded({ extended: true }), function (req, res) {
  // handle post request, add data to database.
  // implement the hashing of password before saving to the db
  // also when some one signs up, it counts as login time too, so we should include it in usage details table

  // we can find the service state with req.body.statecode.slice(0, 2) which gives the first two letters

  /**
  *   Either one of 
  *   ['AB', 'AD', 'AK', 'AN', 'BA', 'BY', 'BN', 'BO', 'CR', 'DT', 'EB', 'ED', 'EK', 'EN', 'FC', 'GM', 'IM', 'JG', 'KD', 'KN', 'KT', 'KB', 'KG', 'KW', 'LA', 'NS', 'NG', 'OG', 'OD', 'OS', 'OY', 'PL', 'RV', 'SO', 'TR', 'YB', 'ZM'] ;
      
      ['ABIA', 'ADAMAWA', 'AKWA IBOM', 'ANAMBRA', 'BAUCHI', 'BAYELSA', 'BENUE', 'BORNO', 'CROSS RIVER', 'DELTA', 'EBONYI', 'EDO', 'EKITI', 'ENUGU', 'FCT - ABUJA', 'GOMBE', 'IMO', 'JIGAWA', 'KADUNA', 'KANO', 'KASTINA', 'KEBBI', 'KOGI', 'KWARA', 'LAGOS', 'NASSARAWA', 'NIGER', 'OGUN', 'ONDO', 'OSUN', 'OYO', 'PLATEAU', 'RIVERS', 'SOKOTO', 'TARABA', 'YOBE', 'ZAMFARA'] ;
  */

  var theservicestate = states_long[states_short.indexOf(req.body.statecode.slice(0, 2).toUpperCase())];

  var thestream = req.body.statecode.slice(5, 6).toUpperCase();
  function getstream(sb) {
    return sb == 'A' ? 1
      : sb == 'B' ? 2
        : sb == 'C' ? 3
          : 4; // because we're sure it's gonna be 'D'
  }

  var sqlquery = "INSERT INTO info(email, firstname, middlename, password, lastname, statecode, batch, servicestate, stream) VALUES ('" + req.body.email + "', '" + req.body.firstname + "', '" + req.body.middlename + "', '" + req.body.password + "', '" + req.body.lastname + "', '" + req.body.statecode.toUpperCase() + "', '" + req.body.statecode.slice(3, 6).toUpperCase() + "', '" + theservicestate + "' , '" + getstream(thestream) + "'  )";
  pool.query(sqlquery, function (error, results, fields) {
    console.log('inserted data from: ', results);
    if (error) {
      console.log('the error code:', error.code)
      switch (error.code) { // do more here
        case 'ER_DUP_ENTRY': // ER_DUP_ENTRY if a statecode exists already
          res.redirect('/signup?m=d'); // [m]essage = [d]uplicate
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

      res.redirect(req.body.statecode.toUpperCase());
    }
  });

});

/*
function handleRedirect(req, res) {
  
}
*/
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

        /** When using the "single"
         data come in "req.file" regardless of the attribute "name". 
        **/
        var tmp_path = value.path;

        /** The original name of the uploaded file
            stored in the variable "originalname".
        **/
        var target_path = 'img/' + value.originalname;

        /** A better way to copy the uploaded file. **/
        var src = fs.createReadStream(tmp_path);
        var dest = fs.createWriteStream(target_path);
        src.pipe(dest);

        src.on('end', function () {
          // res.render('complete');
          console.log('complete, pushing', value.originalname);

          arraymedia.push(value.originalname); // returns a number!

          // when we're done, insert in db and emit to other users

          console.log('COMPARING key and req.files.length', key + 1, req.files.length, ((parseInt(key) + 1) === req.files.length)); // key is a number with string data type,
          if (((parseInt(key) + 1) === req.files.length)) {
            console.log('media array null ?', arraymedia);
            var sqlquery = "INSERT INTO accommodations( statecode, streetname, type, price, media, rentrange, rooms, address, directions, tenure, expire, post_location, post_time) VALUES ('" +
              req.session.statecode + "', '" + req.body.streetname + "', '" + req.body.accommodationtype + "', '" + req.body.price + "', '" +
              arraymedia + "', '" + req.body.rentrange + "', '" + req.body.rooms + "','" + req.body.address + "','" + req.body.directions + "','" +
              req.body.tenure + "','" + (req.body.expiredate ? req.body.expiredate : null /**or '' */) + "', " + pool.escape(req.session.location) + ", " + pool.escape(req.body.post_time) + ")";

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
                  to: 'be received by everyoneELSE', post: {
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

app.post('/login', bodyParser.urlencoded({ extended: true }), function (req, res/*, handleRedirect*/) {
  // handle post request, validate data with database.
  // how to handle wrong password with right email or more rearly, right password and wrong password.
  var sqlquery = "SELECT name_of_ppa, lga, region_street, city_town, batch, servicestate, statecode FROM info WHERE statecode = '" + req.body.statecode.toUpperCase() + "' AND password = '" + req.body.password + "' ";
  pool.query(sqlquery, function (error1, results1, fields1) {
    //  console.log(req.body, req.body.statecode, req.body.password);
    // console.log('selected data from db, logging In...', results1); // error sometimes, maybe when there's no db conn: ...
    if (error1) {
      console.log('the error code:', error1.code)
      switch (error1.code) { // do more here
        case 'ER_ACCESS_DENIED_ERROR':

          break;
        case 'ECONNREFUSED':

          break;
        case 'PROTOCOL_CONNECTION_LOST':

          break;

        default:
          break;
      }
      throw error1;
    }
    // connected!
    if (isEmpty(results1)) {
      // res.sendStatus(406);

      // res.status(403);
      res.status(502).redirect('/login?l=n');
    } else if (results1.length === 1) {

      // console.log('req.session.id: ', req.session.id);
      // insert login time and session id into db for usage details
      pool.query("INSERT INTO session_usage_details( statecode, session_id, user_agent) VALUES ('" + req.body.statecode + "', '" + req.session.id + "', '" + req.headers["user-agent"] + "')", function (error2, results2, fields2) {

        if (error2) throw error2;

        if (results2.affectedRows === 1) {
          req.session.statecode = req.body.statecode.toUpperCase();
          req.session.batch = results1[0].batch;
          req.session.loggedin = true;
          req.session.servicestate = results1[0].servicestate;
          req.session.name_of_ppa = results1[0].name_of_ppa;
          req.session.location = req.session.servicestate + (results1[0].city_town ? ', ' + results1[0].city_town : '') /* + (results1[0].region_street ? ', ' + results1[0].region_street : '' ) */;

          res.redirect(req.body.statecode.toUpperCase());

        }

      });
    }
  });


});

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
    socket.broadcast.emit('boardcast message', { will: 'be received by everyoneELSE', msg: data, from: 'user ' + socket.client.id + ' online' });
  });
});


var iomap = io.of('/map').on('connection', function (socket) { // when a new user connects to the map

  socket.on('addplace', function (data) {

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
      }

      else if (!isEmpty(results)) {
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
          }
          else { // they must be offline
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
    chat.emit('hi!', { test: 'from chat', '/chat': 'will get, it ?' });

    // should know when who they are chatting with is online and when they are typing
  });

var news = io
  .of('/news')
  .on('connection', function (socket) {
    socket.emit('item', { news: 'item' });
  });

var about = io
  .of('/profile')
  .on('connection', function (socket) {
    socket.emit('item', { abt: 'item' });
  });

/*
socket.binary(value)
Specifies whether the emitted data contains binary. Increases performance when specified. Can be true or false.

socket.binary(false).emit('an event', { some: 'data' });
*/












// --- always last
app.use(function (req, res, next) {
  res.status(404).send("Sorry can't find that! If you could just go back, please, or go <a href='/'>home</a>. Thank You.")
});