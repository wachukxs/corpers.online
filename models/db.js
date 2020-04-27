const mysql = require('mysql');

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

const connectionPool = mysql.createPool({
    connectionLimit: process.env.DB_CONN_LIMIT,
    host: process.env.DB_HOST_LOCAL /* || process.env.DB_HOST_ONLINE */,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    acquireTimeout: 1800000, // 10000 is 10 secs
    multipleStatements: true // it allows for SQL injection attacks if values are not properly escaped
});

connectionPool.on('acquire', function (connection) {
    console.log('Connection to DB with threadID %d acquired', connection.threadId);
});
connectionPool.on('error', function(err) {
  console.log('DB CONN ERR', err.code); // 'ER_BAD_DB_ERROR'
});
module.exports = connectionPool;
