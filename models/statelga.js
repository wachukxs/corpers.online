'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class StateLGA extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      StateLGA.belongsTo(models.States, {
        foreignKey: 'state_id'
      });

      StateLGA.hasMany(models.Location, {
        foreignKey: 'state_lga_id'
      });
    }
  }
  StateLGA.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: DataTypes.STRING,
    state_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'States',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'StateLGA',
    tableName: 'StateLGAs',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  return StateLGA;
};