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
    // this has only data present in the ongoing operation (like insert, delete, update, or select)
    /***
     * depreciated method. will be using a virtual field in place of this.
     * only use class methods for operations that doesn't need field/row data (except for insert/select operations)
     */
    getServiceState() { // during an update, this.statecode turn up null ... why ??? ...not anymore (because this.statecode is always set for every db operation)
      // console.log("\n\n\n\nwhy is this.statecode null??", this.statecode);
      return this.statecode ? ngstates.states_long[ngstates.states_short.indexOf(this.statecode.slice(0, 2))] : '';
    }
    /**
     * CorpMember attributes without password, and pushSubscriptionStringified
     * impl idea from https://stackoverflow.com/a/66956107/9259701
     * @returns array of attributes without password
     */
    static getSafeAttributes() {
      let safeCorpMemberAttributes = Object.keys(CorpMember.rawAttributes)
      safeCorpMemberAttributes.splice(safeCorpMemberAttributes.indexOf('password'), 1);
      safeCorpMemberAttributes.splice(safeCorpMemberAttributes.indexOf('pushSubscriptionStringified'), 1)
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
    email: {
      type:DataTypes.STRING,
      set(value) {
        this.setDataValue('email', value.toLowerCase());
      }
    },
    lga: DataTypes.STRING, // shouldn't this be nested
    stream: DataTypes.STRING,
    createdAt: { // convert to string, it causes error for .ejs template ...plus it's just safer to have '2021-06-12T18:44:22.683Z' in stead of 2021-06-12T18:44:22.683Z
      type: DataTypes.DATE,
    },
    timeWithUs: { // must be aftr 'createdAt' ... should we make a PR to fix this ?
      type: DataTypes.VIRTUAL,
      get() {
        return moment(this.getDataValue('createdAt')).fromNow();
      },
      set(value) {
        console.error('Do not try to set the CorpMember.`timeWithUs` value!');
        // throw new Error('Do not try to set the CorpMember.`timeWithUs` value!');
      },
      comment: 'What should we do with this? Make them invite others after a while? Or ask them how it has been so far?'
    },
    batch: DataTypes.STRING,
    statecode: {
      type: DataTypes.STRING,
      unique: true,
      set(value) { // not needed here??
        this.setDataValue('statecode', value.toUpperCase());
      }
    },
    /**
     * virtual fields aren't ideal because they are not enumerable fields
     */
    servicestate: { // must be after statecode ... should we do an Open Source PR to fix this ?
      type: DataTypes.VIRTUAL,
      get() {
        return this.getServiceState() // ngstates.states_long[ngstates.states_short.indexOf(this.getDataValue('statecode').trim().slice(0, 2).toUpperCase())];
      },
      set(value) {
        console.error('Do not try to set the CorpMember.`servicestate` value!');
        // throw new Error('Do not try to set the CorpMember.`servicestate` value!');
      }
    },
    _location: { // this will be depreciated soon
      type: DataTypes.VIRTUAL,
      get() {
        return this.getServiceState() + (this.getDataValue('city_town') ? ', ' + this.getDataValue('city_town') : ''); // + (this.getDataValue('region_street') ? ', ' + this.getDataValue('region_street') : '' )
      },
      set(value) { // virtual fields show up when model is included in queries ... but it doesn't if you set the variable via hooks. why? cause it's not enumurable when the model is included in queries ?
        console.error('Do not try to set the CorpMember.`location` value!');
        // throw new Error('Do not try to set the CorpMember.`location` value!');
      }
    },
    updatedAt: { // convert to string, it causes error for .ejs template ...plus it's just safer to have '2021-06-12T18:44:22.683Z' in stead of 2021-06-12T18:44:22.683Z
      type: DataTypes.DATE,
    },
    mediaId: {
      type: DataTypes.INTEGER
    },
    pushSubscriptionStringified: {
        type: DataTypes.TEXT,
        get() {
          if (this.getDataValue('pushSubscriptionStringified')) {
            let pushSubscription = JSON.parse(this.getDataValue('pushSubscriptionStringified'))
            // const subscriptionObject = {
            //   endpoint: pushSubscription.endpoint,
            //   keys: {
            //     p256dh: pushSubscription.p256dh, // getKeys is not a function
            //     auth: pushSubscription.auth
            //   }
            // };
            
            // The above is the same output as:
            
            return pushSubscription // we could just return pushSubscription
          } else {
            return null; // or just return this.getDataValue('pushSubscriptionStringified')
          }
        },
        set(value) {
          this.setDataValue('pushSubscriptionStringified', JSON.stringify(value));
        }
    },
    ppaId: DataTypes.INTEGER,
    password: DataTypes.STRING,
    middlename: DataTypes.STRING,
    firstname: DataTypes.STRING,
    lastname: DataTypes.STRING,
    email: DataTypes.STRING,
    wantspaornot: DataTypes.BOOLEAN,
    accommodationornot: DataTypes.BOOLEAN,
    public_profile: DataTypes.STRING,
    nickname: DataTypes.STRING,
    bio: DataTypes.TEXT,
    // maybe have a session insight field of all the corp members's search histroy, liked items, (find how to figure out items they're intrested in)
  }, {
    comment: "Corp Member Table - For everything we can store about corp members",
    sequelize,
    modelName: 'CorpMember',
    hooks: { // used to add virtual fields to dataValues object
      afterCreate(corpMember, {}) {
        corpMember.dataValues.servicestate = ngstates.states_long[ngstates.states_short.indexOf(corpMember.statecode.trim().slice(0, 2).toUpperCase())]
        corpMember.dataValues._location = corpMember.getServiceState(); // or corpMember.dataValues.servicestate; // only using servicestate because city_town won't be existing

        // corpMember.servicestate = ngstates.states_long[ngstates.states_short.indexOf(corpMember.statecode.trim().slice(0, 2).toUpperCase())]
        // corpMember._location = corpMember.getServiceState(); // or corpMember.servicestate;
      },
      afterFind(corpMember, {}) {
        if (corpMember) { // for when we do a find during login, and corp member doesn't exist
          corpMember.dataValues.servicestate = ngstates.states_long[ngstates.states_short.indexOf(corpMember.statecode.trim().slice(0, 2).toUpperCase())]
          corpMember.dataValues._location = corpMember.getServiceState() + (corpMember.city_town ? ', ' + corpMember.city_town : '')

          // commnet if virtual fields are in use ...or remove error thrown in virtual fields
          // corpMember.servicestate = ngstates.states_long[ngstates.states_short.indexOf(corpMember.statecode.trim().slice(0, 2).toUpperCase())]
          // corpMember._location = corpMember.getServiceState() + (corpMember.city_town ? ', ' + corpMember.city_town : '')
        }
      },
      afterUpdate(corpMember, {}) {
        corpMember.dataValues.servicestate = ngstates.states_long[ngstates.states_short.indexOf(corpMember.statecode.trim().slice(0, 2).toUpperCase())]
        corpMember.dataValues._location = corpMember.getServiceState() + (corpMember.city_town ? ', ' + corpMember.city_town : '')

        // corpMember.servicestate = ngstates.states_long[ngstates.states_short.indexOf(corpMember.statecode.trim().slice(0, 2).toUpperCase())]
        // corpMember._location = corpMember.getServiceState() + (corpMember.city_town ? ', ' + corpMember.city_town : '')
      },
    }
  });
  CorpMember.sync({ alter: true })
  .then((_done) => {
    console.log(`Done syncing ${CorpMember.tableName}`);
  }, (_err) => {
    console.error(`err sycing ${CorpMember.tableName}:\n\n`, _err);
  })
  .catch(_reason => { // catches .VIRTUAL data type when altering db
    console.error(`caught this error while sycning ${CorpMember.tableName} table:\n\n`, _reason);
  })
  return CorpMember;
};

/**
 * maybe add a hook that'll include virtual fields in the returned defaultValue object on creation/insert (only access it if you call result.virtualfield)
 * 
 * virtual field is a scam, it doesn't exist in the defaultValues section (even after you reassign). it's redundant adding it via hooks
 * 
 * This error happens for virtual servicestate field: (when sync({alter: true}))
 * 
 * Executing (default): ALTER TABLE "CorpMembers" ALTER COLUMN "servicestate" DROP NOT NULL;ALTER TABLE "CorpMembers" ALTER COLUMN "servicestate" DROP DEFAULT;ALTER TABLE "CorpMembers" ALTER COLUMN "servicestate" TYPE VIRTUAL;
 * (node:2053) UnhandledPromiseRejectionWarning: SequelizeDatabaseError: type "virtual" does not exist
 */