'use strict';
const {
  Model
} = require('sequelize');
const moment = require('moment');
module.exports = (sequelize, DataTypes) => {
  class Accommodation extends Model {
    static getAllActualAttributes() {
      let safeAccommodationAttributes = Object.keys(Accommodation.rawAttributes)
      safeAccommodationAttributes.splice(safeAccommodationAttributes.indexOf('accommodationId'), 1);
      
      return safeAccommodationAttributes
    }
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) { // should have location here too
      // define association here
      Accommodation.belongsTo(models.CorpMember, {
        targetKey: 'statecode',
        foreignKey: 'statecode',
        as: 'accommodationByCorper'
      })
      Accommodation.belongsTo(models.Media, { // means Accommodation have a mediaId
        foreignKey: 'mediaId',
        as: 'accommodationMedia'
      })
      Accommodation.belongsTo(models.Location, { // means Accommodation have a locationId
        foreignKey: 'locationId'
      })
    }
  };
  Accommodation.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    mediaId: { // do not add foreign keys yourself, sequelize will add them for you
      type: DataTypes.INTEGER
    },
    // address: DataTypes.STRING,
    // directions: DataTypes.TEXT,
    rent: DataTypes.FLOAT,
    roommateRent: { // should we be adding Naira sign to it ?? ...lol
      type: DataTypes.FLOAT
    },
    rentRange: {
      type: DataTypes.ENUM,
      values: ['monthly', 'quarterly', 'yearly']
    },
    accommodationType: {
      type: DataTypes.STRING,
    },
    availableRooms: {
      type: DataTypes.STRING,
      get() {
        return this.getDataValue('availableRooms').split(',');
      }
    },
    tenure: {
      type: DataTypes.STRING,
    },
    idealRoommate: {
      type: DataTypes.TEXT,
    },
    roommateRent: {
      type: DataTypes.FLOAT,
    },
    occupantDescription: {
      type: DataTypes.TEXT,
    },
    rentExpireDate: {
      type: DataTypes.DATE, // must be greater than createdAt
    },
    statecode: DataTypes.STRING,
    age: {
      type: DataTypes.VIRTUAL,
      get() {
        return moment(this.getDataValue('createdAt')).fromNow();
      },
      set(value) {
        throw new Error('Do not try to set the Accommodation.`age` value!');
      }
    },
    locationId: {
      type:DataTypes.INTEGER
    },
    type: {
      type: DataTypes.VIRTUAL,
      get() {
        return 'accommodation';
      },
      set(value) {
        throw new Error('Do not try to set the Accommodation.`type` value!');
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
    modelName: 'Accommodation',
  });
  Accommodation.sync({ alter: true })
  return Accommodation;
};