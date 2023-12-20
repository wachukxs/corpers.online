'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('PPA', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      type_of_ppa: {
        type: Sequelize.STRING
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
      location_id: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: 'Location',
          },
          key: 'id'
        },
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
    await queryInterface.dropTable('PPA');
  }
};