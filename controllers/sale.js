let express = require('express');
let router = express.Router();
const auth = require('../helpers/auth')

const saleService = require('../services/saleService')
const alertService = require('../services/alertService')

router.post('/deletesale', auth.verifyJWT, express.json(), saleService.deleteSale); // should def add alert logic here too

router.post('/posts', auth.verifyJWT, /* upload.array('see', 12), */ saleService.create, alertService.checkSale);

router.post('/updatesale', auth.verifyJWT, saleService.update) // should add alert logic here too

module.exports = router;