'use strict';
const {
  Model
} = require('sequelize');
const moment = require('moment');
const ngstates = require('../utilities/ngstates');

/**
 * use sparQL to show relationship between data ... show friend of a friend relationship ...esp between people selling and buying ... got introduced by Simeon
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
    getServiceState() { // during an update, this.state_code turn up null ... why ??? ...not anymore (because this.state_code is always set for every db operation)
      // console.log("\n\n\n\nwhy is this.state_code null??", this.state_code);
      return this.state_code ? ngstates.states_long[ngstates.states_short.indexOf(this.state_code.slice(0, 2))] : '';
    }
    /**
     * CorpMember attributes without password, and push_subscription_stringified
     * impl idea from https://stackoverflow.com/a/66956107/9259701
     * @returns array of attributes without password
     */
    static getSafeAttributes() {
      const safeCorpMemberAttributes = Object.keys(CorpMember.getAttributes())
      // remove get these values
      return safeCorpMemberAttributes.filter((x) => !['push_subscription_stringified', 'password'].includes(x))
    }

    static getPublicAttributes() {
      const safeCorpMemberAttributes = Object.keys(CorpMember.getAttributes())
      return safeCorpMemberAttributes.filter((x) => [
        'state_code', 'nickname', 'first_name', // only get these values
      ].includes(x))
    }

    static getSearchableAttributes() {
      const safeCorpMemberAttributes = Object.keys(CorpMember.getAttributes())
      return safeCorpMemberAttributes.filter((x) => [
        'state_code', 'nickname', 'first_name', 'bio', 'created_at', '_age', // only get these values
      ].includes(x))
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
        foreignKey: 'ppa_id',
      })

      CorpMember.hasMany(models.Sale, { // if you want a unique name for when you do CorpMember.findOne({}) etc, put an `as` attribute here
        foreignKey: 'corp_member_id', // should we use state_code or id ? what if they update their state_code ? we'd mass update it
        sourceKey: 'id',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
      CorpMember.hasMany(models.Accommodation, {
        foreignKey: 'corp_member_id',
        sourceKey: 'id',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      })
      
      CorpMember.hasOne(models.Media, {
        foreignKey: 'corp_member_id',
        as: 'Media'
      })

      /**
       * Still need to work exactly how this will work.
       * Location should have an array of all the corp member who have edited or confirmed it's location
       */
      CorpMember.hasMany(models.Location, {
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      })

      CorpMember.hasMany(models.Review, {
        foreignKey: 'corp_member_id',
      })
    }
  };
  CorpMember.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
      set(value) {
        console.error('Do not try to set the CorpMember.`id` value!');
        // throw new Error('Do not try to set the CorpMember.`id` value!');
      },
    },
    travel_from_city: DataTypes.STRING,
    travel_from_state: DataTypes.STRING,
    accommodation_location: DataTypes.STRING, // TODO: needs to change!! put in location model
    region_street: DataTypes.STRING,
    city_or_town: DataTypes.STRING,
    email: {
      type:DataTypes.STRING,
      unique: 'email',
      validate: {
        isEmail: true
      },
      set(value) {
        this.setDataValue('email', value.toLowerCase());
      }
    },
    lga: DataTypes.STRING, // shouldn't this be nested
    stream: DataTypes.STRING,
    time_with_us: { // must be after 'created_at' ... should we make a PR to fix this ?
      type: DataTypes.VIRTUAL,
      get() {
        return moment(this.getDataValue('created_at')).fromNow();
      },
      set(value) {
        console.error('Do not try to set the CorpMember.`time_with_us` value!');
        // throw new Error('Do not try to set the CorpMember.`time_with_us` value!');
      },
      comment: 'What should we do with this? Make them invite others after a while? Or ask them how it has been so far?'
    },
    batch: DataTypes.STRING,
    state_code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      set(value) { // not needed here??
        this.setDataValue('state_code', value.toUpperCase());
      },
      validate: {
        notNull: {
          msg: 'State code cannot be empty',
        },
      },
    },
    /**
     * virtual fields aren't ideal because they are not enumerable fields
     */
    service_state: { // must be after state_code ... should we do an Open Source PR to fix this ?
      type: DataTypes.VIRTUAL,
      get() {
        return this.getServiceState() // ngstates.states_long[ngstates.states_short.indexOf(this.getDataValue('state_code').trim().slice(0, 2).toUpperCase())];
      },
      set(value) {
        console.error('Do not try to set the CorpMember.`service_state` value!');
        // throw new Error('Do not try to set the CorpMember.`service_state` value!');
      }
    },
    _location: { // this will be depreciated soon, why??
      type: DataTypes.VIRTUAL,
      get() {
        return this.getServiceState() + (this.getDataValue('city_or_town') ? ', ' + this.getDataValue('city_or_town') : ''); // + (this.getDataValue('region_street') ? ', ' + this.getDataValue('region_street') : '' )
      },
      set(value) { // virtual fields show up when model is included in queries ... but it doesn't if you set the variable via hooks. why? cause it's not enumerable when the model is included in queries ?
        console.error('Do not try to set the CorpMember.`location` value!');
        // throw new Error('Do not try to set the CorpMember.`location` value!');
      }
    },
    push_subscription_stringified: {
        type: DataTypes.TEXT,
        get() {
          if (this.getDataValue('push_subscription_stringified')) {
            let pushSubscription = JSON.parse(this.getDataValue('push_subscription_stringified'))
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
            return null; // or just return this.getDataValue('push_subscription_stringified')
          }
        },
        set(value) {
          this.setDataValue('push_subscription_stringified', JSON.stringify(value));
        }
    },
    ppa_id: {
      type: DataTypes.INTEGER,
      // TODO: declare link to PPA
    },
    password: DataTypes.STRING,
    middle_name: DataTypes.STRING,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    want_spa_or_not: DataTypes.BOOLEAN,
    looking_for_accommodation_or_not: DataTypes.BOOLEAN,
    public_profile: DataTypes.BOOLEAN,
    nickname: DataTypes.STRING,
    bio: DataTypes.TEXT,
    _age: {
      type: DataTypes.VIRTUAL,
      get() {
        return moment(this.getDataValue('created_at')).fromNow();
      },
      set(value) {
        throw new Error('Do not try to set the Sale.`age` value!');
      }
    },
    // maybe have a session insight field of all the corp members's search history, liked items, (find how to figure out items they're intrested in)
  }, {
    comment: "Corp Member Table - For everything we can store about corp members",
    sequelize,
    modelName: 'CorpMember',
    tableName: 'CorpMembers',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: { // used to add virtual fields to dataValues object, why???
      afterCreate(corpMember, {}) {
        // corpMember.dataValues.service_state = ngstates.states_long[ngstates.states_short.indexOf(corpMember.dataValues?.state_code?.trim()?.slice(0, 2).toUpperCase())]
        // corpMember.dataValues._location = corpMember.getServiceState(); // or corpMember.dataValues.service_state; // only using service_state because city_or_town won't be existing
      },
      afterFind(corpMember, {}) {
        // corpMember can (sometimes?) be an array?
        // if (corpMember) { // for when we do a find during login, and corp member doesn't exist (???)
        //   corpMember.dataValues.service_state = ngstates.states_long[
        //     ngstates.states_short.indexOf(corpMember.dataValues.state_code?.trim()?.slice(0, 2)?.toUpperCase())
        //   ]
        //   corpMember.dataValues._location = corpMember.getServiceState() + (corpMember.dataValues?.city_or_town ? ', ' + corpMember.dataValues?.city_or_town : '')
        // }
      },
      afterUpdate(corpMember, {}) {
        // corpMember.dataValues.service_state = ngstates.states_long[ngstates.states_short.indexOf(corpMember.dataValues.state_code.trim().slice(0, 2).toUpperCase())]
        // corpMember.dataValues._location = corpMember.getServiceState() + (corpMember.city_or_town ? ', ' + corpMember.city_or_town : '')
      },
    }
  });
  return CorpMember;
};

/**
 * maybe add a hook that'll include virtual fields in the returned defaultValue object on creation/insert (only access it if you call result.virtualfield)
 * 
 * virtual field is a scam, it doesn't exist in the defaultValues section (even after you reassign). it's redundant adding it via hooks
 * 
 * This error happens for virtual service_state field: (when sync({alter: true}))
 * 
 * Executing (default): ALTER TABLE "CorpMembers" ALTER COLUMN "service_state" DROP NOT NULL;ALTER TABLE "CorpMembers" ALTER COLUMN "service_state" DROP DEFAULT;ALTER TABLE "CorpMembers" ALTER COLUMN "service_state" TYPE VIRTUAL;
 * (node:2053) UnhandledPromiseRejectionWarning: SequelizeDatabaseError: type "virtual" does not exist
 */
