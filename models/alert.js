'use strict';
const {
  Model
} = require('sequelize');
const moment = require('moment');
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
        targetKey: 'state_code',
        foreignKey: 'state_code',
        as: 'alertByCorper'
      });

      Alert.belongsTo(models.Location, { // means PPA have a locationId
        foreignKey: 'location_id'
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
      type:DataTypes.STRING
    },
    item_name: {
        type:DataTypes.STRING
    },
    state_code: {
      type:DataTypes.STRING
    },
    minimum_price: { // should we move to attaching currency symbol from the back end ?
      type:DataTypes.INTEGER
    },
    accommodation_type: {
        type: DataTypes.STRING,
    },
    max_price: {
        type:DataTypes.INTEGER
    },
    note: {
        type:DataTypes.TEXT
    },
    rooms: {
        type: DataTypes.STRING,
        get() {
            return this.getDataValue('rooms').split(',');
        },
        set(value) {
          if (!value) {
            this.setDataValue('rooms', null); // for when value is ''
          } else {
            this.setDataValue('rooms', value);
          }
        }
    },
    // expiresAt: {
    //   type: Sequelize.DATE,
    //   defaultValue() {
    //     return moment().add(30, 'days').toDate();
    //   },
    // },
    location_id: DataTypes.INTEGER, // TODO: include location as a metric ...so we filter people leaving close to you
  }, {
    sequelize,
    modelName: 'Alert',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  // Alert.sync({ alter: true })
  return Alert;
};