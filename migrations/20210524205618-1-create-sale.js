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
      state_code: {
        type: Sequelize.STRING,
        references: {
          model: {
            tableName: 'CorpMembers',
          },
          key: 'state_code'
        },
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
      item_name: {
        type: Sequelize.STRING
      },
      minimum_price: {
        type: Sequelize.INTEGER,
      },
      price: {
        type: Sequelize.FLOAT
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