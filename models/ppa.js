'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PPA extends Model {
    static getAllActualAttributes() {
      let safePPAAttributes = Object.keys(PPA.rawAttributes)
      safePPAAttributes.splice(safePPAAttributes.indexOf('ppa_id'), 1);
      
      return safePPAAttributes
    }
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      
      PPA.belongsTo(models.Media, { // means PPA have a media_id
        foreignKey: 'media_id'
      })
      PPA.belongsTo(models.Location, { // means PPA have a locationId
        foreignKey: 'location_id'
      })
      // PPA is source, CorpMember is target (foreign Key is in CorpMember)
      // creates ppa_id in CorpMember
      PPA.hasMany(models.CorpMember, { // means ppa_id is the foreign key in CorpMember, referencing primary key id in PPA
        foreignKey: 'ppa_id', // leaving as PPId causes bug
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
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
    media_id: {
      type:DataTypes.INTEGER
    },
    location_id: { // TODO: specify that this references Location table
      type:DataTypes.INTEGER
    },
    type_of_ppa: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'PPA',
    tableName: 'PPA',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
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