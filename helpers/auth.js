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