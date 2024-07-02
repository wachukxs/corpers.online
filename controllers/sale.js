let express = require('express');
let router = express.Router();
const auth = require('../helpers/auth')

const saleService = require('../services/saleService')
const alertService = require('../services/alertService')

router.delete('/sale', auth.verifyJWT, express.json(), saleService.deleteSale); // TODO: should def add alert logic here too

router.post('/sale', auth.verifyJWT, /* upload.array('see', 12), */ saleService.create, alertService.checkSale);

router.patch('/sale', auth.verifyJWT, saleService.update) // TODO: should add alert logic here too

router.put('/sale/bookmark/:id', auth.verifyJWT, saleService.bookmarkSale)
router.delete('/sale/bookmark/:id', auth.verifyJWT, saleService.unBookmarkSale)

router.put('/sale/like/:id', auth.verifyJWT, saleService.likeSale)
router.delete('/sale/like/:id', auth.verifyJWT, saleService.unLikeSale)

module.exports = router;