'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.addConstraint('Sales', {
      type: 'FOREIGN KEY',
      name: 'corp_id_with_media_id_cqp',
      fields: ['media_id'],
      references: {
        table: 'Media',
        field: 'id'
      },
    })

    await queryInterface.addConstraint('CorpMembers', {
      type: 'FOREIGN KEY',
      name: 'corp_p_id_with_ppa_id_bcm',
      fields: ['ppa_id'],
      references: {
        table: 'PPA',
        field: 'id'
      },
    })

  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Sales', 'corp_id_with_media_id_cqp');
    await queryInterface.removeConstraint('Sales', 'corp_p_id_with_ppa_id_bcm');
  }
};