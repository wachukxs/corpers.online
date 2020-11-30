const jwt = require('jsonwebtoken')
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
    console.log('Cookies: ', req.cookies)
    
    // Cookies that have been signed
    console.log('Signed Cookies: ', req.signedCookies)
    if (req.cookies._online) {
        // we could also use req.cookies, but req.signedCookies is just an extra layer of security
        jwt.verify(req.cookies._online, process.env.SESSION_SECRET, function(err, decodedToken) {
            if (err) {
                console.error(err);
                res.redirect('/login')
            } else {
                // console.info('trusted request', decodedToken)
                /**
                 * TODO:
                 * populate res.locals with all the data needed from  the db here. everything.
                 * probably do that based on the path the user wants to navigate to.
                 * 
                 * and we might not need req.statecode = decodedToken.statecode
                 */
                console.log(req);
                req.statecode = decodedToken.statecode // very crucial, so they don't navigate to others dashboard
                next(); // very important we call this
            }
        })
    } else {
        res.redirect('/login')
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