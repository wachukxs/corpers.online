const jwt = require('jsonwebtoken')
const query = require('../models/queries');
const helpers = require('../constants/helpers')
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
    // Cookies that have not been signed
    // console.log('Cookies: ', req.cookies)
    // Cookies that have been signed
    // console.log('Signed Cookies: ', req.signedCookies)
    if (req.cookies._online) { // trying to access dashboard directly
        // we could also use req.cookies, but req.signedCookies is just an extra layer of security
        jwt.verify(req.cookies._online, process.env.SESSION_SECRET, function(err, decodedToken) {
            if (err) {
                console.error(err);
                res.redirect('/login')
            } else if (helpers.statecodeFormat.test(req.path.substring(1)) && req.path !== '/' + decodedToken.statecode ) { // should we display a message asking them if they meant decodedToken.statecode ? or security flaw if we do that ?
                console.log('catching this err because:');
                res.status(502).redirect('/login?n=y') // [n]ot = [y]ou
            } else {
                /**
                 * TODO: res.locals or req.session ?
                 */
                query.AutoLogin(decodedToken.statecode).then(result => {
                    req.session.corper = result.response[0];
                    req.session.corper.location = result.response[0].servicestate + (result.response[0].city_town ? ', ' + result.response[0].city_town : ''); // + (results1[0].region_street ? ', ' + results1[0].region_street : '' )
                  
                  }, reject => {
              
                    console.log('catching this err because:', reject);
                    res.status(502).redirect('/login?t=a')
              
                  }).catch(reason => {
                    console.log('catching this err because:', reason);
                    res.status(502).redirect('/login?t=a')
                  }).finally(() => {
                      next() // very crucial
                  })
            }
        })
    } else if (req.headers.referer.includes('/login') && req.headers['sec-fetch-site'] === 'same-origin') {
        next()
    } else {
        res.redirect('/login')
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
 * a middleware to check jwt cookies in req object, to provide better servies to users(corpers). in pages like /search, helping to pre-populate some data
 */
module.exports.checkJWT = (req, res, next) => {
    // Cookies that have not been signed
    console.log('Cookies: ', req.cookies)
    
    // Cookies that have been signed
    console.log('Signed Cookies: ', req.signedCookies)
    if (req.session.corper) {
        next()
    } else if (req.cookies._online) {
        // we could also use req.cookies, but req.signedCookies is just an extra layer of security
        jwt.verify(req.cookies._online, process.env.SESSION_SECRET, function(err, decodedToken) {
            if (err) {
                next()
            } else {
                /**
                 * TODO: res.locals or req.session ?
                 */
                query.AutoLogin(decodedToken.statecode).then(result => {
                    req.session.corper = result.response[0];
                    req.session.corper.location = result.response[0].servicestate + (result.response[0].city_town ? ', ' + result.response[0].city_town : ''); // + (results1[0].region_street ? ', ' + results1[0].region_street : '' )
                  }, reject => {
                    next()
                  }).catch(reason => {
                    next()
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
    return jwt.sign({ statecode }, process.env.SESSION_SECRET, {
        expiresIn: this.maxAge
    })
}