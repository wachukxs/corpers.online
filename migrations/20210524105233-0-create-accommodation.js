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
      // address: {
      //   type: Sequelize.STRING
      // },
      // directions: {
      //   type: Sequelize.TEXT
      // },
      rent: {
        type: Sequelize.FLOAT
      },
      location_id: {
        type: Sequelize.INTEGER
      },
      roommate_rent: {
        type: Sequelize.FLOAT
      },
      corp_member_id: {
        type: Sequelize.INTEGER,
      },
      accommodation_type: {
        type: Sequelize.STRING,
      },
      available_rooms: {
        type: Sequelize.STRING,
      },
      rent_interval: {
        type: Sequelize.ENUM,
        values: ['monthly', 'quarterly', 'yearly']
      },
      tenure: {
        type: Sequelize.STRING,
      },
      ideal_roommate: {
        type: Sequelize.TEXT,
      },
      roommate_rent: {
        type: Sequelize.FLOAT,
      },
      occupant_description: {
        type: Sequelize.TEXT,
      },
      rent_expire_date: {
        type: Sequelize.DATE,
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
    }).catch(err => {
      console.error("000 catching this\n\n\n", err);
    });
  },
  down: async (queryInterface, Sequelize) => {

    // https://github.com/sequelize/sequelize/issues/2554#issuecomment-365383347
    // await queryInterface.removeColumn('Accommodation', 'rent_interval')
    //   .catch(err => {
    //     console.error('caught down 1', err)
    //   });
    // await queryInterface.sequelize.query('DROP TYPE "enum_Accommodation_rentInterval";')
    //   .catch(err => {
    //     console.error('caught down 1', err)
    //   });
    await queryInterface.dropTable('Accommodation');
    /**
     * To prevent error: (node:10501) UnhandledPromiseRejectionWarning: SequelizeDatabaseError: type "enum_Accommodation_rentInterval" already exists
     * 1. https://stackoverflow.com/questions/60898055/unhandled-rejection-sequelizedatabaseerror-type-enum-already-exists
     * 2. https://stackoverflow.com/questions/45437924/drop-and-create-enum-with-sequelize-correctly
     */
    // await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Accommodation_rentInterval";');

    // https://github.com/sequelize/sequelize/issues/2554
    // await queryInterface.dropAllEnums();

  }
};