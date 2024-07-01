'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('Accommodations', {
      type: 'FOREIGN KEY',
      name: 'acc_l_id_with_loc_id',
      fields: ['location_id'],
      references: {
        table: 'Locations',
        field: 'id'
      },
    })

    await queryInterface.addConstraint('Accommodations', {
      type: 'FOREIGN KEY',
      name: 'acc_cm_id_with_corp_id',
      fields: ['corp_member_id'],
      references: {
        table: 'CorpMembers',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Accommodations', 'acc_l_id_with_loc_id');
    await queryInterface.removeConstraint('Accommodations', 'acc_cm_id_with_corp_id');
  }
};
