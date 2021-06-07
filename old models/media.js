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
      Media.belongsTo(models.Accommodation, {
        foreignKey: 'id',
        onDelete: 'CASCADE'
      })
      Media.belongsTo(models.Sale, {
        foreignKey: 'id',
        onDelete: 'CASCADE'
      })
    }
  };
  Media.init({
    id: {
      allowNull: false,
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    urls: {
        type: DataTypes.STRING,
        /**
         * takes in 'dslfjakdla29_ljadskfjask,dajsfalsjfalsflas_9289js'
         * @returns [
                'https://drive.google.com/uc?id=dslfjakdla29_ljadskfjask',
                'https://drive.google.com/uc?id=dajsfalsjfalsflas_9289js'
            ]
         */
        get() {
            const rawValue = this.getDataValue(urls);
            return rawValue ? rawValue.split(',').map(x => {
                return new URL(`/uc?id=${x}`, "https://drive.google.com").toString()
            }) : null;
        }
    },
    altText: {
        type: DataTypes.STRING,
    },
  }, {
    sequelize,
    modelName: 'Media',
  });
  Media.sync({
    alter: true,
    force: true
  })
  return Media;
};