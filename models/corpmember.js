'use strict';
const {
  Model
} = require('sequelize');
const moment = require('moment');
const ngstates = require('../utilities/ngstates');

/**
 * use sparQL to show relationship between data ... show friend of a friend relationship ...esp between people selling and buyiing ... got introduced by Simeon
 * @param {*} sequelize 
 * @param {*} DataTypes 
 * @returns 
 */
module.exports = (sequelize, DataTypes) => {
  class CorpMember extends Model {
    getServiceState() {
      return ngstates.states_long[ngstates.states_short.indexOf(this.statecode.slice(0, 2))];
    }
    /**
     * CorpMember attributes without password
     * impl idea from https://stackoverflow.com/a/66956107/9259701
     * @returns array of attributes without password
     */
    static getSafeAttributes() {
      let safeCorpMemberAttributes = Object.keys(CorpMember.rawAttributes)
      safeCorpMemberAttributes.splice(safeCorpMemberAttributes.indexOf('password'), 1);
      
      return safeCorpMemberAttributes
    }
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // CorpMember is source, PPA is target (foreignKey is in CORPMEMBER)
      CorpMember.belongsTo(models.PPA, {
        foreignKey: 'ppaId',
      })

      CorpMember.hasMany(models.Sale, { // if you want a unique name for when you do CorpMember.findOne({}) etc, put an `as` attrribute here
        foreignKey: 'statecode', // should we use statecode or id ? what if they update their statecode ? we'd mass update it
        sourceKey: 'statecode'
      });
      CorpMember.hasMany(models.Accommodation, {
        foreignKey: 'statecode',
        sourceKey: 'statecode'
      })

      CorpMember.hasMany(models.Chat, {
        foreignKey: 'message_from',
        sourceKey: 'statecode'
      })

      CorpMember.hasMany(models.Chat, {
        foreignKey: 'message_to',
        sourceKey: 'statecode'
      })
      
      CorpMember.belongsTo(models.Media, { // This creates the `mediaId` foreign key in CorpMember.
        foreignKey: 'mediaId',
      })
      CorpMember.hasMany(models.Location) // Location should have an array of all the corp member who have edited or confirmed it's location
    }
  };
  CorpMember.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    travel_from_city: DataTypes.STRING,
    travel_from_state: DataTypes.STRING,
    accommodation_location: DataTypes.STRING, // needs to change!! put in location model
    region_street: DataTypes.STRING,
    city_town: DataTypes.STRING,
    email: DataTypes.STRING,
    lga: DataTypes.STRING, // shouldn't this be nested
    stream: DataTypes.STRING,
    servicestate: {
      type: DataTypes.STRING,
      // allowNull defaults to true
      get() {
        return this.getServiceState(); // return ngstates.states_long[ngstates.states_short.indexOf(this.getDataValue('statecode').trim().slice(0, 2).toUpperCase())];
      }
    },
    createdAt: { // convert to string, it causes error for .ejs template ...plus it's just safer to have '2021-06-12T18:44:22.683Z' in stead of 2021-06-12T18:44:22.683Z
      type: DataTypes.DATE,
    },
    timeWithUs: { // must be aftr 'createdAt' ... should we make a PR to fix this ?
      type: DataTypes.VIRTUAL,
      get() {
        return moment(this.getDataValue('createdAt')).fromNow();
      },
      set(value) {
        throw new Error('Do not try to set the CorpMember.`timeWithUs` value!');
      }
    },
    _location: { // this will be depreciated soon
      type: DataTypes.VIRTUAL,
      get() {
        return this.getServiceState() + (this.getDataValue('city_town') ? ', ' + this.getDataValue('city_town') : ''); // + (this.getDataValue('region_street') ? ', ' + this.getDataValue('region_street') : '' )
      },
      set(value) {
        throw new Error('Do not try to set the CorpMember.`location` value!');
      }
    },
    batch: DataTypes.STRING,
    statecode: {
      type: DataTypes.STRING,
      unique: true,
      set(value) { // not needed here??
        this.setDataValue('statecode', value.toUpperCase());
      }
    },
    updatedAt: { // convert to string, it causes error for .ejs template ...plus it's just safer to have '2021-06-12T18:44:22.683Z' in stead of 2021-06-12T18:44:22.683Z
      type: DataTypes.DATE,
    },
    mediaId: {
      type: DataTypes.INTEGER
    },
    pushSubscriptionStringified: {
        type: DataTypes.STRING(500),
        get() {
          let pushSubscription = JSON.parse(this.getDataValue('pushSubscriptionStringified'))
          const subscriptionObject = {
            endpoint: pushSubscription.endpoint,
            keys: {
              p256dh: pushSubscription.getKeys('p256dh'),
              auth: pushSubscription.getKeys('auth')
            }
          };
          
          // The above is the same output as:
          
          return subscriptionObject // we could just return pushSubscription
        },
    },
    ppaId: DataTypes.INTEGER,
    password: DataTypes.STRING,
    middlename: DataTypes.STRING,
    firstname: DataTypes.STRING,
    lastname: DataTypes.STRING,
    email: DataTypes.STRING,
    wantspaornot: DataTypes.BOOLEAN,
    accommodationornot: DataTypes.BOOLEAN,
    public_profile: DataTypes.BOOLEAN,
    bio: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'CorpMember',
  });
  CorpMember.sync({ alter: true })
  return CorpMember;
};