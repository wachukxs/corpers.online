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
      ppaId: {
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
      city_town: {
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
      statecode: {
        type: Sequelize.STRING,
        unique: true
      },
      password: {
        type: Sequelize.STRING
      },
      middlename: {
        type: Sequelize.STRING
      },
      firstname: {
        type: Sequelize.STRING
      },
      lastname: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      mediaId: {
        type: Sequelize.INTEGER,
      },
      pushSubscriptionStringified: {
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
      wantspaornot: {
        type: Sequelize.BOOLEAN,
        default: false
      },
      accommodationornot: {
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