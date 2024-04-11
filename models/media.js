'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Media extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Media.belongsTo(models.Sale, {
        foreignKey: 'sale_id'
      });
      Media.belongsTo(models.Accommodation, {
        foreignKey: 'accommodation_id'
      });
      Media.belongsTo(models.CorpMember, {
        foreignKey: 'corp_member_id',
      });
      /**
       * Media can't belong to a PPA.
       * It can only belong to a Location.
       * But what if we have a PPA without a location.
       * Pictures and videos of that PPA should be able to be added.
       */
      Media.belongsTo(models.PPA, {
        foreignKey: 'ppa_id'
      });
      Media.belongsTo(models.Chat, {
        foreignKey: 'chat_id'
      });
      Media.belongsTo(models.Location, {
        foreignKey: 'location_id'
      });
    }
  };
  /**
   * We should be saving media width and height ...so we can send to front end and do some image load optimizations
   */
  Media.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    ppa_id: {
      type:DataTypes.INTEGER
    },
    accommodation_id: {
      type:DataTypes.INTEGER
    },
    corp_member_id: {
      type:DataTypes.INTEGER
    },
    chat_id: {
      type:DataTypes.INTEGER
    },
    location_id: {
      type:DataTypes.INTEGER
    },
    // TODO: rename column to 'url' // and in other places where it's used
    urls: {
      type:DataTypes.STRING,
    /**
     * takes in 'dslfjakdla29_ljadskfjask, dajsfalsjfalsflas_9289js'
     * @returns [
            'https://drive.google.com/uc?id=dslfjakdla29_ljadskfjask',
            'https://drive.google.com/uc?id=dajsfalsjfalsflas_9289js'
        ]
      */
      // get() {
      //   const rawValue = this.getDataValue('urls');
      //   return rawValue ? rawValue.split(',').map(x => {
      //       return new URL(`/uc?id=${x}`, "https://drive.google.com").toString()
      //   }) : null;
      // }
    },
    alt_text: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Media',
    timestamps: true,
    freezeTableName: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  return Media;
};
