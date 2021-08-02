const testService = require('./testService');
const saleService = require('./saleService');
const corpMemberService = require('./corpMemberService');
const accommodationService = require('./accommodationService');
const chatService = require('./chatService');
const alertService = require('./alertService');

/**
 * later, Automatically export by file name like sequelize's models folder is exported
 */
module.exports = {
    testService,
    saleService,
    corpMemberService,
    accommodationService,
    chatService,
    alertService
}