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
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  
  return WaitList;
};