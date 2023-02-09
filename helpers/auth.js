const jwt = require('jsonwebtoken')
const query = require('../utilities/queries');
const db = require('../models')
const helpers = require('../utilities/helpers')
const path = require('path');
const _FILENAME = path.basename(__filename);

// FORMAT OF TOKEN
// Authorization: Bearer <access_token>
module.exports.verifyToken = (req, res, next) => {
    // Get auth header value
    bearerHeader = req.headers['authorization'];
    // check that bearer is not undefined
    if (!bearerHeader) { // if no authorization header is present.
        res.sendStatus(403); // we should change this later to a message or sth
    } else {
        bearer = bearerHeader.split(' ');
        bearerToken = bearer[1];
        // Set the token
        req.token = bearerToken;
        // continue
        next();
    }
}

/**
 * 
 * @param {object} req 
 * http req object
 * @param {object} res 
 * http res object
 * @param {function} next 
 * next() to continue execution
 * 
 * @description
 * a middleware to verify jwt cookies in req object, to further authenticate users(corpers). use to protect routes
 */
module.exports.verifyJWT = (req, res, next) => {
    const _FUNCTIONNAME = 'updateProfilePhoto'
    console.log('hitting', _FILENAME, _FUNCTIONNAME);
    
    // Cookies that have not been signed
    // console.log('Cookies: ', req.cookies)
    // Cookies that have been signed
    // console.log('Signed Cookies: ', req.signedCookies)
    if (process.env.DEV && process.env.DEV != 'true' && req.cookies._online) { // trying to access dashboard directly
        console.log('coming from', req.path);
        // console.log('\n\n req.session.corper is', req.session);
        // we could also use req.cookies, but req.signedCookies is just an extra layer of security
        jwt.verify(req.cookies._online, process.env.SESSION_SECRET, function(err, decodedToken) {
            if (err) {
                console.error(err);
                res.sendStatus(502)
            } else if (helpers.statecodeFormat.test(req.path.substring(1)) && req.path !== '/' + decodedToken.statecode ) { // should we display a message asking them if they meant decodedToken.statecode ? or security flaw if we do that ?
                console.log('catching this err because:');
                res.sendStatus(502)
            } else /* if (!req.session.corper) */ {

                /**
                 * HOW COME PASSWORDS AREN"T hashed
                 */
                // console.log(Object.keys(db.PPA.rawAttributes)); // here lies a problem
                db.CorpMember.findOne({
                    where: { statecode: decodedToken.statecode.toUpperCase() },
                    // include: [{ all: true }],
                    include: [ // why is it looking for ppaId in PPA model ?? cause of bug in sequelize
                        db.Media,
                        {
                            model:db.PPA,
                            attributes: db.PPA.getAllActualAttributes() // hot fix (problem highlighted in ./models/ppa.js) -- > should create a PR to fix it ... related to https://github.com/sequelize/sequelize/issues/13309
                        },
                    ],
                    attributes: db.CorpMember.getSafeAttributes()
                })
                // query.AutoLogin(decodedToken.statecode)
                .then(result => {
                    // console.log('corper result object', result);
                    if (result) { // sometimes, it's null ...but why though ? // on sign up it's null ...
                        req.session.corper = result.dataValues;
                        next()
                    } else { // else what ?
                        throw new Error('Could not find corper')
                    }

                  }, reject => {
              
                    console.log('auth autologin catching this err because:', reject);
                    res.sendStatus(502)
              
                  }).catch(reason => {
                    console.log('auth auto login catching this err because:', reason);
                    res.sendStatus(502)
                  })
                //   .finally(() => {
                //       console.log('\nfinlly next?');
                //       // next() // very crucial
                //   })
            }
        })
    } else {
        next()
    }
}

/**
 * 
 * @param {object} req 
 * http req object
 * @param {object} res 
 * http res object
 * @param {function} next 
 * next() to continue execution
 * 
 * @description
 * middleware to check jwt cookies in req object, to provide better servies to corpers.
 * In pages like /search, helping to pre-populate corper object
 */
module.exports.checkJWT = (req, res, next) => {
    const _FUNCTIONNAME = 'updateProfilePhoto'
    console.log('hitting', _FILENAME, _FUNCTIONNAME);

    // Cookies that have not been signed
    // console.log('Cookies: ', req.cookies)
    
    // Cookies that have been signed
    // console.log('Signed Cookies: ', req.signedCookies)
    if (req.session.corper) {
        next()
    } else if (req.cookies._online) {
        // we could also use req.cookies, but req.signedCookies is just an extra layer of security
        jwt.verify(req.cookies._online, process.env.SESSION_SECRET, function(err, decodedToken) {
            console.info('\n\nveriffyiinnng')
            if (err) {
                res.sendStatus(502)
            } else {
                /**
                 * TODO: remove query . auto loagin
                 */
                query.AutoLogin(decodedToken.statecode).then(result => {
                    console.info('\n\n\n\ninnnnn')
                    req.session.corper = result.response[0];
                  }, reject => {
                    // next() // no need
                  }).catch(reason => {
                    // next() // no need
                  }).finally(() => {
                      next()
                  })
            }
        })
    } else {
        next()
    }
}

/**a constant signifying 365 days in miliseconds, used to determine how long our JWT would last */
module.exports.maxAge = 365 * (1000 * 60 * 60 * 24) // days * (1 sec * 60 secs * 60 minutes * 24 hours) // valid for 365 days

/**
 * 
 * @param {string} statecode 
 * a pubic unique identifier(statecode) for our users(corpers)
 * 
 * @description
 * create(sign) a JWT to issue
 * 
 * @deprecated
 * because we want to keep our codebase async, calling this method this way isn't async
 */
module.exports.createJWT = (statecode) => {
    const _FUNCTIONNAME = 'updateProfilePhoto'
    console.log('hitting', _FILENAME, _FUNCTIONNAME);
    
    return jwt.sign({ statecode }, process.env.SESSION_SECRET, {
        expiresIn: this.maxAge
    })
}