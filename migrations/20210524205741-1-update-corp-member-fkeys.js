'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.addConstraint('CorpMembers', {
      type: 'FOREIGN KEY',
      name: 'corp_p_id_with_ppa_id_bcm',
      fields: ['ppa_id'],
      references: {
        table: 'PPA',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    })

    await queryInterface.addConstraint('CorpMembers', {
      type: 'FOREIGN KEY',
      name: 'corp_sn_with_states_short_name_bdm',
      fields: ['state_short_name'],
      references: {
        table: 'States',
        field: 'short_name'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    })

    await queryInterface.addConstraint('CorpMembers', {
      type: 'unique',
      name: 'email',
      fields: ['email'],
    })

  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('CorpMembers', 'corp_p_id_with_ppa_id_bcm');
    await queryInterface.removeConstraint('CorpMembers', 'corp_sn_with_states_short_name_bdm');
    await queryInterface.removeConstraint('CorpMembers', 'email');
  }
};