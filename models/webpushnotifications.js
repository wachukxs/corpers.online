'use strict';
const {
  Model
} = require('sequelize');
const moment = require('moment');
module.exports = (sequelize, DataTypes) => {
  class WebPushNotifications extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      WebPushNotifications.belongsTo(models.CorpMember, {
        targetKey: 'statecode',
        foreignKey: 'statecode',
        as: 'notificationByCorper'
      })
    }
  };
  WebPushNotifications.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    pushSubscriptionStringified: {
        type: DataTypes.STRING(500)
    },
    createdAt: {
      type: DataTypes.DATE
    },
    updatedAt: {
      type: DataTypes.DATE
    }
  }, {
    sequelize,
    modelName: 'Sale',
  });
  WebPushNotifications.sync({ alter: true })
  return WebPushNotifications;
};