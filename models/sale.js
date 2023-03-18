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
    statecode: {
      type:DataTypes.STRING,
      references: {
        model: 'CorpMember',
        key: 'statecode'
      }
    }, // need it ?
    itemname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    minPrice: {
      type: DataTypes.INTEGER,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    _price: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue('price') ? Intl.NumberFormat().format(this.getDataValue('price')) : null;
      }
    },
    text: DataTypes.TEXT,
    mediaId: {
      type:DataTypes.INTEGER
    },
    _age: {
      type: DataTypes.VIRTUAL,
      get() {
        return moment(this.getDataValue('createdAt')).fromNow();
      },
      set(value) {
        throw new Error('Do not try to set the Sale.`age` value!');
      }
    },
    lastUpdatedAge: { // do we need this ? // uhmmm maybe for when they change price, plus we know if it's still available and how fresh it is since the corp member(original poster) is still interacting with it
      type: DataTypes.VIRTUAL,
      get() {
        return moment(this.getDataValue('updatedAt')).fromNow();
      },
      set(value) {
        throw new Error('Do not try to set the `last_updated_age` value!');
      }
    },
    _type: {
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
  // Sale.sync({ alter: true })
  return Sale;
};