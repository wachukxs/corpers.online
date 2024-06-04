let express = require('express');
let router = express.Router();
const auth = require('../helpers/auth')
const testService = require('../services/testService')
const db = require("../models");

router.get('/test', async function (req, res) {
    // add when user logged out to database
    try {
        // update first name.
        const sql = db.CorpMember.queryGenerator.updateQuery(
            db.CorpMember.getTableName(),
            { first_name: "Onlyer", updated_at: db.sequelize.fn('NOW') },
            { id: 3 }, // where
        )
        console.log('will run', sql)

        const s = await db.sequelize.query(sql.query.replace(/\$\d/g, '?'), {
            replacements: sql.bind,
            type: db.Sequelize.QueryTypes.UPDATE,
            // mapToModel: true, 
        })

        console.log('s', s);

        res.status(200).send({
            message: 'Will run:',
        })
    } catch (error) {
        console.error('/test ERR', error)
        res.status(400).send({
            error,
        })
    }
});

router.get('/test/all', auth.verifyJWT, testService.all);

// https://stackoverflow.com/a/24330353/9259701
router.post('/test/sth', auth.verifyJWT, express.urlencoded({extended: false}), testService.create);

router.get('/test/sth/:id', testService.getTest);

router.post('/test/form', express.urlencoded({extended: true}), testService.formTwo);

module.exports = router;