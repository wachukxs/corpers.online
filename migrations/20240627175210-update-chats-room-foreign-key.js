'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // For Chats table (should ideally be in a separate file?)
    await queryInterface.addConstraint('Chats', {
      type: 'FOREIGN KEY',
      name: 'chats_room_ref_chatrooms_room_axd',
      fields: ['room'],
      references: {
        table: 'ChatRooms',
        field: 'room'
      },
    })

    // For ChatRooms table
    await queryInterface.addConstraint('ChatRooms', {
      type: 'FOREIGN KEY',
      name: 'chats_msg_from_ref_corp_mem_id_dda',
      fields: ['message_from'],
      references: {
        table: 'CorpMembers',
        field: 'id'
      },
    })

    await queryInterface.addConstraint('ChatRooms', {
      type: 'FOREIGN KEY',
      name: 'chats_msg_to_ref_corp_mem_id_pod',
      fields: ['message_to'],
      references: {
        table: 'CorpMembers',
        field: 'id'
      },
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Chats', 'chats_room_ref_chatrooms_room_axd');

    await queryInterface.removeConstraint('ChatRooms', 'chats_msg_from_ref_corp_mem_id_dda');
    await queryInterface.removeConstraint('ChatRooms', 'chats_msg_to_ref_corp_mem_id_pod');
  }
};
