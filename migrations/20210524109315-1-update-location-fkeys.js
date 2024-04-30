'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.addConstraint('Locations', {
      type: 'FOREIGN KEY',
      name: 'loc_ppa_p_id_with_ppa_id_ddt',
      fields: ['ppa_id'],
      references: {
        table: 'PPA',
        field: 'id'
      },
    })

    await queryInterface.addConstraint('Locations', {
      type: 'FOREIGN KEY',
      name: 'loc_acc_id_with_acc_id_xyz',
      fields: ['accommodation_id'],
      references: {
        table: 'Accommodation',
        field: 'id'
      },
    })

    await queryInterface.addConstraint('Locations', {
      type: 'FOREIGN KEY',
      name: 'loc_c_m_id_with_cm_id_bdt',
      fields: ['corp_member_id'], // not state_code (because state_code can change)
      references: {
        table: 'CorpMembers',
        field: 'id'
      },
    })


    await queryInterface.addConstraint('Locations', {
      type: 'FOREIGN KEY',
      name: 'st_lga_id_with_loc_id_ffd',
      fields: ['state_lga_id'],
      references: {
        table: 'StateLGAs',
        field: 'id'
      },
    })

    await queryInterface.addConstraint('Locations', {
      type: 'FOREIGN KEY',
      name: 'states_id_with_loc_id_dfn',
      fields: ['state_id'],
      references: {
        table: 'States',
        field: 'id'
      },
    })

  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Locations', 'loc_ppa_p_id_with_ppa_id_ddt');
    await queryInterface.removeConstraint('Locations', 'loc_acc_id_with_acc_id_xyz');
    await queryInterface.removeConstraint('Locations', 'loc_c_m_id_with_cm_id_bdt');
    await queryInterface.removeConstraint('Locations', 'st_lga_id_with_loc_id_ffd');
    await queryInterface.removeConstraint('Locations', 'states_id_with_loc_id_dfn');
  }
};