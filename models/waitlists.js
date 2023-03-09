'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class WaitList extends Model {

  };
  WaitList.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    servingstate: {
      type:DataTypes.STRING,
      allowNull: false,
    },
    comment: DataTypes.TEXT,
    middlename: DataTypes.STRING,
    firstname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastname: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: 'email', // https://stackoverflow.com/a/52973042/9259701 solution for https://github.com/sequelize/sequelize/issues/9653
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'WaitList',
  });
  WaitList.sync({ alter: true })
  .then((_done) => {
    console.log(`Done syncing ${WaitList.tableName}`);
  }, (_err) => {
    console.error(`err sycing ${WaitList.tableName}:\n\n`, _err);
  })
  .catch(_reason => {
    console.error(`caught this error while sycning ${WaitList.tableName} table:\n\n`, _reason);
  })
  return WaitList;
};