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
        foreignKey: 'corp_member_id',
      })
      Sale.hasMany(models.Media, {
        foreignKey: 'sale_id',
        // as: 'saleMedia'
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
    corp_member_id: {
      type:DataTypes.STRING,
      references: {
        model: 'CorpMembers',
        key: 'id'
      }
    }, // need it ?
    item_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    minimum_price: {
      type: DataTypes.INTEGER,
      set(value) {
        this.setDataValue('minimum_price', parseInt(value));
      }
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      set(value) {
        this.setDataValue('price', parseInt(value));
      }
    },
    _price: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue('price') ? Intl.NumberFormat().format(this.getDataValue('price')) : null;
      }
    },
    text: DataTypes.TEXT,
    _age: {
      type: DataTypes.VIRTUAL,
      get() {
        return moment(this.getDataValue('created_at')).fromNow();
      },
      set(value) {
        throw new Error('Do not try to set the Sale.`age` value!');
      }
    },
    last_updated_age: { // do we need this ? // uhmmm maybe for when they change price, plus we know if it's still available and how fresh it is since the corp member(original poster) is still interacting with it
      type: DataTypes.VIRTUAL,
      get() {
        return moment(this.getDataValue('updated_at')).fromNow();
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
  }, {
    sequelize,
    modelName: 'Sale',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  // Sale.sync({ alter: true })
  return Sale;
};