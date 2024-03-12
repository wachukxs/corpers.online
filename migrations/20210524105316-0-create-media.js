'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Media', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sale_id: {
        type: Sequelize.INTEGER
      },
      location_id: {
        type: Sequelize.INTEGER
      },
      corp_member_id: {
        type: Sequelize.INTEGER
      },
      chat_id: {
        type: Sequelize.INTEGER
      },
      ppa_id: {
        type: Sequelize.INTEGER
      },
      accommodation_id: {
        type: Sequelize.INTEGER
      },
      urls: {
        type: Sequelize.STRING
      },
      alt_text: {
        type: Sequelize.STRING
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Media');
  }
};