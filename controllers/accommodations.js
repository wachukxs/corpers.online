let express = require('express');
let router = express.Router();
const auth = require('../helpers/auth')

const accommodationService = require('../services').accommodationService

// should rename to delete/accommodation ...other can be add/accommodation, /sale etc. then of course group them
router.post('/deleteaccommodation', auth.verifyJWT, express.json(), accommodationService.delete);

router.post('/accommodations', auth.verifyJWT, /* upload.array('see', 12), */ accommodationService.create);

module.exports = router;