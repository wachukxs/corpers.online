const dotenv = require('dotenv'); // better to call first, before using process.env.*
dotenv.config();

const app = require('./web/app'); // Express
const http = require('http');

// Get port from environment and store in Express.
const port = parseInt(process.env.PORT, 10) || parseInt(process.env.LOCAL_PORT, 10) || 3000;
app.set('port', port); // necessary ?

// https://stackoverflow.com/a/12875087/9259701
app.locals.version = new Date().getFullYear();

// Create HTTP server.
const server = http.createServer(app);

// https://openclassrooms.com/en/courses/2504541-ultra-fast-applications-using-node-js/2505653-socket-io-let-s-go-to-real-time#/id/r-2505512
const io = require('./sockets/routes');
io.listen(server);

server.listen(port, () => { // auto change port if port is already in use, handle error gracefully
    console.log('node server running on %s mode, listening on port :%s', app.get('env'), port);
});
