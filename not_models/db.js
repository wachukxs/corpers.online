// 1st tutorial https://www.codementor.io/@mirko0/how-to-use-sequelize-with-node-and-express-i24l67cuz
const mysql = require('mysql2');

const { Sequelize } = require('sequelize');
// const sequelize = new Sequelize('postgres://btlnnbzltngela:19ed81ac999fb00a7137bb59a314a4fb2e087b8ad26a46ccb0280572059a46cb@ec2-52-5-247-46.compute-1.amazonaws.com:5432/dc46f9g2hh8hud') // Example for postgres
const sequelize = new Sequelize(process.env.SHARED_HOST_MYSQL_TEST_DB_NAME, process.env.SHARED_HOST_MYSQL_DB_USERNAME, process.env.SHARED_HOST_MYSQL_DB_PASSWORD, {
    host: process.env.SHARED_HOST, // 'localhost',
    dialect: 'mysql', // one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' 
    port: 3306, // postgre => 5432
    ssl: false,
    logging: (...opts) => console.log(opts, '\n\n'), // can really customize
    // retry: ,
    dialectOptions: { // https://stackoverflow.com/a/64960461/9259701
        ssl: {
          require: true, // This will help you. But you will see new error
          rejectUnauthorized: false // This line will fix new error
        }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    hooks: {
      
    }
}); // how do we catch global db errors

/**
 * we need to try to connect to one db first, if that doesn't work,
 * connect to the back up
 * we could also use them interchangably for back up db, and sync when one is up.
 */
sequelize.authenticate().then((e) => {
    console.log('made db connection from sequelize');
    // sequelize.close() // after retrying ?
}).catch((err) => {
    console.error('oopsy error connecting to db with Sequelize', err)
})

// sequelize.sync({ alter: true })

sequelize.getQueryInterface().showAllSchemas().then((tableObj) => {
  console.log('\n\n\n// Tables in database');
  console.log(tableObj);
})
.catch((err) => {
  console.log('showAllSchemas ERROR',err);
})

sequelize.getQueryInterface().showAllTables().then((_tables) => {
  console.log('\n\n\n\n all the tables', _tables, _tables.length, `total`);
}).catch(err => {
  console.error('err getting all tables', err);
})

sequelize.getQueryInterface().describeTable({
  tableName: 'CorpMembers'
}).then((_data) => {
  // console.log('\n\n\n\n CorpMembers table', _data);
}).catch(err => {
  console.error('err describing CorpMembers table', err);
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
  host: process.env.DB_HOST_ONLINE, // process.env.DB_HOST_LOCAL ||
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  // acquireTimeout: 1800000, // 10000 is 10 secs
  multipleStatements: true, // it allows for SQL injection attacks if values are not properly escaped
  debug: true,
});

connectionPool.on('acquire', function (connection) {
  console.log('Connection to DB with threadID %d acquired', connection.threadId);
});
connectionPool.on('error', function(err) {
  console.error('DB CONN ERR', err.code); // 'ER_BAD_DB_ERROR'
});


/**
 * Relationships [chats, ppa, location, corpers, images?, sale?, accommodation?, ]
 * 1. ppa.belongsToMany(Corper,{})
 */

module.exports = {
  //  Blog,
  //  Tag,
  connectionPool,
  sequelize,
  Sequelize
}

