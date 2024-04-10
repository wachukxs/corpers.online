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
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    })

  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('PPA', 'ppa_l_id_with_loc_id');
  }
};