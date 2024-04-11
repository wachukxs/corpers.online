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
        foreignKey: 'corp_member_id',
        // as: 'alertByCorper'
      });
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
      type: DataTypes.STRING
    },
    item_name: {
      type: DataTypes.STRING
    },
    corp_member_id: {
      type: DataTypes.INTEGER
    },
    minimum_price: { // should we move to attaching currency symbol from the back end ?
      type: DataTypes.INTEGER
    },
    // We should do the enum.
    accommodation_type: {
      type: DataTypes.STRING,
    },
    max_price: {
      type: DataTypes.INTEGER
    },
    note: {
      type: DataTypes.TEXT
    },
    rooms: {
        type: DataTypes.STRING,
        get() {
            return this.getDataValue('rooms').split(',');
        },
        set(value) {
          if (!value) {
            this.setDataValue('rooms', null); // for when value is '' // we won't need this...
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
    /**
     * Not sure why this is here!
     * 
     * "TODO: include location as a metric ...so we filter people leaving close to you"
     */
    location_id: {
      type: DataTypes.INTEGER
    },
  }, {
    sequelize,
    modelName: 'Alert',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  return Alert;
};