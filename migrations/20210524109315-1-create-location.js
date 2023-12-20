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
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      media_id: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Media',
          },
          key: 'id'
        },
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      address: {
        type: Sequelize.STRING
      },
      ppa_id: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'PPA',
          },
          key: 'id'
        },
      },
      accommodation_id: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Accommodation',
          },
          key: 'id'
        },
      },
      corp_member_id: {
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