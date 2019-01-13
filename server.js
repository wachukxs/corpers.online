/*
this is what ran the server BEFORE:
    nohup npm start </dev/null &

    NOW it's:
    nohup node server.js </dev/null &

    (for some reason, after they crashed, npm can't install anythings neither will nodemon command run. I don't know what else is wrong.)
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
var upload = multer();

var app = express();
var server = http.Server(app);

//var cookieparser = require('cookieparser');
var session = require('express-session');
var morgan = require('morgan');
var moment = require('moment');
//moment().format(); //keeps on showing the current time 

//io connects to the server
var io = require('socket.io')(server);
var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'connarts_ossai',
  password: "ossai'spassword",
  database: 'connarts_nysc'
});

//NEVER FORGET TO ALWAYS HANDLE ERRORS GRACEFULLY
//then connecting
connection.connect(function (err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected to DB with/as id ' + connection.threadId);
});

/*
var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://localhost:27017/';
*/
server.listen(49252, function () {
  console.log('listening on *:49252');
});
// WARNING: app.listen(80) will NOT work here!

app.use(express.static('node_modules'));
app.use(express.static('js'));
app.use(express.static('css'));
app.use(express.static('img'));
app.use(express.static('testimg'));


// set morgan to log info about our requests for development use.
app.use(morgan('dev'));

// for parsing application/json
app.use(bodyParser.json());

// for parsing application/xwww-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// for parsing multipart/form-data
app.use(upload.array());


var z;
/**
 * https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
 * 
 * Meanwhile we can have one function that checks for all 'empties' like null, undefined, '', ' ', {}, [].
 */

var isEmpty = function (data) {
  if (typeof (data) === 'object') {
    if (JSON.stringify(data) === '{}' || JSON.stringify(data) === '[]') {
      return true;
    } else if (!data) {
      return true;
    }
    return false;
  } else if (typeof (data) === 'string') {
    if (!data.trim()) {
      return true;
    }
    return false;
  } else if (typeof (data) === 'undefined') {
    return true;
  } else {
    return false;
  }
}
//gracefully hangle 404 errors with express.js ----------------------------------------------------------------------------------------- we shouldn't see CANNOT ger /about or /profile etc.

app.use(session({
  secret: '"xiooi-=-09R$NDJ&("]]csd90',
  resave: false,
  saveUninitialized: true
}));


app.get('/', function (req, res) {
  res.type('text/html');
  //res.contentType('*/*');
  res.sendFile(__dirname + '/index.html');
});

// it doesn't come here when we press back!!!
app.get('/user/:who', function (req, res) {
  console.log('tryna login ', req.session.id, req.session.loggedin);
  if (req.session.loggedin) {
    res.set('Content-Type', 'text/html');
    res.sendFile(__dirname + '/account.2.html');
  } else {
    res.redirect('/login');
  }

});

app.get('/chat', function (req, res) {
  res.sendFile(__dirname + '/chat.html');
});

app.get('/map', function (req, res) {
  res.sendFile(__dirname + '/map.html');
});

app.get('/login', function (req, res) {
  res.sendFile(__dirname + '/login.html');
});

app.get('/signup', function (req, res) {
  res.sendFile(__dirname + '/register.html');
});

app.get('/map', function (req, res) {
  res.sendFile(__dirname + '/map.html');
});

app.get('/profile/:who', function (req, res) {
  if (req.session.loggedin) {
    res.set('Content-Type', 'text/html');
    res.sendFile(__dirname + '/profile.html');
  } else {
    res.redirect('/login');
  }

});

app.post('/profile', function (req, res) {
  //cater for fields we already have, so that we don't touch them eg. servicestate
  //UPDATE 'info' SET 'firstname'=[value-1],'lastname'=[value-2],'accomodation_location'=[value-3],'servicestate'=[value-4],'batch'=[value-5],'name_of_ppa'=[value-6],'statecode'=[value-7],'email'=[value-8],'middlename'=[value-9],'password'=[value-10],'phone'=[value-11],'dateofreg'=[value-12],'lga'=[value-13],'city_town'=[value-14],'region_street'=[value-15],'stream'=[value-16],'type_of_ppa'=[value-17],'ppa_address'=[value-18],'travel_from_state'=[value-19],'travel_from_city'=[value-20],'spaornot'=[value-21] WHERE email = req.body.email
  //UPDATE info SET 'accomodation_location'=req.body.accomodation_location,'servicestate'=req.body.servicestate,'name_of_ppa'=[value-6],'lga'=req.body.lga,'city_town'=req.body.city_town,'region_street'=req.body.region_street,'stream'=req.body.stream,'type_of_ppa'=req.body.type_of_ppa,'ppa_address'=req.body.ppa_address,'travel_from_state'=req.body.travel_from_state,'travel_from_city'=req.body.travel_from_city,'spaornot'=req.body.spaornot WHERE email = req.body.email
  //var sqlquery = "INSERT INTO info(servicestate, lga, city_town, region_street, stream, accomodation_location, type_of_ppa, travel_from_state, travel_from_city) VALUES ('" + req.body.servicestate + "', '" + req.body.lga + "', '" + req.body.city_town + "', '" + req.body.region_street + "', '" + req.body.stream + "', '" + req.body.accomodation_location + "', '" + req.body.type_of_ppa + "', '" + req.body.travel_from_state + "', '" + req.body.travel_from_city + "', '" + req.body.spaornot + "' )";

  //var sqlquery = "UPDATE info SET accomodation_location = '" + req.body.accomodation_location + "', servicestate = '" + req.body.servicestate + "', name_of_ppa = '" + req.body.name_of_ppa + "', lga = '" + req.body.lga + "', city_town = '" + req.body.city_town + "', region_street = '" + req.body.region_street + "',   stream = '" + req.body.stream + "' , type_of_ppa = '" + req.body.type_of_ppa + "', ppa_address = '" + req.body.ppa_address + "', travel_from_state = '" + req.body.travel_from_state + "', travel_from_city = '" + req.body.travel_from_city + "', spaornot = '" + req.body.spaornot + "' WHERE email = '" + req.body.email + "' " ;

  /*[req.body.accomodation_location, req.body.servicestate, req.body.name_of_ppa, req.body.lga, req.body.city_town, req.body.region_street, req.body.stream, req.body.type_of_ppa, req.body.ppa_address, req.body.travel_from_state, req.body.travel_from_city, req.body.spaornot, req.body.email],*/

  var sqlquery = "UPDATE info SET accomodation_location = '" + req.body.accomodation_location + "', servicestate = '" + req.body.servicestate + "', name_of_ppa = '" + req.body.name_of_ppa + "', lga = '" + req.body.lga + "', city_town = '" + req.body.city_town + "', region_street = '" + req.body.region_street + "',   stream = '" + req.body.stream + "' , type_of_ppa = '" + req.body.type_of_ppa + "', ppa_address = '" + req.body.ppa_address + "', travel_from_state = '" + req.body.travel_from_state + "', travel_from_city = '" + req.body.travel_from_city + "', spaornot = '" + req.body.spaornot + "' WHERE email = '" + req.body.email + "' ";

  connection.query(sqlquery, function (error, results, fields) {
    console.log('updated user profile data: ', results);
    if (error) throw error;
    // go back to the user's timeline
    if (results.changedRows == 1) {
      res.redirect('/user/' + req.body.email);
    }
  });

});

app.post('/addplace', function (req, res) {
  //handle post request, add data to database.
  console.log('came here /addplace');


});


app.post('/signup', function (req, res) {
  //handle post request, add data to database.
  //implement the hashing of password before saving to the db
  //also when some one signs up, it counts as login time too, so we should include it in usage details table

  //we can find the service state with req.body.statecode.slice(0, 2) which gives the first two letters

  /**
  *
  *   ['AB', 'AD', 'AK', 'AN', 'BA', 'BY', 'BN', 'BO', 'CR', 'DT', 'EB', 'ED', 'EK', 'EN', 'FC', 'GM', 'IM', 'JG', 'KD', 'KN', 'KT', 'KB', 'KG', 'KW', 'LA', 'NS', 'NG', 'OG', 'OD', 'OS', 'OY', 'PL', 'RV', 'SO', 'TR', 'YB', 'ZM'] ;
      
      ['ABIA', 'ADAMAWA', 'AKWA IBOM', 'ANAMBRA', 'BAUCHI', 'BAYELSA', 'BENUE', 'BORNO', 'CROSS RIVER', 'DELTA', 'EBONYI', 'EDO', 'EKITI', 'ENUGU', 'FCT - ABUJA', 'GOMBE', 'IMO', 'JIGAWA', 'KADUNA', 'KANO', 'KASTINA', 'KEBBI', 'KOGI', 'KWARA', 'LAGOS', 'NASSARAWA', 'NIGER', 'OGUN', 'ONDO', 'OSUN', 'OYO', 'PLATEAU', 'RIVERS', 'SOKOTO', 'TARABA', 'YOBE', 'ZAMFARA'] ;
  */

  var s01 = ['AB', 'AD', 'AK', 'AN', 'BA', 'BY', 'BN', 'BO', 'CR', 'DT', 'EB', 'ED', 'EK', 'EN', 'FC', 'GM', 'IM', 'JG', 'KD', 'KN', 'KT', 'KB', 'KG', 'KW', 'LA', 'NS', 'NG', 'OG', 'OD', 'OS', 'OY', 'PL', 'RV', 'SO', 'TR', 'YB', 'ZM'];

  var s02 = ['ABIA', 'ADAMAWA', 'AKWA IBOM', 'ANAMBRA', 'BAUCHI', 'BAYELSA', 'BENUE', 'BORNO', 'CROSS RIVER', 'DELTA', 'EBONYI', 'EDO', 'EKITI', 'ENUGU', 'FCT - ABUJA', 'GOMBE', 'IMO', 'JIGAWA', 'KADUNA', 'KANO', 'KASTINA', 'KEBBI', 'KOGI', 'KWARA', 'LAGOS', 'NASSARAWA', 'NIGER', 'OGUN', 'ONDO', 'OSUN', 'OYO', 'PLATEAU', 'RIVERS', 'SOKOTO', 'TARABA', 'YOBE', 'ZAMFARA'];

  var theservicestate = s02[s01.indexOf(req.body.statecode.slice(0, 2))];

  var sqlquery = "INSERT INTO info(email, firstname, middlename, password, lastname, statecode, batch, servicestate) VALUES ('" + req.body.email + "', '" + req.body.firstname + "', '" + req.body.middlename + "', '" + req.body.password + "', '" + req.body.lastname + "', '" + req.body.statecode + "', '" + req.body.statecode.slice(3, 6) + "', '" + theservicestate + "'  )";
  connection.query(sqlquery, function (error, results, fields) {
    console.log('inserted data from: ', results);
    if (error) throw error;
    // connected!
    if (results.affectedRows == 1) {
      req.session.user = req.body;
      req.session.loggedin = true;
      res.redirect('/user/' + req.body.email);
    }
  });

});

/*
function handleRedirect(req, res) {
  
}
*/

app.post('/login', function (req, res/*, handleRedirect*/) {
  //handle post request, validate data with database.
  //how to handle wrong password with right email or more rearly, right password and wrong password.
  var sqlquery = "SELECT email, password FROM info WHERE email = '" + req.body.email + "' AND password = '" + req.body.password + "' ";
  connection.query(sqlquery, function (error, results, fields) {
    console.log('selected data from db, logging In.', results[0]);
    if (error) throw error;
    // connected!
    if (isEmpty(results)) {
      //res.status(502).send('could not log in, wrong login details, try again.');
      res.status(502).redirect('/login?l=n');
    } else {


      console.log('12345 ', req.session.id);
      //insert login time and session id into db for usage details
      connection.query("INSERT INTO session_usage_details( email, session_id, user_agent) VALUES ('" + req.body.email + "', '" + req.session.id + "', '" + req.headers["user-agent"] + "')", function (error, results, fields) {

        if (error) throw error;

        if (results.affectedRows == 1) {

          req.session.loggedin = true;

          res.redirect('/user/' + req.body.email);


        }

      });
    }
  });


});

app.get('/logout', function (req, res) {
  //handle post request, add data to database.
  console.log('came here /logout for ', req.session.id);
  req.session.loggedin = false;
  res.redirect('/');

});

app.get('/news', function (req, res) {
  res.sendFile(__dirname + '/news.html');
});

io.of('/').on('connection', function (socket) {// when a new user connects at all

  //emit to everyone except the sending socket
  //socket.broadcast.emit('hey', {for: 'everyone else @' + new Date(Date.now()).toLocaleString() });

  //this particular socket (user) sends 'news' to everyone including self
  //socket.emit('news', { hello: 'world from ' + socket.client.id });

  //when we receive 'boardcast msg' from any connected socket
  socket.on('boardcast message', function (data) {

    //io.emit sends to EVERYONE
    socket.broadcast.emit('boardcast message', { will: 'be received by everyoneELSE', msg: data, from: 'user ' + socket.client.id + ' online' });
  });
});


var map = io.of('/map').on('connection', function (socket) {// when a new user connects to the map


  socket.on('addplace', function (data) {

  })
});
//3321045157, eco bank, okporubi ogbe samuel



io.of('/signup').on('connection', function (socket) {// when a new user is in the signup page

});




io.of('/login').on('connection', function (socket) {// when a new user is in the login page


  //when we receive 'login request' from any connected socket
  socket.on('login request', function (data) {
    console.log(data);
  });


});


//somehow logout doesn't work because the app/broswer doesn't go through app.get('/user/:who') when the back button is clicked after loggin out socket.io('/user) picks up the request first ...somehow

var countCorpersOnline = 0;
//find a more authentic way to calculate the numbers of corpers online using io(/user) --so even if they duplicate pages, it won't double count

var users = io.of('/user').on('connection', function (socket) { // when a new user is in the login page

  socket.on('ferret', (asf, name, fn) => {
      //this funtion will run in the client to show/acknowledge the server has gotten the message.
      fn('woot ' + name + asf );
    });
  socket.emit('callback', {this: 'is the call back'});
  
  //find a way so if the server restarts (maybe because of updates and changes to this file) and the user happens to be in this URL log the user out of this url
  //console.log('well', socket.handshake.query.last_post, isEmpty(socket.handshake.query.last_post) );
  console.log('connected', new Date(Date.now()).toLocaleString(), Date.now());
  users.emit('corpersCount', { count: ++countCorpersOnline });

  console.log('connected on socket /user ', socket.id);

  //find a way to work with cookies in socket.request.headers object for loggining in users again


  connection.query("SELECT * FROM info WHERE email = '" + socket.handshake.query.user + "' ", function (error, results, fields) {
    console.log('profile for ', socket.handshake.query.user);
    if (error) throw error;

    if (!isEmpty(results)) {
      //the results is an array object (of object datatype) of all the results from the db and we need only the 1st one.
      socket.emit('corper profile', { to: 'be received by just this user socket only', post: results[0] });
    }
  });

  //logot out time SELECT TIMESTAMPDIFF(MINUTE , session_usage_details.login_time , session_usage_details.logout_time) AS time
  //--------------------------------------------------------------------------- optimize by running the two seperate queries (above & below) in parallel later

  //when any user connects, send them (previous) posts in the db before now (that isn't in their timeline)
  //find a way to handle images and videos
  /**sender, statecode, type, text, price, location, post_time, input_time */

  // posts currently in user's time line is socket.handshake.query.utl.split(',')
  console.log('socket query parameter(s) [user_tl]', socket.handshake.query.utl.split(',').length);
  var UTL = socket.handshake.query.utl.split(',');
  // SELECT * FROM posts WHERE post_time > 1545439085610 ORDER BY posts.post_time ASC (selects posts newer than 1545439085610 | or posts after 1545439085610)
  
  // right now, this query selects newer posts always | ''.split(',') returns a query with length 1 where the first elemeent is an empty string
  // ordering by ASC starts from oldest, so the first result is the oldest post.

  //so we're selecting posts newer than the ones currently in the user's timeline.
  connection.query("SELECT * FROM posts " + (UTL.length > 1 ? 'WHERE post_time > ' + UTL[UTL.length - 1] + ' ORDER by posts.post_time ASC' : ' ORDER by posts.post_time ASC'/**bring the results in ascending order*/), function (error, results, fields) {

    if (error) throw error;

    if (!isEmpty(results)) {

      Object.entries(results).forEach(
        ([key, value]) => {
          //console.log( 'post number ' + key, value.text);

          //fix the time here too by converting the retrieved post_time colume value to number because SQL converts the value to string when saving (because we are using type varchar to store the data-number value)
          value.age = moment(Number(value.post_time)).fromNow();

          //if there is image(s) in the post we're sending to user from db then convert it to array. 
          if (value.images) {
            value.images = value.images.split('  ');
          }

          users.emit('boardcast message', { to: 'be received by everyoneELSE', post: value });
          // console.log('sent BCs'); // commented here out so we don't flood the output with too much data, uncomment when you're doing testing.
        }
      );

    }
  });



  socket.on('boardcast message', function (data, fn) {
    console.log(socket.client.id + ' sent boardcast mesage on /user to everyone.');

    data.age = moment(data.post_time).fromNow();

    //if there are images in the post user boardcasted, before we save them to db, convert to string with double spaces ( '  ' ) between each image
    if (data.images) {

      var q = '';
      var l = data.images.length;
      data.images.forEach(function (item, index, array) {
        //console.log(item, index);
        q = (l == index + 1 ? q.concat(item) : q.concat(item + '  '));
      });

    }

    //save to db --put picture in different columns // increse packet size for media (pixs and vids)                                                                                                                & when using connection.escape(data.text), there's no need for the enclosing from                 incase the user has ' or any funny characters
    connection.query("INSERT INTO posts( sender, statecode, type, text, images, price, location, post_time) VALUES ('" + data.sender + "', '" + (data.statecode ? data.statecode : "") + "', '" + (data.type ? data.type : "") + "', " + connection.escape(data.text) + ", '" + (data.images ? q : "") + "', " + connection.escape(data.price) + ", " + connection.escape(data.location) + ",'" + (data.post_time ? data.post_time : "") + "')", function (error, results, fields) {

      if (error) throw error;

      if (results.affectedRows == 1) {
        console.info('saved post to db successfully');

        users.emit('boardcast message', { to: 'be received by everyoneELSE', post: data });
      }
    });

    //this funtion will run in the client to show/acknowledge the server has gotten the message.
    fn(true);
  });

  socket.on('disconnect', function () {
    users.emit('corpersCount', { count: --countCorpersOnline });
  });

});




var chat = io
  .of('/chat')
  .on('connection', function (socket) {
    socket.emit('a message', { that: 'only', '/chat': 'will get' });
    socket.emit('a message', { test: 'from socket', '/chat': 'will get, it ?' });

    //everyone, including self, in /chat will get it
    chat.emit('hi!', { test: 'from chat', '/chat': 'will get, it ?' });
    chat.emit('a message', { everyone: 'in', '/chat': 'will get' });
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
