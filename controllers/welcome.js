const express = require('express');
let router = express.Router();
const jwt = require('jsonwebtoken')
const query = require('../utilities/queries');
const auth = require('../helpers/auth')
const helpers = require('../utilities/helpers')
const ngstates = require('../utilities/ngstates')
const Busboy = require('busboy');
const ggle = require('../helpers/uploadgdrive');

String.prototype.sentenceCase = function() {
  // return this.charAt(0).toUpperCase() + this.slice(1);

  return this.split(' ')
  .map(function(word) { // Then use array.map to create a new array containing the capitalized words.
      return word.charAt(0).toUpperCase() + word.slice(1);
  })
  .join(" "); // Then join the new array with spaces:
}

/**options for setting JWT cookies */
let cookieOptions = {
  httpOnly: true, // frontend js can't access
  maxAge: auth.maxAge,
  // sameSite: 'strict', // https://github.com/expressjs/session/issues/660#issuecomment-514384297
  // path: '' // until we figure out how to add multiple path
}

if (process.env.NODE_ENV === 'production') {
  cookieOptions.secure = true // localhost, too, won't work if true
}

router.get(['/', '/home', '/index'], function (req, res) {
  res.type('.html');
  res.render('pages/index', { current_year: new Date().getFullYear() });
  // res.render('pages/coming-soon', { current_year: new Date().getFullYear() });
});

router.get(['/homepage'], function (req, res) {
  res.set('Content-Type', 'text/html'); // res.type('.html');
  res.render('pages/index', { current_year: new Date().getFullYear() });
});

// about.eje became index.ejs
router.get(['/about', '/about-us'], function (req, res) {
  res.set('Content-Type', 'text/html');
  res.render('pages/about', { current_year: new Date().getFullYear() });
});

router.get('/corpers', auth.checkJWT, function (req, res) {
  console.log('wave your hands to Jesus\n\n')

  query.CorpersInNG().then(result => {
    let response = {}
    response.current_year = new Date().getFullYear()
    response.corper = null
    if (req.session.corper) {
      response.corper = req.session.corper
    }
    response.corpers = result;
    response.state = 'Nigeria';
    res.set('Content-Type', 'text/html');
    res.render('pages/state', response);
  }, reject => {
    console.error(reject);
    res.render('pages/state', { corpers: null, state: 'Nigeria' })
  }).catch(err => res.render('pages/state', { corpers: null, state: 'Nigeria' }))
});

router.get(ngstates.states_short_paths, auth.checkJWT, function (req, res) {
  // has req.params.state
  let state = ngstates.states_long[ngstates.states_short.indexOf(req.params.state.toUpperCase())]
  
  console.log(state.sentenceCase(), 'HJKK'.sentenceCase(), '239\n\n', req.path, 'state', req.path.substring(1), req.params)

  query.CorpersInState(state).then(result => {
    let response = {}
    response.current_year = new Date().getFullYear()
    if (req.session.corper) {
      response.corper = req.session.corper
    } else {
      response.corper = null
    }
    response.corpers = result;
    response.state = state;
    
    res.set('Content-Type', 'text/html');
    res.render('pages/state', response);
  }, reject => {
    console.error(reject);
    res.render('pages/state', { corpers: null, state: state })
  }).catch(err => res.render('pages/state', { corpers: null, state: state }))
});

router.get(ngstates.states_short_paths_batch, function (req, res) {
  console.log('29039\n\n', req.path, req.params)
  // has req.params.state & req.params.year
  res.set('Content-Type', 'text/html');
  res.render('pages/state');
});

router.get(ngstates.states_short_paths_batch_regex_stringed, function (req, res) { // work with the batch
  console.log('775654\n\n', req.path, req.params)
  // has req.params.state & req.params.year_batch
  // req.params['3'] is the batch
  res.set('Content-Type', 'text/html');
    res.render('pages/state');
});

router.get('/careers', function (req, res) { // work with us
  res.set('Content-Type', 'text/html');
    res.render('pages/careers', { current_year: new Date().getFullYear() });
});

router.post('/careers', function (req, res) { // work with us
  console.log('work with us');
  const busboy = new Busboy({
    headers: req.headers,
    limits: { // set fields, fieldSize, and fieldNameSize later (security)
      files: 12, // don't upload more than 12 media files
      fileSize: 24 * 1024 * 1024 // 24MB
    }
  });

  let _media = []; // good, because we re-initialize on new post
  let _text = {};
  let uploadPromise = [];


  busboy.on('file', function (fieldname, filestream, filename, transferEncoding, mimetype) {

    // there's also 'limit' and 'error' events https://www.codota.com/code/javascript/functions/busboy/Busboy/on
    filestream.on('limit', function () {
      console.log('the file was too large... nope'); // we should send message to frontend
      

      // how should we send a response if one of the files/file is invalid [too big or not an accepted file type]?
    });


    filestream.on('data', function (data) {
      
      console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
    });

    filestream.on('end', function (err) {
      // if we listend for 'file', even if there's no file, we still come here
     
      console.log('File [' + fieldname + '] Finished. Got ' + 'bytes');
      if (err) { console.log('err in busboy file end', err); }
    });


    // this is not a very very good method

    /**One thing you might be able to try is to read 0 bytes from the stream first and see if you get the appropriate 'end' event or not (perhaps on the next tick) */

    if (filename !== '') { // filename: 1848-1844-1-PB.pdf, encoding: 7bit, mimetype: application/pdf
      
      let fileMetadata = {
        'name': filename,
        parents: [process.env.CO_CVS_GDRIVE]
      };
      let media = {
        mimeType: mimetype,
        body: filestream
      };
      // how about we add meta data to the file with ggle APIs, like it is a picture of a bathroom or fridge
      const up = ggle.drive.files.create({ // up = [u]pload [p]romise
        resource: fileMetadata,
        media: media,
        fields: 'id',
      }).then(
        function (file) {

          console.log('upload File Id: ', file.data.id); // to save to db
          
          // _media.push(file.data.id)
          _text.cv = file.data.id
        }, function (err) {
          // Handle error
          console.error(err);
        }
      ).catch(function (err) {
        console.error('some other error ??', err)
      }).finally(() => {
        console.log('upload finally')
      });

      uploadPromise.push(up)

    }
    
    filestream.resume() // must always be last in this callback else server HANGS

  });


  busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, transferEncoding, mimetype) {
    console.log('Field [' + fieldname + ']: value: ' + inspect(val));
    // this if block is an hot fix
   
    if (val && val !== 'null') {
      _text[fieldname] = val;
    }
    // seems inspect() adds double quote to the value
    
    console.warn('fielddname Truncated:', fieldnameTruncated, valTruncated, transferEncoding, mimetype);
  });

  busboy.on('finish', async function () {
    console.log('Done parsing form!', _text, _media);
    
    if (!helpers.isEmpty(_text) && !helpers.isEmpty(uploadPromise)) {
      console.log('chilling ...');
      await Promise.all(uploadPromise);

      query.InsertRowInCareersTable(_text).then(result => {
        res.sendStatus(200);

        console.log('got an application', _text);

        // once it saves in db them emit to other users
        
      }, reject => { // give proper feedback based on error
        console.log('insert row didn\'t work', reject);
        res.sendStatus(500);
      }).catch(reason => {
        console.log('insert row failed', reason);
        res.sendStatus(500)
      })

    }
  });

  // handle post request, add data to database... do more

  return req.pipe(busboy)

});

/* 
// great resource for express route regex https://www.kevinleary.net/regex-route-express/ & https://forbeslindesay.github.io/express-route-tester/
let years = parseInt(new Date(Date.now()).getFullYear().toFixed().slice(2, 4));
let yearrange = '(' + (years - 1).toString() + '|' + years.toString() + ')'; // (18|19)
router.get('/:state((AB|AD|AK|AN|BA|BY|BN|BO|CR|DT|EB|ED|EK|EN|FC|GM|IM|JG|KD|KN|KT|KB|KG|KW|LA|NS|NG|OG|OD|OS|OY|PL|RV|SO|TR|YB|ZM|ab|ad|ak|an|ba|by|bn|bo|cr|dt|eb|ed|ek|en|fc|gm|im|jg|kd|kn|kt|kb|kg|kw|la|ns|ng|og|od|os|oy|pl|rv|so|tr|yb|zm))/:year_batch((' + yearrange + '([abcACB])))/:lastfour(([0-9]{4}))', 
auth.verifyJWT, function (req, res) {
  console.log('req.params/session', req.session, req.params) // req.path is shorthand for url.parse(req.url).pathname

    res.set('Content-Type', 'text/html');

    // this query runs so we can get the number of unread messages the user has 
    query.UnreadMessages([req.session.corper.state_code.toUpperCase(), false]).then(result => {
      res.render('pages/account', {
        state_code: req.session.corper.state_code.toUpperCase(),
        batch: req.params['3'],
        total_num_unread_msg: result,
        ...req.session.corper
      });
    }, reject => {
      console.log('why TF?!', reject);

      res.render('pages/account', {
        state_code: req.session.corper.state_code.toUpperCase(),
        service_state: req.session.corper.service_state,
        batch: req.params['3'],
        name_of_ppa: req.session.corper.name_of_ppa,
        total_num_unread_msg: 0, // really ??? Zero?
        picture_id: req.session.corper.picture_id, // if there's picture_id // hmmm
        first_name: req.session.corper.first_name
      });
    }).catch((err) => { // we should have this .catch on every query
      console.error('our system should\'ve crashed:', err)
      res.redirect('/?e') // go back home, we should tell you an error occured
    })

});
 */

router.get('/oldchat', /* auth.verifyJWT, */ function (req, res) {
  // req.query.posts.who and req.query.posts.when

  // to get old chats

  /**
   * WARNING !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
   * TIME IS AN IMPORTANT ISSUE HERE. AND TIME CONVERSION TOO...
   * utc + 1 is our time zone [when converting], or use moment .js
   */

  console.log('logged in?', req.session.loggedin, 'req.query =>', req.query, '\n??')

  query.GetChatData(req).then(result => {
    res.set('Content-Type', 'text/html');
    console.log('all chat kini', result);
    res.render('pages/chat', result);
  }, reject => {
    res.set('Content-Type', 'text/html');
    res.redirect('/login');
  }).catch(reason => {
    // we hope we never get here
    console.log('what happened at /chat???', reason);
    res.set('Content-Type', 'text/html');
    res.redirect('/login');
  })

});

router.get(['/map', '/maps'], function (req, res) { // try to infer their location from their IP Address then send to the front end
  res.set('Content-Type', 'text/html');
  query.GetMapData().then(result => {
    res.render('pages/map', {
      ...(req.session.corper) && {state_code: req.session.corper.state_code}, // we aren't using in the front end yet
      ...(req.session.corper) && {service_state: req.session.corper.service_state}, // we aren't using in the front end yet
      mapdata: result.mapdata,
      types: result.types
    });
  }, error => {
    console.log('there was an error getting /map', error); // but render regardless
    res.render('pages/map', {
      ...(req.session.corper) && {state_code: req.session.corper.state_code}, // we aren't using in the front end yet
      ...(req.session.corper) && {service_state: req.session.corper.service_state}, // we aren't using in the front end yet
      mapdata: {},
      types: []
    });
  }).catch(reason => {
    console.log('do we have a problem?', reason);
    res.render('pages/map')
  })

});

// edited
// make a custom middleware where we just use busboy to get the form inputs
router.post('/subscribe', function (req, res) {
  const busboy = new Busboy({
    headers: req.headers,
  });
  let _sub_data = {}

  busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, transferEncoding, mimetype) {
    console.log('Field [' + fieldname + ']: value: ' + inspect(val));
    
    _sub_data[fieldname] = val; // inspect(val); // seems inspect() adds double quote to the value
    
  });

  busboy.on('finish', async function () {
    // console.log('the sublist', _sub_data);

    query.SubscribeToEmailUpdates(_sub_data).then(result => {
      res.status(200).send('OK');
    }, reject => {
      console.log('the reject error code:', reject.code)
      switch (reject.code) { // do more here, but ... this is the only error we're expecting
        case 'ER_DUP_ENTRY': // ER_DUP_ENTRY if an email exists already
          res.status(406).send('Not Acceptable');
          break;
        default:
          res.status(500).send('Internal Server Error');
          break;
      }
    }).catch((err) => { // we should have this .catch on every query
      console.error('our system should\'ve crashed:', err)
      res.status(500).send('Internal Server Error'); // we should tell you an error occured
    })

   })

  

  return req.pipe(busboy)
});

router.get('/signup', function (req, res) {
  res.set('Content-Type', 'text/html');
  res.set("Cache-Control", "no-cache");
  res.set("Pragma", "no-cache");
  // res.setHeader("Expires", 0);
  // res.set('Cache-Control', 'public, max-age=0')
  res.render('pages/signup', { current_year: new Date().getFullYear() });
});

/* 
// edited
router.post('/signup', express.urlencoded({
  extended: true
}), function (req, res) {
    // handle post request, add data to database.
    // implement the hashing of password before saving to the db
    // also when some one signs up, it counts as login time too, so we should include it in usage details table

    // we can find the service state with req.body.state_code.slice(0, 2) which gives the first two letters
    query.CorpersSignUp(req.body).then(result => {
      console.log('re:', result);
      req.session.corper = {}
      req.session.corper.state_code = req.body.state_code.toUpperCase();
      // req.session.loggedin = true;
      req.session.corper.service_state = result.theservicestate;
      req.session.corper.batch = req.body.state_code.toUpperCase().slice(3, 6);
      req.session.corper.location = req.session.corper.service_state; // really fix this, we should add some other data if we can

      // send welcome email
      helpers.sendSignupWelcomeEmail(req.body.email, req.body.first_name, result.theservicestate)
      jwt.sign({state_code: req.body.state_code.toUpperCase()}, process.env.SESSION_SECRET, (err, token) => {
        if (err) throw err
        else {
          // res.setHeader('Set-Cookie', 'name=value')
          res.cookie('_online', token, cookieOptions)
          res.status(200).redirect(req.body.state_code.toUpperCase());
        }
      })

    }, error => {
      console.log('CorpersSignUp() error happened', error);
      // res.send(error.message) // try this & not redirect
      switch (error.message) {

        case 'duplicate state_code':
          res.redirect('/signup?m=ds'); // [m]essage = [d]uplicate [s]tatecode
          break;

        case 'duplicate email':
          res.redirect('/signup?m=de'); // [m]essage = [d]uplicate [e]mail
          break;

        case 'invalid state_code':
          res.redirect('/signup?m=is') // [m]essage = [i]nvalid [s]tatecode
          break;

        default:
          res.redirect('/signup?m=ue'); // [m]essage = [u]naccounted [e]rror
          break;
      }
    }).catch(reason => {
      console.error('catching this err because:', reason);
      res.redirect('/signup?m=ue')
    });


});
 */

// if someone tries loggin in with a state code that is correct but isn't yet registerd (i.e. hasn't been signed up with in corpers.online), what do we do ?
// block it? esp if they try more than once... ??
/* 
router.post('/login', express.urlencoded({ // edited
    extended: true
  }), function (req, res) {
    // handle post request, validate data with database.
    // how to handle wrong password with right email or more rearly, right password and wrong password.

    query.CorpersLogin(req.body).then(
      result => {
      console.log('we good', process.env.SESSION_SECRET);
      req.session.corper = result.response[0];
      req.session.corper.location = result.response[0].service_state + (result.response[0].city_or_town ? ', ' + result.response[0].city_or_town : ''); // + (results1[0].region_street ? ', ' + results1[0].region_street : '' )
      // req.session.loggedin = true;

      jwt.sign({state_code: req.body.state_code.toUpperCase()}, process.env.SESSION_SECRET, (err, token) => {
        if (err) throw err
        else {
          // res.setHeader('Set-Cookie', 'name=value')
          res.cookie('_online', token, cookieOptions)
          console.log('we\'re moving', req.session);
          
          res.status(200).redirect(req.body.state_code.toUpperCase());
        }
      })

      query.LoginSession([req.body.state_code.toUpperCase(), req.session.id, req.headers["user-agent"]]).then(resolve => {
        // console.log('saved login session info', resolve);
      }, reject => {
        // console.log('reject save login session', reject);
      }).catch(reason => {
        // console.log('fail save login session', reason);
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
      console.error('catching CorpersLogin() err because:', reason);
      res.status(502).redirect('/login?t=a')
    })
});
 */


router.get('/contact', function (req, res) {
  console.log('chal\n\t');
  res.set('Content-Type', 'text/html');
  res.render('pages/contact', { current_year: new Date().getFullYear() });
});

router.get('/count', function (req, res) {
  res.set('Content-Type', 'text/html');
  res.render('pages/count'); // show number of people online, then per state. something nice and interactive and definately real time too
});

module.exports = router;
