'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('CorpMembers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      ppa_id: {
        type: Sequelize.INTEGER,
      },
      travel_from_city: {
        type: Sequelize.STRING
      },
      travel_from_state: {
        type: Sequelize.STRING
      },
      accommodation_location: {
        type: Sequelize.STRING
      },
      region_street: {
        type: Sequelize.STRING
      },
      city_or_town: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      lga: {
        type: Sequelize.STRING
      },
      stream: {
        type: Sequelize.STRING
      },
      batch: {
        type: Sequelize.STRING
      },
      state_code: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING
      },
      middle_name: {
        type: Sequelize.STRING
      },
      first_name: {
        type: Sequelize.STRING
      },
      last_name: {
        type: Sequelize.STRING
      },
      nickname: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      media_id: {
        type: Sequelize.INTEGER,
      },
      push_subscription_stringified: {
        type: Sequelize.TEXT
      },
      want_spa_or_not: {
        type: Sequelize.BOOLEAN,
        default: false
      },
      looking_for_accommodation_or_not: {
        type: Sequelize.BOOLEAN,
        default: false
      },
      public_profile: {
        type: Sequelize.BOOLEAN,
        default: false
      },
      bio: {
        type: Sequelize.TEXT
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('CorpMembers');
  }
};