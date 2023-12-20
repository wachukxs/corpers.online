'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Alerts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      state_code: {
        type: Sequelize.STRING,
      },
      type: {
        type: Sequelize.STRING,
      },
      item_name: {
        type: Sequelize.STRING
      },
      minimum_price: {
        type: Sequelize.FLOAT
      },
      max_price: {
        type: Sequelize.FLOAT
      },
      accommodation_type: {
        type: Sequelize.STRING,
      },
      rooms: {
        type: Sequelize.STRING,
      },
      note: {
        type: Sequelize.TEXT
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      location_id: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Location',
          },
          key: 'id'
        },
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Alerts');
  }
};