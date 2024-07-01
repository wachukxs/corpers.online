'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addConstraint('SaleLikes', {
      type: 'FOREIGN KEY',
      name: 'sales_likes_ref_sales_bvp',
      fields: ['sale_id'],
      references: {
        table: 'Sales',
        field: 'id'
      },
    })

    await queryInterface.addConstraint('SaleLikes', {
      type: 'FOREIGN KEY',
      name: 'corp_mem_ref_corp_nnt',
      fields: ['corp_member_id'],
      references: {
        table: 'CorpMembers',
        field: 'id'
      },
    })

    await queryInterface.addConstraint('SaleBookmarks', {
      type: 'FOREIGN KEY',
      name: 'sales_bkmks_ref_sales_dkw',
      fields: ['sale_id'],
      references: {
        table: 'Sales',
        field: 'id'
      },
    })

    await queryInterface.addConstraint('SaleBookmarks', {
      type: 'FOREIGN KEY',
      name: 'sale_bkmks_ref_corp_klm',
      fields: ['corp_member_id'],
      references: {
        table: 'CorpMembers',
        field: 'id'
      },
    })

  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeConstraint('SaleLikes', 'sales_likes_ref_sales_bvp');
    await queryInterface.removeConstraint('SaleLikes', 'corp_mem_ref_corp_nnt');
    await queryInterface.removeConstraint('SaleBookmarks', 'sales_bkmks_ref_sales_dkw');
    await queryInterface.removeConstraint('SaleBookmarks', 'sale_bkmks_ref_corp_klm');

    /**
     * https://dba.stackexchange.com/a/167569/264747
     * Drop foreign key first before deleting the index.
     * 
     * ALTER TABLE `SaleLikes` DROP FOREIGN KEY `sales_likes_ref_sales_bvp`;
     * then drop the foreign key
     */
  }
};
