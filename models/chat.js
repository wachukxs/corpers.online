'use strict';
const helpers = require('../utilities/helpers');
const ggle = require('../helpers/uploadgdrive');
const ngstates = require('../utilities/ngstates');

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The models/index file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Chat.hasMany(models.Media)
    }

    // custom methods

    // we don't need stream, do we? can be inferred! same as batch!
  };
  Chat.init({
    id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    room: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    message_from: {
      type: DataTypes.STRING
      // allowNull defaults to true
    },
    message_to: {
      type: DataTypes.STRING,
      allowNull: false
    },
    media: { // string of comma seperate media_id
      type: DataTypes.STRING,
      allowNull: false
    },
    time: { // A string Date.now() value
      type: DataTypes.STRING,
      unique: true
      // allowNull defaults to true
    },
    read_by_to: { // not necessary
      type: DataTypes.BOOLEAN,
      // allowNull defaults to true
    },
    time_read: {
      type: DataTypes.STRING,
      // allowNull defaults to true
    },
    _time: {
      type: DataTypes.STRING
      // allowNull defaults to true
    },
    message_sent: {
      type: DataTypes.BOOLEAN
      // allowNull defaults to true
    }
  }, {
    sequelize,
    modelName: 'Chat',
    hooks: {
      beforeCreate: (chat, options) => {
      },
    }
  });
  Chat.sync({
    // alter: true,
    force: true
  })
  return Chat;
};