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
      name: 'loc_acc_id_with_ppa_id_xyz',
      fields: ['accommodation_id'],
      references: {
        table: 'Accommodation',
        field: 'id'
      },
    })

    await queryInterface.addConstraint('Locations', {
      type: 'FOREIGN KEY',
      name: 'loc_c_m_id_with_cm_id_bdt',
      fields: ['corp_member_id'], // TODO: should be state_code (actually, no.)
      references: {
        table: 'CorpMembers',
        field: 'id'
      },
    })

  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Locations', 'loc_ppa_p_id_with_ppa_id_ddt');
    await queryInterface.removeConstraint('Locations', 'loc_acc_id_with_ppa_id_xyz');
    await queryInterface.removeConstraint('Locations', 'loc_c_m_id_with_cm_id_bdt'); 
  }
};