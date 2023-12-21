'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('Locations', {
      type: 'FOREIGN KEY',
      name: 'loc_m_id_with_med_id_ccv',
      fields: ['media_id'],
      references: {
        table: 'Media',
        field: 'id'
      },
    })

    await queryInterface.addConstraint('Locations', {
      type: 'FOREIGN KEY',
      name: 'loc_ppa_p_id_with_ppa_id_xyz',
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
      fields: ['corp_member_id'],
      references: {
        table: 'CorpMembers',
        field: 'id'
      },
    })

  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Locations', 'loc_m_id_with_med_id_ccv');
    await queryInterface.removeConstraint('Locations', 'loc_acc_id_with_ppa_id_xyz');
    await queryInterface.removeConstraint('Locations', 'loc_acc_id_with_ppa_id_xyz');
    await queryInterface.removeConstraint('Locations', 'loc_c_m_id_with_cm_id_bdt'); 
  }
};