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

  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('CorpMembers', 'corp_p_id_with_ppa_id_bcm');
  }
};