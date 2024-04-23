let express = require('express');
let router = express.Router();

const auth = require('../helpers/auth')

router.get('/logout', function (req, res) {
    // add when user logged out to database
    console.log('came here /logout for ', req.session.id);
    // req.session.loggedin = false; // to do, delete token
    req.session.destroy(function (err) {
      // cannot access session here
      console.log('session destroyed');
      res.cookie('_online', '', { // clear the JWT value
        maxAge: 1 // remove the JWT ASAP
      })
      res.status(200).json(null);
    });
  
});

module.exports = router;