var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(80);
// WARNING: app.listen(80) will NOT work here!

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/chat', function (req, res) {
  res.sendFile(__dirname + '/chat.html');
});

app.get('/news', function (req, res) {
  res.sendFile(__dirname + '/news.html');
});

io.of('/').on('connection', function (socket) {// when a new user connects
  io.emit('this', { will: 'be received by everyone'});
  socket.emit('news', { hello: 'world' });//this particular socket (user) sends 'news' to everyone else excpet itself
  socket.on('my other event', function (data) {//when we receive 'my other event'
    console.log(data);
  });
});

var chat = io
  .of('/chat')
  .on('connection', function (socket) {
    socket.emit('a message', {
        that: 'only'
      , '/chat': 'will get'
    });
    chat.emit('a message', {
        everyone: 'in'
      , '/chat': 'will get'
    });
  });

var news = io
  .of('/news')
  .on('connection', function (socket) {
    socket.emit('item', { news: 'item' });
  });