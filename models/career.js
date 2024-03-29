'use strict';
const {
  Model
} = require('sequelize');
const moment = require('moment');
module.exports = (sequelize, DataTypes) => {
  class Career extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Career.init({
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
    time: {
      type: DataTypes.DATE
    },
    read_by_to: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    time_read: DataTypes.DATE,
    _time: DataTypes.DATE,
    message_sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    age: {
      type: DataTypes.VIRTUAL,
      get() {
        return moment(this.getDataValue('created_at')).fromNow();
      },
      set(value) {
        throw new Error('Do not try to set the Career.`age` value!');
      }
    }
  }, {
    sequelize,
    modelName: 'Career',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    // comment: 'What are we using this for again?'
  });
  // Career.sync({ alter: true })
  return Career;
};