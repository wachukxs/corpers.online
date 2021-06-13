'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PPA extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PPA.hasMany(models.CorpMember, {
        foreignKey: 'ppaId',
        // targetKey: 'id'
      })
    }
  };
  PPA.init({
    id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING
    },
    type_of_ppa: {
      type: DataTypes.STRING
      // allowNull defaults to true
    },
  }, {
    sequelize,
    modelName: 'PPA',
    freezeTableName: true
  });
  PPA.sync({
    alter: true,
    force: true
  })
  return PPA;
};