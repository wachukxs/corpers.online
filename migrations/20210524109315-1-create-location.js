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
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      address: {
        type: Sequelize.STRING
      },
      ppaId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'PPA',
          },
          key: 'id'
        },
      },
      CorpMemberId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'CorpMembers',
          },
          key: 'id'
        },
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Locations');
  }
};