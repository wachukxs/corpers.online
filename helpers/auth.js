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
    bearerHeader = req.headers['authorization']; // TODO: shouldn't this be with an uppercase A?
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
    const _FUNCTIONNAME = 'verifyJWT'
    console.log('hitting', _FILENAME, _FUNCTIONNAME);

    // Cookies that have not been signed
    // console.log('Cookies: ', req.cookies)
    // Cookies that have been signed
    // console.log('Signed Cookies: ', req.signedCookies)
    console.log('for corper', req.session?.corper?.state_code);

    console.log('coming from', req.path);

    // TODO: check the format of state_code
    if (req.session?.corper && req.session?.corper?.state_code) {
        next()
    } else if (req.cookies?._online) {
        
        // console.log('\n\n req.session.corper is', req.session);
        // we could also use req.cookies, but req.signedCookies is just an extra layer of security
        jwt.verify(req.cookies._online, process.env.SESSION_SECRET, function (err, decodedToken) {
            console.log('verifying token')
            if (err) {
                console.error('err verifying cookie', err);
                res.sendStatus(502)
            } else {

                console.log('decoded token data', decodedToken);
                db.CorpMember.findOne({
                    where: { state_code: decodedToken.state_code.toUpperCase() },
                    // include: [{ all: true }],
                    include: [ // why is it looking for ppa_id in PPA model ?? cause of bug in sequelize
                        {
                            /**
                             * Sequelize bug
                             * If you only include Media; it'll pluralize it for you
                             * even if you froze table name., and you can't change it here
                             */
                            model: db.sequelize.models.Media,
                            as: 'Media'
                        },
                        {
                            model: db.PPA, // using db.PPA makes it look for table 'ppas' which causes an error.
                            attributes: db.PPA.getAllActualAttributes() // hot fix (problem highlighted in ./models/ppa.js) --> should create a PR to fix it ... related to https://github.com/sequelize/sequelize/issues/13309
                        },
                    ],
                    attributes: db.CorpMember.getSafeAttributes()
                })
                    // query.AutoLogin(decodedToken.state_code)
                    .then(result => {
                        // console.log('corper result object', result);
                        if (result) { // sometimes, it's null ...but why though ? // on sign up it's null ...
                            req.session.corper = result.dataValues;
                            next()
                        } else {
                            res.sendStatus(502)
                            console.error('Could not find corper')
                        }

                    }, reject => {

                        console.log('auth auto login reject, this err because:', reject);
                        res.sendStatus(502)

                    }).catch(reason => {
                        console.log('auth auto login catching this err because:', reason);
                        res.sendStatus(502)
                    })
            }
        })
    } else if (req.headers['Authorization']) { // TODO: this needs work.
        const authHeader = req.headers['Authorization']
        const token = authHeader && authHeader.split(' ')[1]

        if (token == null) return res.sendStatus(401)
    }
    else {
        res.sendStatus(401)
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
        jwt.verify(req.cookies._online, process.env.SESSION_SECRET, function (err, decodedToken) {
            console.info('\n\nveriffyiinnng')
            if (err) {
                res.sendStatus(502)
            } else {
                /**
                 * TODO: remove query . auto loagin
                 */
                query.AutoLogin(decodedToken.state_code).then(result => {
                    console.info('\n\n\n\ninnnnn')
                    req.session.corper = result.response[0];

                    next()
                }, reject => {
                    res.sendStatus(502)
                }).catch(reason => {
                    res.sendStatus(502)
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
 * @param {string} state_code 
 * a pubic unique identifier(state_code) for our users(corpers)
 * 
 * @description
 * create(sign) a JWT to issue
 * 
 * @deprecated
 * because we want to keep our codebase async, calling this method this way isn't async
 */
module.exports.createJWT = (state_code) => {
    const _FUNCTIONNAME = 'updateProfilePhoto'
    console.log('hitting', _FILENAME, _FUNCTIONNAME);

    return jwt.sign({ state_code }, process.env.SESSION_SECRET, {
        expiresIn: this.maxAge
    })
}