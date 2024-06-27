'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('Chats', {
      type: 'FOREIGN KEY',
      name: 'msg_from_from_with_corp_id',
      fields: ['message_from'],
      references: {
        table: 'CorpMembers',
        field: 'id'
      },
    })

    await queryInterface.addConstraint('Chats', {
      type: 'FOREIGN KEY',
      name: 'msg_to_from_with_corp_id',
      fields: ['message_to'],
      references: {
        table: 'CorpMembers',
        field: 'id'
      },
    })

  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Chats', 'msg_from_from_with_corp_id');
    await queryInterface.removeConstraint('Chats', 'msg_to_from_with_corp_id');
  }
};