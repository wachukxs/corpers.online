'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PPA extends Model {
    static getAllActualAttributes() {
      let safePPAAttributes = Object.keys(PPA.rawAttributes)
      safePPAAttributes.splice(safePPAAttributes.indexOf('ppaId'), 1);
      
      return safePPAAttributes
    }
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      
      PPA.belongsTo(models.Media, { // means PPA have a mediaId
        foreignKey: 'mediaId'
      })
      PPA.belongsTo(models.Location, { // means PPA have a locationId
        foreignKey: 'locationId'
      })
      // PPA is source, CorpMember is target (foreign Key is in CorpMember)
      // creates ppaId in CorpMember
      PPA.hasMany(models.CorpMember, { // means ppaId is the forigen key in CorpMember, referencing primary key id in PPA
        foreignKey: 'ppaId', // causes bug, leaving as PPId
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
    createdAt: {
      type: DataTypes.DATE
    },
    updatedAt: {
      type: DataTypes.DATE
    },
    name: DataTypes.STRING,
    mediaId: {
      type:DataTypes.INTEGER
    },
    locationId: {
      type:DataTypes.INTEGER
    },
    type_of_ppa: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'PPA',
    // tableName: 'PPA', // since we're freezing, we don't need to specify tableName
    freezeTableName: true, // if you freeze table name, does that means foreign keys can't change ?
  });
  // PPA.sync({ alter: true })
  return PPA;
};


/***
 * 
 * mad bug
 * if you freeze a table name,
 * create a belongsTo, and hasMany relationship....
 * then do a findOne from the one that belongs to ...
 * why does it try to find a foreign key in the .hasMany (that doesn't belong there)
 * 
 * what I mean:
 * https://sequelize.org/master/manual/naming-strategies.html
 * 
 * last sample in page:
 * // Fixed example
    Invoice.belongsTo(Subscription, { as: 'TheSubscription', foreignKey: 'subscription_id' });
    Subscription.hasMany(Invoice, { foreignKey: 'subscription_id' });

    Then do Invoice.findOne(..., {include: Subscription}) 

    this looks for Subscription.subscription_id

    should create a PR to fix it ... related to https://github.com/sequelize/sequelize/issues/13309

    hot fix implemented in ./auth.js ... CorpMember.findOne(..., include: [PPA, Media])
 */