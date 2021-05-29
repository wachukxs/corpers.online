'use strict';
const {
  Model
} = require('sequelize');
const moment = require('moment');
module.exports = (sequelize, DataTypes) => {
  class Accommodation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Accommodation.belongsTo(models.CorpMember, {
        targetKey: 'statecode',
        foreignKey: 'statecode'
      })
      Accommodation.hasMany(models.Media, {
        // foreignKey: 'saleId',
        // onDelete: 'CASCADE', // do we want to delete though ?
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
    directions: DataTypes.STRING,
    rent: DataTypes.FLOAT,
    statecode: DataTypes.STRING,
    age: {
      type: DataTypes.VIRTUAL,
      get() {
        return moment(this.createdAt).fromNow();
      },
      set(value) {
        throw new Error('Do not try to set the Accommodation.`age` value!');
      }
    },
  }, {
    sequelize,
    modelName: 'Accommodation',
  });
  Accommodation.sync({ alter: true })
  return Accommodation;
};