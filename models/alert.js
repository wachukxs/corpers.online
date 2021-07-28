'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Alert extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */

    // you should be able to edit alerts, right ? like change their parameters, and even delete them. We'll remind you if you've seen the item.
    // Then we'll tell others what people are in need of ...
    // even have a search history
    static associate(models) {
      // define association here
      Alert.belongsTo(models.CorpMember, {
        targetKey: 'statecode',
        foreignKey: 'statecode',
        as: 'alertByCorper'
      });

      Alert.belongsTo(models.Location, { // means PPA have a locationId
        foreignKey: 'locationId'
      })
    }
  };
  Alert.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    type: {
      type:DataTypes.INTEGER
    },
    itemname: {
        type:DataTypes.STRING
    },
    statecode: {
      type:DataTypes.INTEGER
    },
    minPrice: {
      type:DataTypes.INTEGER
    },
    accommodationType: {
        type: DataTypes.STRING,
    },
    maxPrice: {
        type:DataTypes.INTEGER
    },
    note: {
        type:DataTypes.TEXT
    },
    createdAt: {
      type: DataTypes.DATE
    },
    updatedAt: {
      type: DataTypes.DATE
    },
    rooms: {
        type: DataTypes.STRING,
        get() {
            return this.getDataValue('rooms').split(',');
        }
    },
    locationId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Alert',
  });
  // Alert.sync({ alter: true })
  return Alert;
};