var fs = require('fs');
var io = require('socket.io')(3000);
io.on('connection', function(socket){
    socket.emit('image', { image: true, buffer: buf });
});
fs.readFile('testimg/6.png', function (err, buf) {
    // it's possible to embed binary data
    // within arbitrarily-complex objects
    
    console.log(buf);
});