const dotenv = require('dotenv'); // better to call first, before using process.env.*
dotenv.config();

const app = require('./web/app'); // Express
const http = require('http');

// Get port from environment and store in Express.
const port = parseInt(process.env.PORT, 10) || parseInt(process.env.LOCAL_PORT, 10) || 3051;
app.set('port', port); // necessary ?

app.locals.version = 1;

// Create HTTP server.
const server = http.createServer(app);

// https://openclassrooms.com/en/courses/2504541-ultra-fast-applications-using-node-js/2505653-socket-io-let-s-go-to-real-time#/id/r-2505512
const { io } = require('./sockets/routes');
io.attach(server, {
    cors: {
        origin: app.get('env') == 'production' ? 'https://corpers.ng' : 'http://localhost:4006',
        methods: ['GET', 'POST'],
        credentials: true,
    }
}); // knew this from https://blog.devgenius.io/integrating-socket-io-in-nodejs-application-8e6da4f5930e

// This works with socket-io-ngx in FE
/* const io = require('socket.io')(server);
const tSocket = (socket) => {
    console.log('New connection on.');
    socket.on('broadcast_message', (data, fn) => {
        console.log(socket.client.id + ' sent boardcast mesage on /user to everyone.');

        // fn(data?.post_time);
    });

    socket.on('hi', (msg) => {
        socket.emit('hi', `from server: ${msg}`);
    });
    socket.emit('hi', `from server 453:`);
    socket.emit('broadcast_message', `from server broadcast_message:`);

    io.emit('hi', `from server 000:`);
    socket.on('event', data => {});
    socket.on('disconnect', () => {});
}
io.on('connection', tSocket);
io.of('/corp-member').on('connection', tSocket); */


server.listen(port, () => { // auto change port if port is already in use, handle error gracefully
    console.log('node server running on %s mode, listening on port :%s', app.get('env'), port);
});
