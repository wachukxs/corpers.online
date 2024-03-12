'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addConstraint('Alerts', {
      type: 'FOREIGN KEY',
      name: 'alert_cm_id_with_corp_mem_id',
      fields: ['corp_member_id'],
      references: {
        table: 'CorpMembers',
        field: 'id'
      },
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Alerts', 'alert_cm_id_with_corp_mem_id');
  }
};
