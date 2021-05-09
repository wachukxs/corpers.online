let express = require('express');
let router = express.Router();

const corpMemberService = require('../services').corpMemberService

router.post('/signup', express.urlencoded({extended: true}), corpMemberService.create);

module.exports = router;