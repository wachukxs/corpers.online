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
        references: {
          model: {
            tableName: 'PPA',
          },
          key: 'id'
        },
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
      nickname: {
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
      middle_name: {
        type: Sequelize.STRING
      },
      first_name: {
        type: Sequelize.STRING
      },
      last_name: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
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
      push_subscription_stringified: {
        type: Sequelize.TEXT
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
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
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('CorpMembers');
  }
};