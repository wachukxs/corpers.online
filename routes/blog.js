const express = require('express');
let router = express.Router();
/**
 * Lists of possible tags:
 * Education
 * Travel eg. awesome places to visit, relaxation, etc.
 * E-commerc
 * Places?
 * Career ie. jobs and opportunities
 * 
 */
router.get(['/blog', '/blogs', '/blogging'], function (req, res) {
    res.redirect('https://blog.corpers.online')
});

module.exports = router;