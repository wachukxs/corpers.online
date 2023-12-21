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
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Media', 'media_a_id_with_loc_id');
    await queryInterface.removeConstraint('Media', 'media_s_id_with_sale_id');
    await queryInterface.removeConstraint('Media', 'media_l_id_with_loc_id');
  }
};
