'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Review.init({
    corp_member_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'CorpMembers',
        key: 'id'
      },
      allowNull: false
    },
    comment: {
      type: DataTypes.TEXT
    },
    star_rating: {
      type: DataTypes.INTEGER,
      comment: "Rating out of 5"
    },
    ppa_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'PPA',
        key: 'id'
      },
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Review',
    tableName: 'Reviews',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  return Review;
};