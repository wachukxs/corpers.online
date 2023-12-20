var express = require('express');
var http = require('http');
//var https = require('https');

var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();

var app = express();
var server = http.Server(app);

//io connects to the server
var io = require('socket.io')(server);
//var MongoClient = require('mongodb').MongoClient;
const mysql = require('mysql');



server.listen(8092 , function(){
  console.log('listening on *:8092');
});
// WARNING: app.listen(80) will NOT work here!


const db = mysql.createConnection ({
  host: 'localhost',
  user: 'root',
  password: "",
  database: 'connarts_nysc'
});


//var url = 'mongodb://localhost:27017/';


app.use(express.static('node_modules'));
app.use(express.static('js'));
app.use(express.static('css'));
app.use(express.static('img'));
app.use(express.static('ajuwaya2'));

// for parsing application/json
app.use(bodyParser.json()); 

// for parsing application/xwww-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true })); 

// for parsing multipart/form-data
app.use(upload.array()); 

app.get('/', function (req, res) {
  //res.type('text/html');
  //res.contentType('*/*');
  res.sendFile(__dirname + '/index.html');
});

//remove this later
app.get('/user', function (req, res) {
  res.sendFile(__dirname + '/account.2.html');
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

  /*
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
  */

});

app.post('/signup', function(req, res){
  //handle post request, add data to database.
  console.log('came here /signup');

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

  // connect to database
  db.connect((err) => {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
   
    console.log('connected TO DATABASE as id ' + db.threadId);
  });
  //global.db = db;

  // insert statment
  var sql = "INSERT INTO info (last_name, first_name, email, password, state_code) VALUES ('"+ req.body.last_name +"','"+ req.body.first_name +"','"+ req.body.email +"','"+ req.body.password +"','"+ req.body.state_code +"')";

  db.query(sql, function (error, results, fields) {

    //handle error more effectively
    //if (error) throw error;
    console.log('Inserted ', results);
    if (results.affectedRows == 1) {
      //redirect
      db.end();
      res.redirect('/user');
    }
  });
  

});
/*
function handleRedirect(req, res) {
  
}
*/

app.post('/login', function(req, res, /*handleRedirect*/){
  //handle post request, validate data with database.
  console.log('came here /login');

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

   }); //the second para is called projection, it just means that it returns only the state_code
    console.log('one in!');
  });
  */

});

app.get('/news', function (req, res) {
  res.sendFile(__dirname + '/news.html');
});

io.of('/').on('connection', function (socket) {// when a new user connects
  
  var send = { will: 'be received by everyoneELSE', user: socket.client.id + ' came online @ ' + new Date(Date.now()).toLocaleString()  } ;
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
  
  /*
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
  */



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


    /*
    //---------------insert into mongoDB
    MongoClient.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("corpersonline");
      var d = { 
        first_name: data.first_name, 
        last_name: data.last_name, 
        email: data.email, 
        password: data.password, 
        state_code: data.state_code 
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
    */
    //io.emit sends to EVERYONE
    socket.broadcast.emit('boardcast message', { will: 'be received by everyoneELSE', msg: 'new signup', from: 'user ' + socket.client.id + ' just registered, say hi!!!!!!! and share info.'});
  });
});




io.of('/login').on('connection', function (socket) {// when a new user is in the login page

  //when we receive 'login request' from any connected socket
  socket.on('login request', function (data) {
    console.log(data);



    /*
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

  