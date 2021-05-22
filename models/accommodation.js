'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Accommodation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Accommodation.hasMany(models.Media)
      Accommodation.belongsTo(models.CorpMember, {
        foreignKey: 'statecode',
        onDelete: 'CASCADE'
      })
    }
  };
  Accommodation.init({
    id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    directions: {
      type: DataTypes.STRING
    },
    // statecode: {
    //   type: DataTypes.STRING
    // },
    rent: {
      type: DataTypes.FLOAT
    }
  }, {
    sequelize,
    modelName: 'Accommodation',
  });
  Accommodation.sync({
    alter: true,
    force: true
  })
  return Accommodation;
};