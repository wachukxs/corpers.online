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
      unique: true,
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
  return WaitList;
};