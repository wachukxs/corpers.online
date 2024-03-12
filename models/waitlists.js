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
    serving_state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    comment: DataTypes.TEXT,
    middle_name: DataTypes.STRING,
    first_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    last_name: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true, // https://stackoverflow.com/a/52973042/9259701 solution for https://github.com/sequelize/sequelize/issues/9653
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
  }, {
    sequelize,
    modelName: 'WaitList',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  /* WaitList.sync({ alter: true })
  .then((_done) => {
    console.log(`Done syncing ${WaitList.tableName}`);
  }, (_err) => {
    console.error(`err syncing ${WaitList.tableName}:\n\n`, _err);
  })
  .catch(_reason => {
    console.error(`caught this error while syncing ${WaitList.tableName} table:\n\n`, _reason);
  }) */
  
  return WaitList;
};