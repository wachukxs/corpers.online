'use strict';
const {
  Model
} = require('sequelize');
const moment = require('moment');
module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Chat.hasMany(models.Media, {
        foreignKey: 'chat_id'
      })

      Chat.belongsTo(models.CorpMember, {
        foreignKey: 'message_to',
        as: 'ToCorpMember',
      })

      Chat.belongsTo(models.CorpMember, {
        foreignKey: 'message_from',
        as: 'FromCorpMember',
      })

    }
  };
  Chat.init({
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    room: {
      type: DataTypes.STRING,
      comment: 'The room of this chat message',
      references: {
        model: 'ChatRooms',
        key: 'room',
      }
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'Message cannot be empty',
        },
      },
    },
    message_from: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'CorpMembers',
        key: 'id',
      }
    },
    message_to: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'CorpMembers',
        key: 'id'
      }
    },
    time_read: {
      type: DataTypes.DATE,
      defaultValue: null,
      comment: 'We can assume chat was read if time_read is set',
    },
    _time_read: {
      type: DataTypes.VIRTUAL,
      get() {
        const time_read = this.getDataValue('time_read')
        return time_read ? moment(time_read).fromNow() : 'Not read yet.';
      },
      set(value) {
        throw new Error('Do not try to set the Chat.`_time_read` value!');
      }
    },
    message_sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    age: {
      type: DataTypes.VIRTUAL,
      get() {
        return moment(this.getDataValue('created_at')).fromNow();
      },
      set(value) {
        throw new Error('Do not try to set the Chat.`age` value!');
      }
    }
  }, {
    sequelize,
    modelName: 'Chat',
    tableName: 'Chats',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      afterCreate: (chat, options) => {
        // console.log('??', chat, options);
      },
    }
  });
  return Chat;
};