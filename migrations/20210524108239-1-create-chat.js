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
          key: 'statecode'
        },
      },
      message_to: {
        type: Sequelize.STRING,
        references: {
          model: {
            tableName: 'CorpMembers',
            
          },
          key: 'statecode'
        },
      },
      mediaId: {
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
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Chats');
  }
};