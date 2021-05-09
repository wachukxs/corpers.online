let express = require('express');
let router = express.Router();

const saleService = require('../services').saleService

router.post('/deletesale', auth.verifyJWT, express.json(), saleService.deleteSale);

module.exports = router;