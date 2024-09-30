'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    try {
          // Accommodation
          await queryInterface.addConstraint('AccommodationLikes', {
            type: 'FOREIGN KEY',
            name: 'acc_likes_ref_sales_wer',
            fields: ['accommodation_id'],
            references: {
              table: 'Accommodations',
              field: 'id'
            },
          })

          await queryInterface.addConstraint('AccommodationLikes', {
            type: 'FOREIGN KEY',
            name: 'acc_lks_ref_corp_memn_nnt',
            fields: ['corp_member_id'],
            references: {
              table: 'CorpMembers',
              field: 'id'
            },
          })

          await queryInterface.addConstraint('AccommodationBookmarks', {
            type: 'FOREIGN KEY',
            name: 'acc_bkmks_ref_accs_sdr',
            fields: ['accommodation_id'],
            references: {
              table: 'Sales',
              field: 'id'
            },
          })

          await queryInterface.addConstraint('AccommodationBookmarks', {
            type: 'FOREIGN KEY',
            name: 'corp_mem_ref_corp_opl',
            fields: ['corp_member_id'],
            references: {
              table: 'CorpMembers',
              field: 'id'
            },
          })
    } catch (error) {
        console.log("Migration ERR in:", __filename, error)
    }

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    // Accommodation
    await queryInterface.removeConstraint('AccommodationLikes', 'acc_likes_ref_sales_wer');
    await queryInterface.removeConstraint('AccommodationLikes', 'acc_lks_ref_corp_memn_nnt');
    await queryInterface.removeConstraint('AccommodationBookmarks', 'acc_bkmks_ref_accs_sdr');
    await queryInterface.removeConstraint('AccommodationBookmarks', 'corp_mem_ref_corp_opl');
  }
};
