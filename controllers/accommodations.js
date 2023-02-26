let express = require('express');
let router = express.Router();
const auth = require('../helpers/auth')

const accommodationService = require('../services/accommodationService')
const alertService = require('../services/alertService')

// should rename to delete/accommodation ...other can be add/accommodation, /sale etc. then of course group them
router.post('/deleteaccommodation', auth.verifyJWT, express.json(), accommodationService.delete);

router.post('/accommodations', auth.verifyJWT, /* upload.array('see', 12), express.urlencoded({ extended: true }), */ accommodationService.create, alertService.checkAccommodation);

router.post('/updateaccommodation', auth.verifyJWT, accommodationService.update) // do alerts here too

module.exports = router;