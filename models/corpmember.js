'use strict';
const helpers = require('../utilities/helpers');
const ggle = require('../helpers/uploadgdrive');
const ngstates = require('../utilities/ngstates');

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CorpMember extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    // custom methods

    /**
     * DON'T USE.
     * This isn't accurate at all. We should let the corp member tell us.
     * @param {*} sb 
     * @returns 
     */
    getStream(sb) {
        return sb == 'A' ? 1 : sb == 'B' ? 2 : sb == 'C' ? 3 : 4; // because we're sure it's gonna be 'D'... are we? ...sure?
    }

    getServiceState() {
      return ngstates.states_long[ngstates.states_short.indexOf(this.statecode.trim().slice(0, 2).toUpperCase())];
    }

    getBatch() {
      return this.statecode.trim().slice(5, 6).toUpperCase();
    }

    // we don't need stream, do we? can be inferred! same as batch!
  };
  CorpMember.init({
    id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    firstname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    middlename: {
      type: DataTypes.STRING
      // allowNull defaults to true
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    statecode: {
      type: DataTypes.STRING,
      unique: true
      // allowNull defaults to true
    },
    batch: { // not necessary
      type: DataTypes.STRING,
      // allowNull defaults to true
    },
    servicestate: {
      type: DataTypes.STRING,
      // allowNull defaults to true
    },
    stream: {
      type: DataTypes.STRING
      // allowNull defaults to true
    },
    lga: {
      type: DataTypes.STRING
      // allowNull defaults to true
    },
    city_town: {
      type: DataTypes.STRING
      // allowNull defaults to true
    },
    region_street: {
      type: DataTypes.STRING
      // allowNull defaults to true
    },
    accomodation_location: {
      type: DataTypes.STRING
      // allowNull defaults to true
    },
    type_of_ppa: {
      type: DataTypes.STRING
      // allowNull defaults to true
    },
    travel_from_state: {
      type: DataTypes.STRING
      // allowNull defaults to true
    },
    travel_from_city: {
      type: DataTypes.STRING
      // allowNull defaults to true
    }
  }, {
    sequelize,
    modelName: 'CorpMember',
    hooks: {
      beforeCreate: (corpMember, options) => {
        if (corpMember.statecode) {
          corpMember.statecode = corpMember.statecode.toUpperCase();
          corpMember.servicestate = corpMember.getServiceState()
          corpMember.batch = corpMember.getBatch()
        }
      },
      beforeUpdate: (corpMember, options) => {
        if (corpMember.statecode) {
          corpMember.statecode = corpMember.statecode.toUpperCase();
          corpMember.servicestate = corpMember.getServiceState()
          corpMember.batch = corpMember.getBatch()
        }
      },
      beforeSave: (corpMember, options) => {
        if (corpMember.statecode) {
          corpMember.statecode = corpMember.statecode.toUpperCase();
          corpMember.servicestate = corpMember.getServiceState()
          corpMember.batch = corpMember.getBatch()
        }
      },
    }
  });
  CorpMember.sync({
    // alter: true,
    force: true
  })
  return CorpMember;
};