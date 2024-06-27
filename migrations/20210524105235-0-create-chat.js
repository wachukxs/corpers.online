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
        type: Sequelize.STRING,
        comment: 'foreign key - The room for the 2 people chatting - that this chat belongs in'
      },
      message: {
        type: Sequelize.TEXT
      },
      message_from: {
        type: Sequelize.INTEGER,
        comment: 'The person who sent this particular chat/message'
      },
      message_to: {
        type: Sequelize.INTEGER,
        comment: 'The person who this particular chat/message was sent to'
      },
      time_read: {
        type: Sequelize.DATE,
        defaultValue: null
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