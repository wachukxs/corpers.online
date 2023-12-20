'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Chats', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      room: {
        type: Sequelize.STRING
      },
      message: {
        type: Sequelize.TEXT
      },
      message_from: {
        type: Sequelize.STRING,
        references: {
          model: {
            tableName: 'CorpMembers',
          },
          key: 'state_code'
        },
      },
      message_to: {
        type: Sequelize.STRING,
        references: {
          model: {
            tableName: 'CorpMembers',
            
          },
          key: 'state_code'
        },
      },
      media_id: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Media',
          },
          key: 'id'
        },
      },
      time: {
        type: Sequelize.DATE
      },
      read_by_to: {
        type: Sequelize.BOOLEAN
      },
      time_read: {
        type: Sequelize.DATE
      },
      _time: {
        type: Sequelize.DATE
      },
      message_sent: {
        type: Sequelize.BOOLEAN
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Chats');
  }
};