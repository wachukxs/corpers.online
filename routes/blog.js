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
router.get('/blog', function (req, res) {
    res.set('Content-Type', 'text/html');
    res.render('pages/blog/home', { current_year: new Date().getFullYear() });
});

router.get('/hello', function (req, res) {
    res.set('Content-Type', 'text/html');
    res.render('pages/blog/hello', { 
        current_year: new Date().getFullYear(),
        tags: ['Travel', 'E-Commerce']
    });
});

module.exports = router;