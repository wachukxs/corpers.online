var express = require('express');
var http = require('http');
//var https = require('https');

var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();

var app = express();
var server = http.Server(app);

var cookieparser = require('cookieparser');
var session = require('express-session');
var morgan = require('morgan');

//io connects to the server
var io = require('socket.io')(server);
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'connarts_ossai',
  password : 'ossai\'spassword',
  database : 'connarts_nysc'
});


//then connecting
connection.connect(function(err) {
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
server.listen(8092 , function(){
  console.log('listening on *:8092');
});
// WARNING: app.listen(80) will NOT work here!

app.use(express.static('node_modules'));
app.use(express.static('js'));
app.use(express.static('css'));
app.use(express.static('img'));
app.use(express.static('ajuwaya2'));


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

var isEmpty = function(data) {
  if(typeof(data) === 'object'){
      if(JSON.stringify(data) === '{}' || JSON.stringify(data) === '[]'){
          return true;
      }else if(!data){
          return true;
      }
      return false;
  }else if(typeof(data) === 'string'){
      if(!data.trim()){
          return true;
      }
      return false;
  }else if(typeof(data) === 'undefined'){
      return true;
  }else{
      return false;
  }
}


app.use(session({
  secret: '"xiooi-=-09R$NDJ&("]]csd90',
  resave: false,
  saveUninitialized: true
}));




app.get('/', function (req, res) {
  //res.type('text/html');
  //res.contentType('*/*');
  res.sendFile(__dirname + '/index.html');
});

app.get('/user', function (req, res) {

if (req.session.user /*&& req.cookies.user_sid*/) {
      res.redirect('/login');
  } else {
    res.sendFile(__dirname + '/account.2.html');
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

app.post('/addplace', function(req, res){
  //handle post request, add data to database.
  console.log('came here /addplace');
  MongoClient.connect(url, {useNewUrlParser: true}, function (err, db) {
    let database = db.db('corpersonline');
    var collection = database.collection('places');
    // uncomment all the req.params in production code
    console.log(req.body);
    //collection.insert(doc2, {w:1}, function(err, result) {});
    collection.insertOne(req.body);
    console.log('one in!');
    db.close();
  });

});

app.post('/signup', function(req, res){
  //handle post request, add data to database.
  //implement the hashing of password before saving to the db

  var sqlquery = "INSERT INTO info(email, firstname, middlename, password, lastname, statecode) VALUES ('" + req.body.email + "', '" + req.body.firstname + "', '" + req.body.middlename + "', '" + req.body.password + "', '" + req.body.lastname + "', '" + req.body.statecode + "' )" ;
  connection.query(sqlquery, function (error, results, fields) {
    console.log('inserted data from: ', results);
    if (error) throw error;
    // connected!
    if (results.affectedRows == 1) {
      req.session.user = req.body ;
      z = req.body.email;
      res.redirect('/user');
    }
  });


  /*
  MongoClient.connect(url, {useNewUrlParser: true}, function (err, db) {
    let database = db.db('corpersonline');
    var collection = database.collection('corpers');
    // uncomment all the req.params in production code
    console.log(req.body);
    //collection.insert(doc2, {w:1}, function(err, result) {});
    //before we insert we have to check if such a record exists before.
    collection.insertOne(req.body);
    console.log('one in [corpers collection]!');
    db.close();
  });
  */




});
/*
function handleRedirect(req, res) {
  
}
*/

app.post('/login', function(req, res, /*handleRedirect*/){
  //handle post request, validate data with database.
  
  var sqlquery = "SELECT * FROM info WHERE email = '" + req.body.email + "' AND password = '" + req.body.password + "' " ;
  connection.query(sqlquery, function (error, results, fields) {
    console.log('selected data from db: ', results);
    if (error) throw error;
    // connected!
    if ( isEmpty(results) ) {
      res.status(502).send('could not log user in');
    } else {
      req.session.user = req.body ;
      z = req.body.email;
      res.redirect('/user');
    }
  });


  /*
  MongoClient.connect(url, {useNewUrlParser: true}, function (err, db) {
    let database = db.db('corpersonline');
    var collection = database.collection('corpers');
    // uncomment all the req.params in production code
    console.log(req.body);
    //collection.insert(doc2, {w:1}, function(err, result) {});
    ////////////change
    collection.find({email: req.body.email, password: req.body.password}, {email: 1, password: 1})
      .limit(1)
      .next(function(err, doc){
      // handle data
      console.log(doc); //doc can be null if it didn't exist.
      if (doc =! null) {
        //redirect
        db.close();
        res.redirect('/user');
      } else {
        db.close();
      }
      //if data exists:
      //res.sendFile(__dirname + '/user.html');

   }); //the second para is called projection, it just means that it returns only the statecode
    console.log('one in!');
  });
  */

});

app.get('/news', function (req, res) {
  res.sendFile(__dirname + '/news.html');
});

io.of('/').on('connection', function (socket) {// when a new user connects at all
  
  var send = { will: 'be received by everyoneELSE', userEmail: z, user: socket.client.id + ' came online @ ' + new Date(Date.now()).toLocaleString()  } ;
  socket.broadcast.emit('boardcast', send);
  console.log('we sent:' , send);
  //emit to everyone except the sending socket
  //socket.broadcast.emit('hey', {for: 'everyone else @' + new Date(Date.now()).toLocaleString() });

  //this particular socket (user) sends 'news' to everyone including self
  //socket.emit('news', { hello: 'world from ' + socket.client.id });

  //when we receive 'boardcast msg' from any connected socket
  socket.on('boardcast message', function (data) {
    console.log(data);

    //io.emit sends to EVERYONE
    socket.broadcast.emit('boardcast message', { will: 'be received by everyoneELSE', msg: data, from: 'user ' + socket.client.id + ' online'});
  });
});


var map = io.of('/map').on('connection', function (socket) {// when a new user connects to the map
  
  var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb://localhost:27017/";

  MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
    if (err) throw err;
    var dbo = db.db("corpersonline");
    dbo.collection("places").find({}).toArray(function(err, result) {
      if (err) throw err;

      //send result to client
      socket.emit('mapdata', { mapdata: result, from: socket.id + ' (yourself)' });
      console.log('\n sent map data as result');
      db.close();
    });
  });



  socket.on('addplace', function(data){
    console.log('emitted data to add to db');
    MongoClient.connect(url, {useNewUrlParser: true}, function (err, db) {
      let database = db.db('corpersonline');
      var collection = database.collection('places');
      // uncomment all the req.params in production code
      console.log(data);
      //collection.insert(doc2, {w:1}, function(err, result) {});
      collection.insertOne(data);
      console.log('one in from socket!');
      db.close();
    });
  })
});
//3321045157, eco bank, okporubi ogbe samuel

io.of('/signup').on('connection', function (socket) {// when a new user is in the signup page

  //when we receive 'signup request' from any connected socket
  socket.on('signup request', function (data) {
    console.log(data);

    //---------------insert into mongoDB
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("corpersonline");
      var d = { 
        firstname: data.firstname, 
        lastname: data.lastname, 
        email: data.email, 
        password: data.password, 
        statecode: data.statecode 
      };
      dbo.collection("corpers").insertOne(d, function(err, res) {
        if (err) {
          //try again and if it doesn't work, notify user to please try again.
          throw err;
        }
        console.log("1 corper registerd and 1 document inserted");
        db.close();
      });
    });
    //io.emit sends to EVERYONE
    socket.broadcast.emit('boardcast message', { will: 'be received by everyoneELSE', msg: 'new signup', from: 'user ' + socket.client.id + ' just registered, say hi!!!!!!! and share info.'});
  });
});




io.of('/login').on('connection', function (socket) {// when a new user is in the login page

  //when we receive 'login request' from any connected socket
  socket.on('login request', function (data) {
    console.log(data);

    //---------------find from mongoDB
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("corpersonline");
      var d = { 
        username: data.username, 
        password: data.password
      };
      //hash passwords later on. and find with the hash value
      dbo.collection('corpers').findOne(d, function(err, item){
        if (err) {
          //try again and if it doesn't work, notify user to please try again.
          throw err;
        }
        console.log("1 corper login-ed and 1 document searched");
        db.close();
      });
    });
    //io.emit sends to EVERYONE
    socket.broadcast.emit('boardcast message', { will: 'be received by everyoneELSE', msg: 'new login', from: 'user ' + socket.client.id + ' just registered, say hi!!!!!!! and share info.'});
  });
});



io.of('/user').on('connection', function (socket) {// when a new user is in the login page

  //when we receive 'cameOnline' from any connected socket
  socket.on('cameOnline', function (data) {
    console.log(data);

    //---------------find from mongoDB
    /*
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("corpersonline");
      var d = { 
        username: data.username, 
        password: data.password
      };
      //hash passwords later on. and find with the hash value
      dbo.collection('corpers').findOne(d, function(err, item){
        if (err) {
          //try again and if it doesn't work, notify user to please try again.
          throw err;
        }
        console.log("1 corper login-ed and 1 document searched");
        db.close();
      });
    });
    */
    //io.emit sends to EVERYONE
    socket.broadcast.emit('boardcast message', { will: 'be received by everyoneELSE', msg: 'new login', from: 'user ' + socket.client.id + ' just registered, say hi!!!!!!! and share info.'});
  });
});





var chat = io
  .of('/chat')
  .on('connection', function (socket) {
    socket.emit('a message', { that: 'only', '/chat': 'will get'});
    socket.emit('a message', { test: 'from socket', '/chat': 'will get, it ?'});

    //everyone, including self, in /chat will get it
    chat.emit('hi!', { test: 'from chat', '/chat': 'will get, it ?'});
    chat.emit('a message', { everyone: 'in', '/chat': 'will get'});
  });

var news = io
  .of('/news')
  .on('connection', function (socket) {
    socket.emit('item', { news: 'item' });
  });

  //-------------------mongo db

  