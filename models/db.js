const mysql = require('mysql');

const { Sequelize } = require('sequelize');
// const sequelize = new Sequelize('postgres://ycybyhpxgggjsi:bf8ea71d22303ee9d15c73a9316425f967f59cc2e3a9324d2ad9f8f28f7ac829@ec2-34-195-233-155.compute-1.amazonaws.com:5432/d1losi9983knq5') // Example for postgres
const sequelize = new Sequelize('d1losi9983knq5', 'ycybyhpxgggjsi', 'bf8ea71d22303ee9d15c73a9316425f967f59cc2e3a9324d2ad9f8f28f7ac829', {
    host: 'ec2-34-195-233-155.compute-1.amazonaws.com', // 'localhost',
    dialect: 'postgres', // one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' 
    port: 5432,
    ssl: true,
    logging: (...opts) => console.log(opts), // can really customize
    // retry: ,
    dialectOptions: { // https://stackoverflow.com/a/64960461/9259701
        ssl: {
          require: true, // This will help you. But you will see new error
          rejectUnauthorized: false // This line will fix new error
        }
    },
});

/**
 * we need to try to connect to one db first, if that doesn't work,
 * connect to the back up
 * we could also use them interchangably for back up db, and sync when one is up.
 */
sequelize.authenticate().then(() => {
    console.log('made postgre connection from sequelize');
    // sequelize.close() // after retrying ?
}).catch((err) => {
    console.error('oopsy error connecting to postgre db with Sequelize', err)
})


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
  host: /* process.env.DB_HOST_LOCAL || */ process.env.DB_HOST_ONLINE,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  acquireTimeout: 1800000, // 10000 is 10 secs
  multipleStatements: true, // it allows for SQL injection attacks if values are not properly escaped
  // debug: true,
});

connectionPool.on('acquire', function (connection) {
  console.log('Connection to DB with threadID %d acquired', connection.threadId);
});
connectionPool.on('error', function(err) {
  console.error('DB CONN ERR', err.code); // 'ER_BAD_DB_ERROR'
});

exports.connectionPool = connectionPool;
exports.sequelize = sequelize;
