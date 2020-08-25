const express = require('express');
let router = express.Router();

const query = require('../models/queries');

router.get(['/', '/home', '/index', '/homepage'], function (req, res) {
  res.type('.html');
  res.render('pages/about');
});

/* router.get(['/about', '/about-us'], function (req, res) {
  res.type('html');
  res.render('pages/about');
}); */

router.get(['/AB', '/AD', '/AK', '/AN', '/BA', '/BY', '/BN', '/BO', '/CR', '/DT', '/EB', '/ED', '/EK', '/EN', '/FC', '/GM', '/IM', '/JG', '/KD', '/KN', '/KT', '/KB', '/KG', '/KW', '/LA', '/NS', '/NG', '/OG', '/OD', '/OS', '/OY', '/PL', '/RV', '/SO', '/TR', '/YB', '/ZM'], function (req, res) {
  // console.log('tryna login ', req.session.id, req.session.loggedin);
  if (req.session.loggedin) {
    res.set('Content-Type', 'text/html');
    // res.sendFile(__dirname + '/state.html');
    res.render('pages/state', {
      // houses: results1,
      // pictures: results2
    });
  } else {
    res.redirect('/login');
  }
});

router.get(['/AB/:batch', '/AD/:batch', '/AK/:batch', '/AN/:batch', '/BA/:batch', '/BY/:batch', '/BN/:batch', '/BO/:batch', '/CR/:batch', '/DT/:batch', '/EB/:batch', '/ED/:batch', '/EK/:batch', '/EN/:batch', '/FC/:batch', '/GM/:batch', '/IM/:batch', '/JG/:batch', '/KD/:batch', '/KN/:batch', '/KT/:batch', '/KB/:batch', '/KG/:batch', '/KW/:batch', '/LA/:batch', '/NS/:batch', '/NG/:batch', '/OG/:batch', '/OD/:batch', '/OS/:batch', '/OY/:batch', '/PL/:batch', '/RV/:batch', '/SO/:batch', '/TR/:batch', '/YB/:batch', '/ZM/:batch'], function (req, res) {
  // console.log('tryna login ', req.session.id, req.session.loggedin);
  if (req.session.loggedin) {
    res.set('Content-Type', 'text/html');
    // res.sendFile(__dirname + '/state.html');
    res.render('pages/state', {
      // houses: results1,
      // pictures: results2
    });
  } else {
    res.redirect('/login');
  }
});


/**great resource for express route regex https://www.kevinleary.net/regex-route-express/ & https://forbeslindesay.github.io/express-route-tester/ */
var years = parseInt(new Date(Date.now()).getFullYear().toFixed().slice(2, 4));
var yearrange = '(' + (years - 1).toString() + '|' + years.toString() + ')';
router.get('/:state((AB|AD|AK|AN|BA|BY|BN|BO|CR|DT|EB|ED|EK|EN|FC|GM|IM|JG|KD|KN|KT|KB|KG|KW|LA|NS|NG|OG|OD|OS|OY|PL|RV|SO|TR|YB|ZM|ab|ad|ak|an|ba|by|bn|bo|cr|dt|eb|ed|ek|en|fc|gm|im|jg|kd|kn|kt|kb|kg|kw|la|ns|ng|og|od|os|oy|pl|rv|so|tr|yb|zm))/:batch_stream((' + yearrange /**(18|19)*/ + '([abcACB])))/:lastfour(([0-9]{4}))', function (req, res) { // ['/AB/:batch/:code', '/AD/:batch/:code', '/AK/:batch/:code', '/AN/:batch/:code', '/BA/:batch/:code', '/BY/:batch/:code', '/BN/:batch/:code', '/BO/:batch/:code', '/CR/:batch/:code', '/DT/:batch/:code', '/EB/:batch/:code', '/ED/:batch/:code', '/EK/:batch/:code', '/EN/:batch/:code', '/FC/:batch/:code', '/GM/:batch/:code', '/IM/:batch/:code', '/JG/:batch/:code', '/KD/:batch/:code', '/KN/:batch/:code', '/KT/:batch/:code', '/KB/:batch/:code', '/KG/:batch/:code', '/KW/:batch/:code', '/LA/:batch/:code', '/NS/:batch/:code', '/NG/:batch/:code', '/OG/:batch/:code', '/OD/:batch/:code', '/OS/:batch/:code', '/OY/:batch/:code', '/PL/:batch/:code', '/RV/:batch/:code', '/SO/:batch/:code', '/TR/:batch/:code', '/YB/:batch/:code', '/ZM/:batch/:code']
  // console.log('tryna login ', req.session.statecode, req.session.id, req.session.loggedin);
  // they should be able to change state code too !!!!!!!!!!!! --later
  console.log('\n\n\nreq.params', req.params.batch, req.params.code) // req.path is shorthand for url.parse(req.url).pathname
  // when they update their profile. it should immediately reflect. so set it in the session object after a successfully update

  if (req.session.loggedin) {
    res.set('Content-Type', 'text/html');

    /** this query runs so we can get the number of unread messages the user has */
    query.UnreadMessages([req.path.substring(1, 12).toUpperCase(), false]).then(result => {
      res.render('pages/account', {
        statecode: req.session.statecode.toUpperCase(),
        statecode2: req.path.substring(1, 12).toUpperCase(),
        servicestate: req.session.servicestate,
        batch: req.session.batch,
        name_of_ppa: req.session.name_of_ppa,
        total_num_unread_msg: result
      });
    }, reject => {
      console.log('why TF?!', reject);

      res.render('pages/account', {
        statecode: req.session.statecode.toUpperCase(),
        statecode2: req.path.substring(1, 12).toUpperCase(),
        servicestate: req.session.servicestate,
        batch: req.session.batch,
        name_of_ppa: req.session.name_of_ppa,
        total_num_unread_msg: 0
      });
    })

  } else {
    res.redirect('/login');
  }
});

router.get('/chat', function (req, res) {
  res.set('Content-Type', 'text/html');
  // res.sendFile(__dirname + '/chat.html');
  // req.query.posts.who and req.query.posts.when

  // to get old chats

  /**
   * WARNING !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!11
   * TIME IS AN IMPORTANT ISSUE HERE. AND TIME CONVERSION TOO...
   * utc + 1 is our time zone [when converting], or use moment .js
   */

  console.log('??', req.session.loggedin, req.query, '\n??')

  query.GetChatData(req).then(result => {
    res.set('Content-Type', 'text/html');
    res.render('pages/newchat', result);
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
  // res.sendFile(__dirname + '/map.html');

  query.GetMapData().then(result => {
    res.render('pages/map', {
      statecode: req.session.statecode,
      servicestate: req.session.servicestate,
      mapdata: result.mapdata,
      types: result.types
    });
  }, error => {
    console.log('there was an error getting /map', error); // but render regardless
    res.render('pages/map', {
      statecode: req.session.statecode,
      servicestate: req.session.servicestate,
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
  })
});

router.get('/signup', function (req, res) {
  res.set('Content-Type', 'text/html');
  res.render('pages/register');
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

      req.session.statecode = req.body.statecode.toUpperCase();
      req.session.loggedin = true;
      req.session.servicestate = result.theservicestate;
      req.session.batch = req.body.statecode.toUpperCase().slice(3, 6);
      req.session.loggedin = true;
      req.session.location = req.session.servicestate; // really fix this, we should add some other data if we can

      res.redirect(req.body.statecode.toUpperCase());

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

      req.session.statecode = req.body.statecode.toUpperCase();
        req.session.batch = result.response[0].batch;
        req.session.loggedin = true;
        req.session.servicestate = result.response[0].servicestate;
        req.session.name_of_ppa = result.response[0].name_of_ppa;
        req.session.location = req.session.servicestate + (result.response[0].city_town ? ', ' + result.response[0].city_town : '') /* + (results1[0].region_street ? ', ' + results1[0].region_street : '' ) */;

        res.status(200).redirect(req.body.statecode.toUpperCase());

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
    })
});

router.get('/login', function (req, res) {
  res.set('Content-Type', 'text/html');
  res.render('pages/login');
});

router.get('/contact', function (req, res) {
  res.set('Content-Type', 'text/html');
  res.render('pages/contact');
});

router.get('/count', function (req, res) {
  res.set('Content-Type', 'text/html');
  res.render('pages/count'); // show number of people online, then per state. something nice and interactive and definately real time too
});

module.exports = router;
