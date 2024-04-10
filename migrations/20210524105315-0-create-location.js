'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Locations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      directions: {
        type: Sequelize.TEXT
      },
      address: {
        type: Sequelize.STRING
      },
      ppa_id: {
        type: Sequelize.INTEGER,
      },
      state_id: {
        type: Sequelize.INTEGER
      },
      state_lga_id: {
        type: Sequelize.INTEGER,
      },
      accommodation_id: {
        type: Sequelize.INTEGER,
      },
      corp_member_id: {
        type: Sequelize.INTEGER
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Locations');
  }
};