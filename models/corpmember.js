'use strict';
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
      CorpMember.hasMany(models.Sale, {
        foreignKey: 'statecode', // should we use statecode or id ? what if they update their statecode ? we'd mass update it
        sourceKey: 'statecode'
      });
      CorpMember.hasMany(models.Accommodation, {
        foreignKey: 'statecode',
        sourceKey: 'statecode'
      })
      CorpMember.belongsTo(models.PPA)
      CorpMember.belongsTo(models.Media, { // This creates the `mediaId` foreign key in CorpMember.
        foreignKey: 'mediaId',
        
      })
      CorpMember.hasMany(models.Location) // Location should have an array of all the corp member who have edited or confirmed it's location
    }
  };
  CorpMember.init({
    PPAId: DataTypes.INTEGER,
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    travel_from_city: DataTypes.STRING,
    travel_from_state: DataTypes.STRING,
    accommodation_location: DataTypes.STRING,
    region_street: DataTypes.STRING,
    city_town: DataTypes.STRING,
    email: DataTypes.STRING,
    lga: DataTypes.STRING,
    stream: DataTypes.STRING,
    servicestate: {
      type: DataTypes.STRING,
      // allowNull defaults to true
      get() {
        return ngstates.states_long[ngstates.states_short.indexOf(this.getDataValue(statecode).trim().slice(0, 2).toUpperCase())];
      }
    },
    batch: DataTypes.STRING,
    statecode: {
      type: DataTypes.STRING,
      unique: true,
      set(value) { // not needed here??
        this.setDataValue('statecode', value.toUpperCase());
      },
      get() {
        return this.getDataValue(statecode).toUpperCase();
      }
    },
    mediaId: {
      type: DataTypes.INTEGER
    },
    password: DataTypes.STRING,
    middlename: DataTypes.STRING,
    firstname: DataTypes.STRING,
    lastname: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'CorpMember',
  });
  CorpMember.sync({ alter: true })
  return CorpMember;
};