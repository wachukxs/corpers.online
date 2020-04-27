const express = require('express');
let router = express.Router();

const query = require('../models/queries');

router.get(['/', '/home', '/index', '/homepage'], function (req, res) {
  /* _session = req.session;
  _session.d = 'k'; */
  res.type('.html');
  // res.contentType('*/*');
  // res.sendFile(__dirname + '/index.html');
  res.render('pages/index');
});

router.get(['/about', '/about-us'], function (req, res) {
  /* _session = req.session;
  _session.d = 'k'; */
  res.type('html');
  // res.contentType('*/*');
  // res.sendFile(__dirname + '/index.html');
  res.render('pages/about', {
    // houses: results1,
    // pictures: results2
  });
});

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

  if (req.session.loggedin && req.query.posts) { // we need to be sure that they clicked from /account
    var postresult;
    // console.log('\n\n\n\n\n uhmmmm', req.query.posts.who, req.query.posts.when, req.query.posts.type, moment(new Date(parseInt(req.query.posts.when))).format('YYYY-MM-DD HH:mm:ss'));
    // console.log( new Date(parseInt(req.query.posts.when)).toISOString().slice(0, 19).replace('T', ' ') ); // typeof req.query.posts.when = string

    // ALSO SELECT OLDMESSAGES THAT ARE NOT SENT... THEN COUNT THEM... 
    if (req.query.posts.type == 'accommodation') {
      var query = "SELECT * FROM accommodations WHERE statecode = '" + req.query.posts.who + "' AND input_time = '" + moment(new Date(parseInt(req.query.posts.when))).format('YYYY-MM-DD HH:mm:ss') + "' ; "
        // + " SELECT * FROM chats WHERE room LIKE '%" + req.query.s + "%' AND message IS NOT NULL ;"
        +
        " SELECT chats.room, chats.message, chats.message_from, chats.message_to, chats.media, chats.time, chats.read_by_to, chats.time_read, chats._time, chats.message_sent, info.firstname AS sender_firstname, info.lastname AS sender_lastname FROM chats, info WHERE info.statecode = chats.message_from AND chats.room LIKE '%" + req.query.s + "%' AND chats.message IS NOT NULL ;"
        // + " SELECT * FROM chats WHERE room LIKE '%" + req.query.s + "%' AND message IS NOT NULL AND message_sent = false ;";
        +
        " SELECT * FROM chats WHERE message_to = '" + req.query.s + "' AND message IS NOT NULL AND message_sent = false ;" +
        " SELECT * FROM chats WHERE message_from = '" + req.query.s + "' AND message IS NOT NULL AND message_sent = false ;" +
        " SELECT firstname, lastname FROM info WHERE statecode = '" + req.query.posts.who.toUpperCase() + "' ;";

    } else if (req.query.posts.type == 'sale') { // we will only do escrow payments for products sale
      var query = "SELECT * FROM posts WHERE statecode = '" + req.query.posts.who + "' AND post_time = '" + req.query.posts.when + "' ;"
        // + " SELECT * FROM chats WHERE room LIKE '%" + req.query.s + "%' AND message IS NOT NULL ;"
        +
        " SELECT chats.room, chats.message, chats.message_from, chats.message_to, chats.media, chats.time, chats.read_by_to, chats.time_read, chats._time, chats.message_sent, info.firstname AS sender_firstname, info.lastname AS sender_lastname FROM chats, info WHERE info.statecode = chats.message_from AND chats.room LIKE '%" + req.query.s + "%' AND chats.message IS NOT NULL ;"
        // + " SELECT * FROM chats WHERE room LIKE '%" + req.query.s + "%' AND message IS NOT NULL AND message_sent = false ;";
        +
        " SELECT * FROM chats WHERE message_to = '" + req.query.s + "' AND message IS NOT NULL AND message_sent = false ;" +
        " SELECT * FROM chats WHERE message_from = '" + req.query.s + "' AND message IS NOT NULL AND message_sent = false ;" +
        " SELECT firstname, lastname FROM info WHERE statecode = '" + req.query.posts.who.toUpperCase() + "' ;";

    }
    /**SELECT chats.room, chats.message, chats.message_from, chats.message_to, chats.media, chats.time, chats.read_by_to, chats.time_read, chats._time, chats.message_sent, info.firstname AS sender_firstname, info.lastname AS sender_lastname FROM chats, info WHERE info.statecode = chats.message_from AND chats.room LIKE '%AB/17B/1234%' AND chats.message IS NOT NULL   */

    pool.query(query, function (error, results, fields) {

      if (error) throw error;

      // console.info('\nold chats', results[1], '\nfrom db successfully');
      // so if the newchat has chatted before, i.e. is in oldchats, then just make it highlighted
      // then send it to the chat page of the involved parties so they are remainded of what they want to buy
      res.render('pages/newchat', { // having it named account.2 returns error cannot find module '2'
        statecode: req.session.statecode.toUpperCase(),
        statecode2: req.query.s,
        servicestate: req.session.servicestate,
        batch: req.session.batch,
        name_of_ppa: req.session.name_of_ppa,
        postdetails: (isEmpty(results[0]) ? null : results[0]), // tell user the post no longer exists, maybe it was bought or something, we should delete it if it was bought, we hope not to use this function
        newchat: {
          statecode: req.query.posts.who.toUpperCase(),
          name: results[4][0]
        },
        posttime: req.query.posts.when,
        posttype: req.query.posts.type,
        oldchats: results[1], // leave it like this!!
        oldunreadchats: results[2], // messages that was sent to this user but this user hasn't seen them
        oldunsentchats: results[3], // messages this user sent but hasn't deliver, i.e. the receipent hasn't seen it
        total_num_unread_msg: results[2].filter((value, index, array) => {
          return value.message_to == req.query.s && value.message_sent == 0
        }).length
      });


    });

  } else if (req.session.loggedin) {
    res.set('Content-Type', 'text/html');
    // res.sendFile(__dirname + '/account.html');
    // console.log('wanna chat', req.session.statecode, req.query.s);
    var query = // "SELECT * FROM chats WHERE room LIKE '%" + req.query.s + "%' AND message IS NOT NULL;"
      " SELECT chats.room, chats.message, chats.message_from, chats.message_to, chats.media, chats.time, chats.read_by_to, chats.time_read, chats._time, chats.message_sent, info.firstname AS sender_firstname, info.lastname AS sender_lastname FROM chats, info WHERE info.statecode = chats.message_from AND chats.room LIKE '%" + req.query.s + "%' AND chats.message IS NOT NULL ;" +
      " SELECT * FROM chats WHERE message_to = '" + req.query.s + "' AND message IS NOT NULL AND message_sent = false ;" +
      " SELECT * FROM chats WHERE message_from = '" + req.query.s + "' AND message IS NOT NULL AND message_sent = false ;";
    pool.query(query, function (error, results, fields) {

      if (error) throw error;

      // console.info('got unread chats from db successfully', results[1]);

      // then send it to the chat page of the involved parties so they are remainded of what they want to buy
      res.render('pages/newchat', { // having it named account.2 returns error cannot find module '2'
        statecode: req.session.statecode.toUpperCase(),
        statecode2: req.query.s,
        servicestate: req.session.servicestate,
        batch: req.session.batch,
        name_of_ppa: req.session.name_of_ppa,
        oldchats: results[0], // leave it like this!!
        newchat: null,
        oldunreadchats: results[1], // (isEmpty(results[1]) ? null : results[1])
        oldunsentchats: results[2],
        total_num_unread_msg: results[1].filter((value, index, array) => {
          return value.message_to == req.query.s && value.message_sent == 0
        }).length
      });
    });

  } else {
    res.redirect('/login');
  }
});

router.get(['/map', '/maps'], function (req, res) { // try to infer their location from their IP Address then send to the front end
  res.set('Content-Type', 'text/html');
  // res.sendFile(__dirname + '/map.html');


  // what about name of the ppa ? this way of selecting might prove inefficient when we have large data set from all the states meanwhile this corper just need data from within a particular state.
  // also select ppa_directions from info and it should be like a reveal, corpers would click 'read directions' and it'll show them
  pool.query("SELECT ppa_address, ppa_geodata, type_of_ppa FROM info WHERE ppa_address != '' AND ppa_geodata != '' AND type_of_ppa != '' ; SELECT geo_data, name, address, lga, street, type_of_place, region FROM places ; SELECT type_of_ppa FROM info WHERE type_of_ppa != '' ", function (error, results, fields) { // bring the results in ascending order

    if (error) { // gracefully handle error e.g. ECONNRESET || ETIMEDOUT || PROTOCOL_CONNECTION_LOST, in this case re-execute the query or connect again, act approprately
      console.log(error);
      throw error;
    } else if (!isEmpty(results)) {
      console.log('geo data for map', results);


      // JSON.parse(JSON.stringify([{ g: 'g', l: 'l' }, { g: 'g', l: 'l' }, { g: 'g', l: { g: 'g', l: { g: 'g', l: 'l' } } }]))

      // JSON.parse(JSON.stringify(results));

      // for the results from places table
      for (let index = 0; index < results[1].length; index++) {
        // re-arrange to GeoJSON Format
        results[1][index].type = "Feature";

        results[1][index].properties = {};
        results[1][index].properties.geodata = JSON.parse(results[1][index].geo_data); // we're always expecting a json here else err
        results[1][index].properties.address = results[1][index].address;
        results[1][index].properties.type = results[1][index].type_of_place;

        // we can add lga, name, and maybe region

        results[1][index].geometry = {};
        results[1][index].geometry.type = "Point";
        results[1][index].geometry.coordinates = [JSON.parse(results[1][index].geo_data).longitude, JSON.parse(results[1][index].geo_data).latitude];

        console.log(JSON.parse(results[1][index].geo_data).latlng, '/////', JSON.parse(results[1][index]['geo_data']).longitude, JSON.parse(results[1][index]['geo_data']).latitude);

        delete results[1][index]['geo_data'];
        delete results[1][index]['type_of_place'];
        delete results[1][index]['address'];

        // delete redundate data like longitude, latitude, and latlng in ppa_geodata after reassigning values

      }

      // for the results from info table
      // format to GeoJSON Format https://tools.ietf.org/html/rfc7946
      for (index = 0; index < results[0].length; index++) {

        // re-arrange to GeoJSON Format
        results[0][index].type = "Feature";

        results[0][index].properties = {};
        results[0][index].properties.geodata = JSON.parse(results[0][index].ppa_geodata);
        results[0][index].properties.address = results[0][index].ppa_address;
        results[0][index].properties.type = results[0][index].type_of_ppa;

        results[0][index].geometry = {};
        results[0][index].geometry.type = "Point";
        results[0][index].geometry.coordinates = [JSON.parse(results[0][index].ppa_geodata).longitude, JSON.parse(results[0][index].ppa_geodata).latitude];

        console.log(JSON.parse(results[0][index].ppa_geodata).latlng, '======++++++++====', JSON.parse(results[0][index]['ppa_geodata']).longitude, JSON.parse(results[0][index]['ppa_geodata']).latitude);

        delete results[0][index]['ppa_geodata'];
        delete results[0][index]['type_of_ppa'];
        delete results[0][index]['ppa_address'];

        // delete redundate data like longitude, latitude, and latlng in ppa_geodata after reassigning values
      }

      var listoftypesofppas = ["ATM", "Bank", "School", "Hospital", "Corporate office", "Industory", "Mosque", "Bus stop", "Shop", "Stadium", "Airport", "Market", "Church", "Hotel", "University"];


      /**
       * add ppas that weren't in listoftypesofppas but other corpers have added them, 
       * over time, when some types of ppas become common, we add them to listoftypesofppas
       * 
       * we'd make this better so that 'school' and 'School' isn't in the array
       */
      for (let index = 0; index < results[2].length; index++) {
        const element = results[2][index].type_of_ppa;
        if (!results[2][element]) {
          listoftypesofppas.push(element)
        }
      }
    }

    res.render('pages/map', {
      statecode: req.session.statecode,
      servicestate: req.session.servicestate,
      mapdata: JSON.stringify(results[0].concat(results[1])),
      types: listoftypesofppas
    });
  });


});

// edited
router.post('/subscribe', /* upload.none(), */ function (req, res) {
  console.log('the sublist', req.body);
  if (isEmpty(req.body.email)) {
    res.status(406).send('Not Acceptable');
  } else {
    // console.log('NOT empthy');
    pool.query("INSERT INTO subscribers ( email ) VALUES (" + pool.escape(req.body.email) + ")", function (error, results, fields) {

      if (error) {
        console.log('the error code:', error.code)
        switch (error.code) { // do more here
          case 'ER_DUP_ENTRY': // ER_DUP_ENTRY if an email exists already
            res.status(406).send('Not Acceptable');
            break;
        }
        // throw error;
      } else if (results.affectedRows === 1) {
        res.status(200).send('OK');
      }
    });

  }
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
      switch (error.message) {

        case 'duplicate statecode':
          res.redirect('/signup?m=ds'); // [m]essage = [d]uplicate [s]tatecode
          break;

        case 'duplicate email':
          res.redirect('/signup?m=de'); // [m]essage = [d]uplicate [e]mail
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

    query.CorpersLogin([req.body.statecode.toUpperCase(), req.body.password]).then(result => {

      if (result.response[0].password === req.body.password) { // verify password, crucial step
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
      } else {
        res.status(502).redirect('/login?p=w'); // [p]assword = [w]rong
      }


    }, reject => {

      switch (reject.message) {
        case false:
          res.status(502).redirect('/login?l=n');
          break;

        case 'sign up':
          res.status(502).redirect('/login?m=s'); // [m]essage = [s]ignup // tell corper at the front end
          break;

        default:
          res.status(502).redirect('/login?b=e'); // [b]ackend = [e]rror
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
