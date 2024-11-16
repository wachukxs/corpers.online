const fs = require('fs');
const chalk = require("chalk");
const dotenv = require('dotenv'); // better to call first, before using process.env.*
dotenv.config();

module.exports = {
  development: {
    "username": process.env.LOCAL_MYSQL_DB_USERNAME,
    "user": process.env.LOCAL_MYSQL_DB_USERNAME, // knex uses 'user'
    "password": process.env.LOCAL_MYSQL_DB_PASSWORD,
    "database": process.env.LOCAL_MYSQL_DEV_DB_NAME,
    "host": "localhost",
    "dialect": "mysql",
    logging: (msg) => console.log(chalk.cyan(msg)), // https://sequelize.org/docs/v6/getting-started/#logging
    "port": process.env.LOCAL_MYSQL_PORT,
    "ssl": false,
    "seederStorage": "sequelize",
    "dialectOptions": {
        "ssl": {
          "require": true, // This will help you. But you will see new error
          "rejectUnauthorized": false // This line will fix new error
        }
    },
    "pool": {
      "max": 5,
      "min": 0,
      "acquire": 30000,
      "idle": 10000
    }
  
  },
  test: {
    "username": process.env.SHARED_HOST_POSTGRESQL_DB_USERNAME,
    "user": process.env.SHARED_HOST_POSTGRESQL_DB_USERNAME, // knex uses 'user'
    "password": process.env.SHARED_HOST_POSTGRESQL_DB_PASSWORD,
    "database": process.env.SHARED_HOST_POSTGRESQL_TEST_DB_NAME,
    "host": process.env.SHARED_HOST,
    "dialect": "postgres",
    "port": process.env.PG_PORT,
    "ssl": true,
    "dialectOptions": {
        "ssl": {
          "require": true,
          "rejectUnauthorized": false
        }
    },
    "pool": {
      "max": 5,
      "min": 0,
      "acquire": 30000,
      "idle": 10000
    }
  },
  production: {
    "username": process.env.SHARED_HOST_MYSQL_DB_USERNAME,
    "user": process.env.SHARED_HOST_MYSQL_DB_USERNAME, // knex uses 'user'
    "password": process.env.SHARED_HOST_MYSQL_DB_PASSWORD,
    "database": process.env.SHARED_HOST_MYSQL_PROD_DB_NAME,
    "host": process.env.SHARED_HOST,
    "dialect": "mysql",
    // TODO: we need to log in prod
    "seederStorage": "sequelize",
    "port": 3306,
    "ssl": true,
    "dialectOptions": {
        "ssl": {
          "require": true,
          "rejectUnauthorized": false
        },
    },
    // "flags": "MULTI_STATEMENTS", // TODO: remove this later.
    // "multipleStatements": true, // TODO: remove this later.
    "pool": {
      "max": 5,
      "min": 0,
      "acquire": 30000,
      "idle": 10000
    }
  }
}
