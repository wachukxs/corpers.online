'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Alerts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      corp_member_id: {
        type: Sequelize.INTEGER,
      },
      type: {
        type: Sequelize.STRING,
      },
      item_name: {
        type: Sequelize.STRING
      },
      minimum_price: {
        type: Sequelize.FLOAT
      },
      max_price: {
        type: Sequelize.FLOAT
      },
      /**
       * Why do we need this? What's it for?
       * 
       * So we can create alerts for a corp member looking for a type of house.
       * We can use other parameters too.
       */
      accommodation_type: {
        type: Sequelize.STRING,
      },
      rooms: {
        type: Sequelize.STRING,
      },
      note: {
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
      /**
       * Why do we need this? :)
       * 
       * Do we need it for a location - to find when a particular 
       */
      location_id: {
        type: Sequelize.INTEGER
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Alerts');
  }
};