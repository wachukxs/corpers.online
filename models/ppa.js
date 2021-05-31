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
        foreignKey: 'PPAId',
        // targetKey: 'id'
      })
      PPA.belongsTo(models.Media, { // means PPA have a mediaId
        foreignKey: 'mediaId'
      })
    }
  };
  PPA.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: DataTypes.STRING,
    mediaId: {
      type:DataTypes.INTEGER
    },
    type_of_ppa: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'PPA',
    tableName: 'PPA',
    freezeTableName: true,
  });
  PPA.sync({ alter: true })
  return PPA;
};