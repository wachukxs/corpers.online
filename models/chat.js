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
      type: DataTypes.STRING
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
      type: DataTypes.STRING,
      references: { // TODO: should reference the id.
        model: 'CorpMembers',
        key: 'state_code'
      }
    },
    message_to: {
      type: DataTypes.STRING,
      references: {
        model: 'CorpMembers',
        key: 'state_code'
      }
    },
    // TODO: no need for read_by_to, we can assume it was read if time_read is set
    read_by_to: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    time_read: DataTypes.DATE,
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
  });
  return Chat;
};