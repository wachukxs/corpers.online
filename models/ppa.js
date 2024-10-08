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
      
      PPA.hasMany(models.Media, {
        foreignKey: 'ppa_id'
      })

      // TODO: A PPA can have multiple addresses/location.
      PPA.hasMany(models.Location, {
        foreignKey: 'ppa_id'
      })

      // PPA is source, CorpMember is target (foreign Key is in CorpMember)
      // creates ppa_id in CorpMember / means CorpMember has ppa_id
      PPA.hasMany(models.CorpMember, {
        foreignKey: 'ppa_id', // (leaving as PPId causes bug: TODO???)
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
    name: {
      type: DataTypes.STRING, 
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Name of PPA cannot be empty',
        },
      },
    },
    type_of_ppa: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "The category of the ppa", // should it be an enum?
      validate: {
        notNull: {
          msg: 'PPA type cannot be empty',
        },
      },
    }, // should be category?
    // should we included added by field?
  }, {
    sequelize,
    modelName: 'PPA',
    tableName: 'PPA', // or freeze the table name
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
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