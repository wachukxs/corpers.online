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
      Media.hasOne(models.Sale, { // means Sale has media_id
        foreignKey: 'media_id'
      });
      Media.hasOne(models.Accommodation, {
        foreignKey: 'media_id'
      });
      Media.hasOne(models.CorpMember, {
        foreignKey: 'media_id'
      });
      Media.hasOne(models.PPA, {
        foreignKey: 'media_id'
      });
      Media.hasOne(models.Chat, {
        foreignKey: 'media_id'
      });
      Media.hasOne(models.Location, {
        foreignKey: 'media_id'
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
    // TODO: should URLs be like a table on it's own??
    urls: {
      type:DataTypes.STRING,
    /**
     * takes in 'dslfjakdla29_ljadskfjask, dajsfalsjfalsflas_9289js'
     * @returns [
            'https://drive.google.com/uc?id=dslfjakdla29_ljadskfjask',
            'https://drive.google.com/uc?id=dajsfalsjfalsflas_9289js'
        ]
      */
      get() {
        const rawValue = this.getDataValue('urls');
        return rawValue ? rawValue.split(',').map(x => {
            return new URL(`/uc?id=${x}`, "https://drive.google.com").toString()
        }) : null;
      }
    },
    alt_text: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Media',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  // Media.sync({ alter: true })
  return Media;
};
