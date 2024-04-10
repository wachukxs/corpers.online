'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addConstraint('Media', {
      type: 'FOREIGN KEY',
      name: 'media_a_id_with_loc_id',
      fields: ['accommodation_id'],
      references: {
        table: 'Accommodation',
        field: 'id'
      },
    })

    await queryInterface.addConstraint('Media', {
      type: 'FOREIGN KEY',
      name: 'media_s_id_with_sale_id',
      fields: ['sale_id'],
      references: {
        table: 'Sales',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    })

    await queryInterface.addConstraint('Media', {
      type: 'FOREIGN KEY',
      name: 'media_l_id_with_loc_id',
      fields: ['location_id'],
      references: {
        table: 'Locations',
        field: 'id'
      },
    })

    await queryInterface.addConstraint('Media', {
      type: 'FOREIGN KEY',
      name: 'media_cm_id_with_corp_mem_id',
      fields: ['corp_member_id'],
      references: {
        table: 'CorpMembers',
        field: 'id'
      },
    })

    await queryInterface.addConstraint('Media', {
      type: 'FOREIGN KEY',
      name: 'media_c_id_with_chat_id',
      fields: ['chat_id'],
      references: {
        table: 'Chats',
        field: 'id'
      },
    })

    await queryInterface.addConstraint('Media', {
      type: 'FOREIGN KEY',
      name: 'media_c_id_with_ppa_id',
      fields: ['ppa_id'],
      references: {
        table: 'PPA',
        field: 'id'
      },
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Media', 'media_a_id_with_loc_id');
    await queryInterface.removeConstraint('Media', 'media_s_id_with_sale_id');
    await queryInterface.removeConstraint('Media', 'media_l_id_with_loc_id');
    await queryInterface.removeConstraint('Media', 'media_cm_id_with_corp_mem_id');
    await queryInterface.removeConstraint('Media', 'media_c_id_with_chat_id');
    await queryInterface.removeConstraint('Media', 'media_c_id_with_ppa_id');
  }
};
