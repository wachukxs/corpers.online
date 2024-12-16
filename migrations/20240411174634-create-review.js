'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Reviews', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      corp_member_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'CorpMembers',
          key: 'id'
        },
        allowNull: false
      },
      comment: {
        type: Sequelize.TEXT
      },
      star_rating: {
        type: Sequelize.INTEGER,
        comment: "Rating out of 5",
        defaultValue: null
      },
      ppa_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'PPA',
          key: 'id'
        },
        allowNull: false
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Reviews');
  }
};