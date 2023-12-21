'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('Accommodation', {
      type: 'FOREIGN KEY',
      name: 'acc_l_id_with_loc_id',
      fields: ['location_id'],
      references: {
        table: 'Locations',
        field: 'id'
      },
    })

    await queryInterface.addConstraint('Accommodation', {
      type: 'FOREIGN KEY',
      name: 'acc_m_id_with_media_id',
      fields: ['media_id'],
      references: {
        table: 'Media',
        field: 'id'
      },
    })

    await queryInterface.addConstraint('Accommodation', {
      type: 'FOREIGN KEY',
      name: 'acc_st_code_with_corp_sc',
      fields: ['state_code'],
      references: {
        table: 'CorpMembers',
        field: 'state_code'
      },
    }).catch(err => {
      console.error("111 catching this\n\n\n", err);
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Accommodation', 'acc_l_id_with_loc_id');
    await queryInterface.removeConstraint('Accommodation', 'acc_m_id_with_media_id');
    await queryInterface.removeConstraint('Accommodation', 'acc_st_code_with_corp_sc');
  }
};