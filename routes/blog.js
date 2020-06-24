const express = require('express');
let router = express.Router();

router.get('/hello', function (req, res) {
    res.set('Content-Type', 'text/html');
    res.render('pages/blog/hello');
});

module.exports = router;