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
      statecode: {
        type: Sequelize.STRING,
      },
      type: {
        type: Sequelize.STRING,
      },
      itemname: {
        type: Sequelize.STRING
      },
      minPrice: {
        type: Sequelize.FLOAT
      },
      maxPrice: {
        type: Sequelize.FLOAT
      },
      accommodationType: {
        type: Sequelize.STRING,
      },
      rooms: {
        type: Sequelize.STRING,
      },
      note: {
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      locationId: {
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