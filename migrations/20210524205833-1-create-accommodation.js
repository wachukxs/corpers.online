'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Accommodation', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      directions: {
        type: Sequelize.STRING
      },
      rent: {
        type: Sequelize.FLOAT
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
      statecode: {
        type: Sequelize.STRING,
        references: {
          model: {
            tableName: 'CorpMembers',
            
          },
          key: 'statecode'
        },
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
    await queryInterface.dropTable('Accommodation');
  }
};