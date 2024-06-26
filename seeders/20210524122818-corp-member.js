"use strict";
const { Op } = require("sequelize");
const { sequelize } = require("../models");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.bulkInsert("CorpMembers", [
        {
          id: sequelize.literal("DEFAULT"), // idea from: https://stackoverflow.com/a/66086144/9259701
          last_name: "Obafemi",
          middle_name: null,
          first_name: "Musa",
          email: "chuks@email.com",
          password: "-Fk6-g3qEVg.6Hs",
          state_code: "BA/22A/1234",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: sequelize.literal("DEFAULT"),
          last_name: "King",
          middle_name: null,
          first_name: "George",
          email: "name@site.com",
          password: "password",
          state_code: "AB/22A/1234",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: sequelize.literal("DEFAULT"),
          last_name: "Agnes",
          middle_name: "Victor",
          first_name: "Bush",
          email: "user@email.com",
          password: "password",
          state_code: "AB/23C/1007",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Did not seed(up)", __filename, error);
      throw error;
    }
  },

  // TODO: Use transactions https://sequelize.org/docs/v6/other-topics/migrations/
  down: async (queryInterface, Sequelize) => {
    try {
      const corp_members_table_exists = await queryInterface.tableExists('CorpMembers')
      if (corp_members_table_exists) {
        await queryInterface.bulkDelete(
          "CorpMembers",
          {
            // delete by email (not id) cause there's no absolute guarantee id will always be 1 & 2
            email: {
              [Op.in]: ["name@site.com", "chuks@email.com", 'user@email.com']
            }
          },
          {}
        );
      }
    } catch (error) {
      console.error("Did not seed(down)", __filename, error);
      throw error; // ??
    }
  },
};
