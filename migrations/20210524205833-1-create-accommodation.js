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
      address: {
        type: Sequelize.STRING
      },
      directions: {
        type: Sequelize.TEXT
      },
      rent: {
        type: Sequelize.FLOAT
      },
      roommateRent: {
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
      rentRange: {
        type: Sequelize.ENUM,
        values: ['monthly', 'quarterly', 'yearly']
      },
      accommodationType: {
        type: Sequelize.STRING,
      },
      availableRooms: {
        type: Sequelize.STRING,
      },
      tenure: {
        type: Sequelize.STRING,
      },
      idealRoommate: {
        type: Sequelize.TEXT,
      },
      roommateRent: {
        type: Sequelize.FLOAT,
      },
      occupantDescription: {
        type: Sequelize.TEXT,
      },
      rentExpireDate: {
        type: Sequelize.DATE,
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
    }).catch(err => {
      console.error("111 catching this\n\n\n", err);
    });
  },
  down: async (queryInterface, Sequelize) => {

    // https://github.com/sequelize/sequelize/issues/2554#issuecomment-365383347
    await queryInterface.removeColumn('Accommodation', 'rentRange').catch(err => {console.error('caught down 1', err);});
    await queryInterface.sequelize.query('DROP TYPE "enum_Accommodation_rentRange";').catch(err => {console.error('caught down 1', err);});
    await queryInterface.dropTable('Accommodation');
    /**
     * To prevent error: (node:10501) UnhandledPromiseRejectionWarning: SequelizeDatabaseError: type "enum_Accommodation_rentRange" already exists
     * 1. https://stackoverflow.com/questions/60898055/unhandled-rejection-sequelizedatabaseerror-type-enum-already-exists
     * 2. https://stackoverflow.com/questions/45437924/drop-and-create-enum-with-sequelize-correctly
     */
    // await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Accommodation_rentRange";');

    // https://github.com/sequelize/sequelize/issues/2554
    // await queryInterface.dropAllEnums();

  }
};