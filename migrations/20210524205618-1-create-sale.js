'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('Sales', {
      type: 'FOREIGN KEY',
      name: 'sale_m_id_with_media_id_wxc',
      fields: ['media_id'],
      references: {
        table: 'Media',
        field: 'id'
      },
    })

    await queryInterface.addConstraint('Sales', {
      type: 'FOREIGN KEY',
      name: 'sales_c_m_id_with_cm_id_fdk',
      fields: ['state_code'],
      references: {
        table: 'CorpMembers',
        field: 'state_code'
      },
    })

  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Sales', 'sale_m_id_with_media_id_wxc');
    await queryInterface.removeConstraint('Sales', 'sales_c_m_id_with_cm_id_fdk');
  }
};