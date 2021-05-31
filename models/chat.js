'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Chat.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    room: DataTypes.STRING,
    message: DataTypes.TEXT,
    message_from: DataTypes.STRING,
    message_to: DataTypes.STRING,
    mediaId: {
      type:DataTypes.INTEGER
    },
    time: {
      type: DataTypes.DATE
    },
    read_by_to: DataTypes.BOOLEAN,
    time_read: DataTypes.DATE,
    _time: DataTypes.DATE,
    message_sent: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Chat',
  });
  Chat.sync({ alter: true })
  return Chat;
};