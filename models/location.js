'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Location extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Location.belongsTo(models.Media, { // means Location have a mediaId
        foreignKey: 'mediaId'
      })
      Location.hasOne(models.PPA, { // means Location has ppaId
        foreignKey: 'ppaId'
      });
      Location.hasOne(models.Accommodation, { // means Location has accommodationId
        foreignKey: 'accommodationId'
      });
    }
  };
  Location.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    mediaId: {
      type:DataTypes.INTEGER
    },
    ppaId: {
      type:DataTypes.INTEGER
    },
    accommodationId: {
      type:DataTypes.INTEGER
    },
    createdAt: {
      type: DataTypes.DATE
    },
    updatedAt: {
      type: DataTypes.DATE
    },
    directions: DataTypes.TEXT,
    address: DataTypes.STRING,
    CorpMemberId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Location',
  });
  // Location.sync({ alter: true })
  return Location;
};