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
      Sale.belongsTo(models.CorpMember, {
        targetKey: 'statecode',
        foreignKey: 'statecode',
        as: 'saleByCorper'
      })
      Sale.belongsTo(models.Media, { // means Sale have a mediaId
        foreignKey: 'mediaId',
        as: 'saleMedia'
      })
    }
  };
  Sale.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    statecode: DataTypes.STRING, // need it ?
    itemname: DataTypes.STRING,
    price: DataTypes.FLOAT,
    text: DataTypes.TEXT,
    mediaId: {
      type:DataTypes.INTEGER
    },
    age: {
      type: DataTypes.VIRTUAL,
      get() {
        return moment(this.getDataValue('createdAt')).fromNow();
      },
      set(value) {
        throw new Error('Do not try to set the Sale.`age` value!');
      }
    },
    last_updated_age: { // do we need this ?
      type: DataTypes.VIRTUAL,
      get() {
        return moment(this.getDataValue('updatedAt')).fromNow();
      },
      set(value) {
        throw new Error('Do not try to set the `last_updated_age` value!');
      }
    },
    type: {
      type: DataTypes.VIRTUAL,
      get() {
        return 'sale';
      },
      set(value) {
        throw new Error('Do not try to set the Sale.`type` value!');
      }
    },
    createdAt: {
      type: DataTypes.DATE
    },
    updatedAt: {
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'Sale',
  });
  Sale.sync({ alter: true })
  return Sale;
};