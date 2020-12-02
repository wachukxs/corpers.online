const express = require('express');
let router = express.Router();
const jwt = require('jsonwebtoken')
const query = require('../models/queries');
const auth = require('../helpers/auth')
const ngstates = require('../constants/ngstates')

/**options for setting JWT cookies */
let cookieOptions = {
  httpOnly: true, // frontend js can't access
  maxAge: auth.maxAge,
  sameSite: 'strict',
  // path: '' // until we figure out how to add multiple path
}

if (process.env.NODE_ENV === 'production') {
  cookieOptions.secure = true // localhost, too, won't work if true
}

router.get(['/', '/home', '/index'], function (req, res) {
  res.type('.html');
  res.render('pages/coming-soon', { current_year: new Date().getFullYear() });
});

router.get(['/homepage'], function (req, res) {
  // res.type('.html');
  res.set('Content-Type', 'text/html');
  res.render('pages/index', { current_year: new Date().getFullYear() });
});

// about.eje became index.ejs
router.get(['/about', '/about-us'], function (req, res) {
  // res.type('html');
  res.set('Content-Type', 'text/html');
  res.render('pages/about', { current_year: new Date().getFullYear() });
});

router.get(ngstates.states_short_paths_regex, function (req, res) {
    res.set('Content-Type', 'text/html');
    res.render('pages/state', {
      // houses: results1,
      // pictures: results2
    });
});

router.get(ngstates.states_short_paths_batch_regex_stringed, function (req, res) { // work with the batch
    console.log(req.path, '23');
    res.set('Content-Type', 'text/html');
    res.render('pages/state', {
      // houses: results1,
      // pictures: results2
    });
});


/**great resource for express route regex https://www.kevinleary.net/regex-route-express/ & https://forbeslindesay.github.io/express-route-tester/ */
let years = parseInt(new Date(Date.now()).getFullYear().toFixed().slice(2, 4));
let yearrange = '(' + (years - 1).toString() + '|' + years.toString() + ')';
router.get('/:state((AB|AD|AK|AN|BA|BY|BN|BO|CR|DT|EB|ED|EK|EN|FC|GM|IM|JG|KD|KN|KT|KB|KG|KW|LA|NS|NG|OG|OD|OS|OY|PL|RV|SO|TR|YB|ZM|ab|ad|ak|an|ba|by|bn|bo|cr|dt|eb|ed|ek|en|fc|gm|im|jg|kd|kn|kt|kb|kg|kw|la|ns|ng|og|od|os|oy|pl|rv|so|tr|yb|zm))/:batch_stream((' + yearrange /*(18|19)*/ + '([abcACB])))/:lastfour(([0-9]{4}))', 
auth.verifyJWT, function (req, res) {
  // console.log('req.params/session', req.session, req.params) // req.path is shorthand for url.parse(req.url).pathname

    res.set('Content-Type', 'text/html');

    /** this query runs so we can get the number of unread messages the user has */
    query.UnreadMessages([req.session.corper.statecode.toUpperCase(), false]).then(result => {
      res.render('pages/account', {
        statecode: req.session.corper.statecode.toUpperCase(),
        batch: req.params['3'],
        total_num_unread_msg: result,
        ...req.session.corper
      });
    }, reject => {
      console.log('why TF?!', reject);

      res.render('pages/account', {
        statecode: req.session.corper.statecode.toUpperCase(),
        servicestate: req.session.corper.servicestate,
        batch: req.params['3'],
        name_of_ppa: req.session.corper.name_of_ppa,
        total_num_unread_msg: 0, // really ??? Zero?
        picture_id: req.session.corper.picture_id, // if there's picture_id // hmmm
        firstname: req.session.corper.firstname
      });
    }).catch((err) => { // we should have this .catch on every query
      console.error('our system should\'ve crashed:', err)
      res.redirect('/?e') // go back home, we should tell you an error occured
    })

});

router.get('/chat', auth.verifyJWT, function (req, res) {
  res.set('Content-Type', 'text/html');
  // req.query.posts.who and req.query.posts.when

  // to get old chats

  /**
   * WARNING !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!11
   * TIME IS AN IMPORTANT ISSUE HERE. AND TIME CONVERSION TOO...
   * utc + 1 is our time zone [when converting], or use moment .js
   */

  console.log('logged in?', req.session.loggedin, 'req.query =>', req.query, '\n??')

  query.GetChatData(req).then(result => {
    res.set('Content-Type', 'text/html');
    res.render('pages/chat', result);
  }, reject => {
    res.set('Content-Type', 'text/html');
    res.redirect('/login');
  }).catch(reason => {
    // we hope we never get here
    console.log('what happened at /chat???', reason);
    res.redirect('/login');
  })

});

router.get(['/map', '/maps'], function (req, res) { // try to infer their location from their IP Address then send to the front end
  res.set('Content-Type', 'text/html');
  query.GetMapData().then(result => {
    res.render('pages/map', {
      ...(req.session.corper) && {statecode: req.session.corper.statecode}, // we aren't using in the front end yet
      ...(req.session.corper) && {servicestate: req.session.corper.servicestate}, // we aren't using in the front end yet
      mapdata: result.mapdata,
      types: result.types
    });
  }, error => {
    console.log('there was an error getting /map', error); // but render regardless
    res.render('pages/map', {
      ...(req.session.corper) && {statecode: req.session.corper.statecode}, // we aren't using in the front end yet
      ...(req.session.corper) && {servicestate: req.session.corper.servicestate}, // we aren't using in the front end yet
      mapdata: {},
      types: []
    });
  }).catch(reason => {
    console.log('do we have a problem?', reason);
    res.render('pages/map')
  })





});

// edited
router.post('/subscribe', /* upload.none(), */ function (req, res) {
  console.log('the sublist', req.body);
  query.SubscribeToEmailUpdates(req.body).then(result => {
    res.status(200).send('OK');
  }, reject_error => {
    console.log('the reject error code:', reject_error.code)
    switch (reject_error.code) { // do more here, but ... this is the only error we're expecting
      case 'ER_DUP_ENTRY': // ER_DUP_ENTRY if an email exists already
        res.status(406).send('Not Acceptable');
        break;
      default:
        res.status(500).send('Internal Server Error');
        break;
    }
  }).catch((err) => { // we should have this .catch on every query
    console.error('our system should\'ve crashed:', err)
    res.redirect('/?e') // go back home, we should tell you an error occured
  })
});

router.get('/signup', function (req, res) {
  res.set('Content-Type', 'text/html');
  res.render('pages/signup');
});

// edited
router.post('/signup', /* bodyParser.urlencoded({
  extended: true
}), */ function (req, res) {
    // handle post request, add data to database.
    // implement the hashing of password before saving to the db
    // also when some one signs up, it counts as login time too, so we should include it in usage details table

    // we can find the service state with req.body.statecode.slice(0, 2) which gives the first two letters

    query.CorpersSignUp(req.body).then(result => {
      console.log('re:', result);
      req.session.corper = {}
      req.session.corper.statecode = req.body.statecode.toUpperCase();
      // req.session.loggedin = true;
      req.session.corper.servicestate = result.theservicestate;
      req.session.corper.batch = req.body.statecode.toUpperCase().slice(3, 6);
      req.session.corper.location = req.session.corper.servicestate; // really fix this, we should add some other data if we can

      jwt.sign({statecode: req.body.statecode.toUpperCase()}, process.env.SESSION_SECRET, (err, token) => {
        if (err) throw err
        else {
          console.log('token generated', token);
          // res.setHeader('Set-Cookie', 'name=value')
          res.cookie('_online', token, cookieOptions)
          res.status(200).redirect(req.body.statecode.toUpperCase());
        }
      })

    }, error => {
      console.log('well some error happened', error);
      // res.send(error.message) // try this & not redirect
      switch (error.message) {

        case 'duplicate statecode':
          res.redirect('/signup?m=ds'); // [m]essage = [d]uplicate [s]tatecode
          break;

        case 'duplicate email':
          res.redirect('/signup?m=de'); // [m]essage = [d]uplicate [e]mail
          break;

        case 'invalid statecode':
          res.redirect('/signup?m=is') // [m]essage = [i]nvalid [s]tatecode
          break;

        default:
          res.redirect('/signup?m=ue'); // [m]essage = [u]naccounted [e]rror
          break;
      }
    }).catch(reason => {
      console.log('catching this err because:', reason);
      res.redirect('/signup?m=ue')
    });


});

// if someone tries loggin in with a state code that is correct but isn't yet registerd (i.e. hasn't been signed up with in corpers.online), what do we do ?
// block it? esp if they try more than once... ??
router.post('/login', /* bodyParser.urlencoded({ // edited
    extended: true
  }), */ function (req, res /*, handleRedirect*/) {
    // handle post request, validate data with database.
    // how to handle wrong password with right email or more rearly, right password and wrong password.

    query.CorpersLogin(req.body).then(result => {

      req.session.corper = result.response[0];
      req.session.corper.location = result.response[0].servicestate + (result.response[0].city_town ? ', ' + result.response[0].city_town : ''); // + (results1[0].region_street ? ', ' + results1[0].region_street : '' )
      // req.session.loggedin = true;

      jwt.sign({statecode: req.body.statecode.toUpperCase()}, process.env.SESSION_SECRET, (err, token) => {
        if (err) throw err
        else {
          console.log('token generated', token);
          // res.setHeader('Set-Cookie', 'name=value')
          res.cookie('_online', token, cookieOptions)
          res.status(200).redirect(req.body.statecode.toUpperCase());
        }
      })

      query.LoginSession([req.body.statecode.toUpperCase(), req.session.id, req.headers["user-agent"]]).then(resolve => {
        console.log('saved login session info', resolve);
      }, reject => {
        console.log('reject save login session', reject);
      }).catch(reason => {
        console.log('fail save login session', reason);
      })
      
    }, reject => {

      switch (reject.message) {
        case 'backend error':
          res.status(502).redirect('/login?l=n'); // [b]ackend = [e]rror
          break;

        case 'sign up':
          res.status(502).redirect('/login?m=s'); // [m]essage = [s]ignup // tell corper at the front end
          break;
        
        case 'wrong password':
          res.status(502).redirect('/login?p=w'); // [p]assword = [w]rong
          break;
        default:
          res.status(502).redirect('/login?t=a'); // just [t]ry = [a]gain
          break;
      }

    }).catch(reason => {
      console.log('catching this err because:', reason);
      res.status(502).redirect('/login?t=a')
    })
});

router.get('/login', function (req, res) {
  res.set('Content-Type', 'text/html');
  res.render('pages/login', { current_year: new Date().getFullYear() });
});

router.get('/contact', function (req, res) {
  res.set('Content-Type', 'text/html');
  res.render('pages/contact', { current_year: new Date().getFullYear() });
});

router.get('/count', function (req, res) {
  res.set('Content-Type', 'text/html');
  res.render('pages/count'); // show number of people online, then per state. something nice and interactive and definately real time too
});

module.exports = router;
