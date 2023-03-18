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
      statecode: {
        type: Sequelize.STRING,
      },
      itemname: {
        type: Sequelize.STRING
      },
      mediaId: {
        type: Sequelize.INTEGER,
      },
      minPrice: {
        type: Sequelize.INTEGER,
      },
      price: {
        type: Sequelize.FLOAT
      },
      text: {
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Sales');
  }
};