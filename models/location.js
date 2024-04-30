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

      Location.belongsTo(models.Accommodation, {
        foreignKey: 'accommodation_id',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });

      Location.belongsTo(models.StateLGA, {
        foreignKey: 'state_lga_id'
      })
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
      type:DataTypes.INTEGER,
      references: {
        model: 'PPA',
        key: 'id'
      }
    },
    // TODO: We should also save coordinates of a location
    accommodation_id: {
      type:DataTypes.INTEGER,
      references: {
        model: 'Accommodations',
        key: 'id'
      }
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
    directions: {
      type: DataTypes.TEXT, // TODO: There could be a lot of directions (from different places)
    },
    address: {
      type: DataTypes.STRING
    },
    state_lga_id: {
      type: DataTypes.STRING,
      comment: "Optional",
      references: {
        model: 'StateLGAs',
        key: 'id'
      }
    },
    state_id: {
      type: DataTypes.STRING,
      references: {
        model: 'States',
        key: 'id'
      }
    },
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
    tableName: 'Locations',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  return Location;
};