'use strict';
const {
  Model
} = require('sequelize');
const moment = require('moment');
module.exports = (sequelize, DataTypes) => {
  class Accommodation extends Model {
    static getAllActualAttributes() {
      let safeAccommodationAttributes = Object.keys(Accommodation.rawAttributes)
      safeAccommodationAttributes.splice(safeAccommodationAttributes.indexOf('accommodation_id'), 1); // ???
      
      return safeAccommodationAttributes
    }

    static getCreationAttributes() {
      let safeAccommodationAttributes = Object.keys(Accommodation.rawAttributes)
      safeAccommodationAttributes.splice(safeAccommodationAttributes.indexOf('accommodation_id'), 1);
      safeAccommodationAttributes.splice(safeAccommodationAttributes.indexOf('type'), 1);
      safeAccommodationAttributes.splice(safeAccommodationAttributes.indexOf('age'), 1);
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
        foreignKey: 'corp_member_id',
      })
      Accommodation.hasMany(models.Media, { // means Media has accommodation_id
        foreignKey: 'accommodation_id',
      })
      Accommodation.hasOne(models.Location, {
        foreignKey: 'accommodation_id', // TODO: add accommodation_id to Location
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
    // address: DataTypes.STRING,
    // directions: DataTypes.TEXT,
    rent: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    roommate_rent: { // should we be adding Naira sign to it ??
      type: DataTypes.FLOAT
    },
    _rent: {
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue('rent') ? Intl.NumberFormat().format(this.getDataValue('rent')) : null;
      }
    },
    _roommate_rent: { // should we be adding Naira sign to it ??
      type: DataTypes.VIRTUAL,
      get() {
        return this.getDataValue('roommate_rent') ? Intl.NumberFormat().format(this.getDataValue('roommate_rent')) : null;
      }
    },
    rent_interval: {
      type: DataTypes.ENUM,
      values: ['monthly', 'quarterly', 'yearly'],
      allowNull: false,
    },
    accommodation_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    available_rooms: {
      type: DataTypes.STRING,
      get() {
        return this.getDataValue('available_rooms').split(',');
      }
    },
    tenure: { // what is tenure for?
      type: DataTypes.STRING,
    },
    ideal_roommate: {
      type: DataTypes.TEXT,
    },
    roommate_rent: {
      type: DataTypes.FLOAT,
    },
    occupant_description: {
      type: DataTypes.TEXT,
    },
    rent_expire_date: { // must be greater than created_at
      type: DataTypes.DATE,
    },
    corp_member_id: {
      type: DataTypes.STRING
    },
    location_id: {
      type:DataTypes.INTEGER
    },
    type: {
      type: DataTypes.VIRTUAL,
      get() {
        return 'accommodation'; // ??
      },
      set(value) {
        throw new Error('Do not try to set the Accommodation.`type` value!');
      }
    },
    age: {
      type: DataTypes.VIRTUAL,
      get() {
        return moment(this.getDataValue('created_at')).fromNow();
      },
      set(value) {
        throw new Error('Do not try to set the Accommodation.`age` value!');
      }
    },
  }, {
    sequelize,
    modelName: 'Accommodation',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  // Accommodation.sync({ alter: true })
  return Accommodation;
};