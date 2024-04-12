'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Sales', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      corp_member_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      item_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      media_id: {
        type: Sequelize.INTEGER,
      },
      minimum_price: {
        type: Sequelize.INTEGER,
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      text: {
        type: Sequelize.TEXT
      },
      is_draft: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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
    await queryInterface.dropTable('Sales');
  }
};