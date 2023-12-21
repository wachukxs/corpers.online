'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('Chats', {
      type: 'FOREIGN KEY',
      name: 'msg_from_from_with_corp_id',
      fields: ['message_from'],
      references: {
        table: 'CorpMembers',
        field: 'state_code'
      },
    })

    await queryInterface.addConstraint('Chats', {
      type: 'FOREIGN KEY',
      name: 'msg_to_from_with_corp_id',
      fields: ['message_to'],
      references: {
        table: 'CorpMembers',
        field: 'state_code'
      },
    })

    await queryInterface.addConstraint('Chats', {
      type: 'FOREIGN KEY',
      name: 'chat_m_id_with_media_id',
      fields: ['media_id'],
      references: {
        table: 'Media',
        field: 'id'
      },
    })

  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Chats', 'msg_from_from_with_corp_id');
    await queryInterface.removeConstraint('Chats', 'msg_to_from_with_corp_id');
    await queryInterface.removeConstraint('Chats', 'chat_m_id_with_media_id');
  }
};