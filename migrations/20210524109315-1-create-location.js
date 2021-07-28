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
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      mediaId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Media',
          },
          key: 'id'
        },
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
      accommodationId: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Accommodation',
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