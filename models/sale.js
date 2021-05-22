'use strict';
const {
  Model
} = require('sequelize');
const moment = require('moment');
module.exports = (sequelize, DataTypes) => {
  class Sale extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Sale.belongsTo(models.CorpMember)
      Sale.hasMany(models.Media)
    }
  };
  Sale.init({
    id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    itemname: DataTypes.STRING,
    price: DataTypes.FLOAT,
    text: DataTypes.TEXT,
    age: {
      type: DataTypes.VIRTUAL,
      get() { // createdAt: 2021-05-10T23:20:35.182Z // should we return updatedAt too ?
        return moment(`${this.createdAt}`).fromNow();
      },
    },
    last_updated_age: {
      type: DataTypes.VIRTUAL,
      get() { // updatedAt: 2021-05-10T23:20:35.182Z // oh well!
        return moment(`${this.updatedAt}`).fromNow();
      },
    }
  }, {
    sequelize,
    modelName: 'Sale',
  });
  Sale.sync({
    alter: true,
    // force: true
  })
  return Sale;
};