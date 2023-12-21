'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('PPA', {
      type: 'FOREIGN KEY',
      name: 'ppa_l_id_with_loc_id',
      fields: ['location_id'],
      references: {
        table: 'Locations',
        field: 'id'
      },
    })

    await queryInterface.addConstraint('PPA', {
      type: 'FOREIGN KEY',
      name: 'ppa_m_id_with_media_id',
      fields: ['media_id'],
      references: {
        table: 'Media',
        field: 'id'
      },
    })

  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('PPA', 'ppa_l_id_with_loc_id');
    await queryInterface.removeConstraint('PPA', 'ppa_m_id_with_media_id');
  }
};