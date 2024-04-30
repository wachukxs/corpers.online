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
      type:DataTypes.INTEGER,
      references: {
        table: 'PPA',
        field: 'id'
      },
    },
    accommodation_id: {
      type:DataTypes.INTEGER,
      references: {
        table: 'Accommodation',
        field: 'id'
      },
    },
    sale_id: {
      type:DataTypes.INTEGER,
      references: {
        table: 'Sales',
        field: 'id'
      },
    },
    corp_member_id: {
      type:DataTypes.INTEGER,
      references: {
        model: 'CorpMembers',
        key: 'id'
      }
    },
    chat_id: {
      type:DataTypes.INTEGER,
      references: {
        table: 'Chats',
        field: 'id'
      },
    },
    location_id: {
      type:DataTypes.INTEGER,
      references: {
        table: 'Locations',
        field: 'id'
      },
    },
    // TODO: rename column to 'url' // and in other places where it's used
    url: {
      type:DataTypes.STRING,
      // get() {
      //   const rawValue = this.getDataValue('url');
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
