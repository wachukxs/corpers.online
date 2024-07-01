'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SaleLike extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      SaleLike.belongsTo(models.CorpMember, {
        foreignKey: 'corp_member_id',
      });

      SaleLike.belongsTo(models.Sale, {
        foreignKey: 'sale_id',
      });
    }
  }
  SaleLike.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    corp_member_id: {
      type:DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'CorpMembers',
        key: 'id'
      }
    },
    sale_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Sales',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'SaleLike',
    tableName: 'SaleLikes',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  return SaleLike;
};