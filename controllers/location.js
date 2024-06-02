let express = require('express');
let router = express.Router();
const auth = require('../helpers/auth')

const accommodationService = require('../services/accommodationService')
const ppaService = require('../services/ppaService')
const alertService = require('../services/alertService')

// accommodations
// should rename to delete/accommodation ...other can be add/accommodation, /sale etc. then of course group them
router.post('/deleteaccommodation', auth.verifyJWT, express.json(), accommodationService.delete);

router.post('/accommodations', auth.verifyJWT, /* upload.array('see', 12), express.urlencoded({ extended: true }), */ accommodationService.create/* , alertService.checkAccommodation */);

router.post('/updateaccommodation', auth.verifyJWT, accommodationService.update) // do alerts here too

router.post('/ppa', auth.verifyJWT, ppaService.addPPA)
router.post('/ppa/review', auth.verifyJWT, express.json(), ppaService.addReviewToPPA)

/**
 * You don't need to be logged in to view PPAs
 * Or list states & LGAs
 * 
 * GROUP UNAUTHENTICATED ROUTES TOGETHER!
 * For easy identification
 */
router.post('/ppas/search', express.json(), ppaService.searchPPAs)
router.get('/ppas', ppaService.getAllPPAs)
router.get('/ng-states', ppaService.getNigerianStates)
router.get('/ng-state-and-lgas', ppaService.getNigerianStatesAndLGAs)
router.get('/ng-states/:stateId/lgas', ppaService.getNigerianStateLGAs)


module.exports = router;