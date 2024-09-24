'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChatRoom extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ChatRoom.hasMany(models.Chat, {
        foreignKey: 'room',
        sourceKey: 'room',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      })

      ChatRoom.belongsTo(models.CorpMember, {
        foreignKey: 'message_to',
        as: 'ToCorpMember',
      })

      ChatRoom.belongsTo(models.CorpMember, {
        foreignKey: 'message_from',
        as: 'FromCorpMember',
      })
    }

    static getPublicAttributes() {
      const safeCorpMemberAttributes = Object.keys(ChatRoom.getAttributes())
      return safeCorpMemberAttributes.filter((x) => ![
        'id', // remove these values
      ].includes(x))
    }
  }
  ChatRoom.init({
    // Do we really need IDs?
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    room: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    message_to: {
      type: DataTypes.STRING
    },
    message_from: {
      type: DataTypes.STRING,
      comment: 'The first person who sent the message - and thus created the room'
    },
  }, {
    sequelize,
    modelName: 'ChatRoom',
    tableName: 'ChatRooms',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
  return ChatRoom;
};