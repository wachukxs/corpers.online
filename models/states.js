'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class States extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      States.hasMany(models.StateLGA, {
        foreignKey: 'state_id'
      });

      States.hasMany(models.Location, {
        foreignKey: 'state_id'
      });

    }
  }
  States.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
    },
    short_name: {
      type: DataTypes.STRING,
      unique: true,
    },
  }, {
    sequelize,
    modelName: 'States',
    tableName: 'States',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  return States;
};