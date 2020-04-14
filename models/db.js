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
    connectionLimit: 20 || process.env.DB_CONLIMIT,
    host: 'localhost' || process.env.DB_HOST_ONLINE || process.env.DB_HOST_LOCAL,
    user: 'connarts_ossai' || process.env.DB_USER,
    password: 'ossai\'spassword' || process.env.DB_PASSWORD,
    database: 'connarts_nysc' || process.env.DB_DATABASE,
    acquireTimeout: 1800000, // 10000 is 10 secs
    multipleStatements: true // it allows for SQL injection attacks if values are not properly escaped
});

connectionPool.on('acquire', function (connection) {
    console.log('Connection to DB with threadID %d acquired', connection.threadId);
});

module.exports = connectionPool;
