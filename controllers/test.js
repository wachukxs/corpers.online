let express = require('express');
let router = express.Router();
const auth = require('../helpers/auth')
const testService = require('../services/testService')

router.get('/test', function (req, res) {
    // add when user logged out to database
    console.log('came here /to test');
    res.status(200).send({
        message: 'Welcome to the Test API!',
    })
});

router.get('/test/all', testService.all);

// https://stackoverflow.com/a/24330353/9259701
router.post('/test/sth', auth.verifyJWT, express.urlencoded({extended: false}), testService.create);

router.get('/test/sth/:id', testService.getTest);

module.exports = router;