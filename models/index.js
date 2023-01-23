'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

/**
 * we need to try to connect to one db first, if that doesn't work,
 * connect to the back up
 * we could also use them interchangably for back up db, and sync when one is up.
 */
sequelize.authenticate().then((e) => {
  console.log('made db connection from sequelize');
}).catch((err) => {
  console.error('oopsy error connecting to db with Sequelize', err)
  // sequelize.close() // after retrying ?
})

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

// https://levelup.gitconnected.com/creating-sequelize-associations-with-the-sequelize-cli-tool-d83caa902233

// https://gist.github.com/igorvolnyi/f7989fc64006941a7d7a1a9d5e61be47