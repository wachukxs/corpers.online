'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('WaitLists', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      servingstate: {
        type: Sequelize.STRING,
      },
      middlename: {
        type: Sequelize.STRING,
      },
      firstname: {
        type: Sequelize.STRING
      },
      lastname: {
        type: Sequelize.FLOAT
      },
      email: {
        type: Sequelize.FLOAT
      },
      comment: {
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
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('WaitLists');
  }
};