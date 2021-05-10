let express = require('express');
let router = express.Router();
const auth = require('../helpers/auth')
const corpMemberService = require('../services').corpMemberService

router.post('/signup', express.urlencoded({extended: true}), corpMemberService.create);


// great resource for express route regex https://www.kevinleary.net/regex-route-express/ & https://forbeslindesay.github.io/express-route-tester/
let years = parseInt(new Date(Date.now()).getFullYear().toFixed().slice(2, 4));
let yearrange = '(' + (years - 1).toString() + '|' + years.toString() + ')'; // (18|19)
router.get('/:state((AB|AD|AK|AN|BA|BY|BN|BO|CR|DT|EB|ED|EK|EN|FC|GM|IM|JG|KD|KN|KT|KB|KG|KW|LA|NS|NG|OG|OD|OS|OY|PL|RV|SO|TR|YB|ZM|ab|ad|ak|an|ba|by|bn|bo|cr|dt|eb|ed|ek|en|fc|gm|im|jg|kd|kn|kt|kb|kg|kw|la|ns|ng|og|od|os|oy|pl|rv|so|tr|yb|zm))/:year_batch((' + yearrange + '([abcACB])))/:lastfour(([0-9]{4}))', 
auth.verifyJWT, corpMemberService.unreadMessges);


module.exports = router;