'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {

  /***
   * How do we handle duplicate locations ...to make sure there aren't any.
   */
  class Location extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Location.hasMany(models.Media, {
        foreignKey: 'location_id'
      })
      Location.belongsTo(models.PPA, { // means Location has ppa_id
        foreignKey: 'ppa_id',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
      Location.hasOne(models.Accommodation, {
        foreignKey: 'location_id',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
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
    ppa_id: {
      type:DataTypes.INTEGER
    },
    accommodation_id: {
      type:DataTypes.INTEGER
    },
    type: {
      type: DataTypes.VIRTUAL,
      get() {
        return 'location'; // hardcoded
      },
      set(value) {
        throw new Error('Do not try to set the Location.`type` value!');
      }
    },
    directions: DataTypes.TEXT,
    address: DataTypes.STRING,
    corp_member_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'CorpMembers',
        key: 'id'
      }
    },
  }, {
    sequelize,
    modelName: 'Location',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  // Location.sync({ alter: true })
  return Location;
};