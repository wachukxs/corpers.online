'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AccommodationLike extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here

      AccommodationLike.belongsTo(models.CorpMember, {
        foreignKey: 'corp_member_id',
      });

      AccommodationLike.belongsTo(models.Accommodation, {
        foreignKey: 'accommodation_id',
      });
    }
  }
  AccommodationLike.init({
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
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Accommodations',
        key: 'id'
      }
    },
  }, {
    sequelize,
    modelName: 'AccommodationLike',
    tableName: 'AccommodationLikes',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  return AccommodationLike;
};