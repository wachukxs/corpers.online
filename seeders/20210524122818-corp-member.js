'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
     return queryInterface.bulkInsert('CorpMembers', [{
      id: 1,
      last_name: 'Obafemi',
      middle_name: null,
      first_name: 'Nwachukwu',
      email: 'nwachukwuossai@gmail',
      password: '-Fk6-g3qEVg.6Hs',
      state_code: 'BA/22A/1234',
      created_at: new Date(),
      updated_at: new Date()
    }, {
      id: 2,
      last_name: 'King',
      middle_name: null,
      first_name: 'George',
      email: 'name@site.com',
      password: 'password',
      state_code: 'AB/22A/1234',
      created_at: new Date(),
      updated_at: new Date()
    }]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    await queryInterface.bulkDelete('CorpMembers', {
      id: {
        [Op.or]: [1, 2]
      }
    }, {});
  }
};