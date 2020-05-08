var express = require('express');
var router = express.Router();

router.get('/logout', function (req, res) {
    // add when user logged out to database
    console.log('came here /logout for ', req.session.id);
    req.session.loggedin = false;
    req.session.destroy(function (err) {
      // cannot access session here
      console.log('session destroyed');
    });
    res.redirect('/');
  
});

module.exports = router;