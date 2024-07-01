'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AccommodationBookmark extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      AccommodationBookmark.belongsTo(models.CorpMember, {
        foreignKey: 'corp_member_id',
      });

      AccommodationBookmark.belongsTo(models.Accommodation, {
        foreignKey: 'accommodation_id',
      });
    }
  }
  AccommodationBookmark.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    corp_member_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'CorpMembers',
        key: 'id'
      }
    },
    accommodation_id: {
      type:DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Accommodations',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'AccommodationBookmark',
    tableName: 'AccommodationBookmarks',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  return AccommodationBookmark;
};