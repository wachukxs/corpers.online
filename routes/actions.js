const express = require('express');
const Busboy = require('busboy');
const multer = require('multer');
inspect = require('util').inspect;
const helpers = require('../constants/helpers')
const socket = require('../sockets/routes')
const ngplaces = require('../constants/ngstates')
const moment = require('moment');
const query = require('../models/queries');
const ggle = require('../helpers/uploadgdrive');
// using path module removes the buffer object from the req.files array of uploaded files,... incase we ever need this... info!
// const path = require('path');

/* list (array) of accepted files */
const acceptedfiles = ['image/gif', 'image/jpeg', 'image/png', 'image/tiff', 'image/vnd.wap.wbmp', 'image/x-icon', 'image/x-jng', 'image/x-ms-bmp', 'image/svg+xml', 'image/webp', 'video/3gpp', 'video/mpeg', 'video/mp4', 'video/x-msvideo', 'video/x-ms-wmv', 'video/x-ms-asf', 'video/x-mng', 'video/x-flv', 'video/quicktime'];

/**
 * handles SETTING the path for STORAGE and NAMING of files
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) { // 1350914 benchmark ?
    console.log('THE FILE', file)
    cb(null, './img/')
  },
  filename: function (req, file, cb) {
    console.log('the file details:', file)
    // we're adding a random number between 50 and 99 (to Date.now()) just to make sure no two filenames are thesame
    // from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
    cb(null, (Math.floor(Math.random() * (100 - 50)) + 50) + Date.now() + file.originalname.slice(file.originalname.lastIndexOf('.'))) // get the file extension of the file you want to copy plus the '.' char 
  },
  fileFilter: function fileFilter(req, file, cb) {

    /**
     * The function should call `cb` with a boolean
     * to indicate if the file should be accepted
     * 
     * To reject this file pass `false`, like so:
     * cb(null, false)
     * 
     * To accept the file pass `true`, like so:
     * cb(null, true)
     * 
     * You can always pass an error if something goes wrong:
     * cb(new Error('I don\'t have a clue!'))
     * 
     * try to catch this error and show it to the user, for now we're just ignoring unacceptable files
     */
    cb(null, acceptedfiles.includes(file.mimetype))

  }
})

const upload = multer({
  storage: storage
})

let router = express.Router();

router.get('/allstateslgas', function (req, res) {
  res.set('Content-Type', 'application/json');
  fs.readFile('places.json', (err, data) => {
    let jkl = JSON.parse(data);
    // let's hope there's no err
    res.send(jkl);
  })
});

router.get('/allppas', function (req, res) {
  res.set('Content-Type', 'application/json');
  query.AllPPAs().then(result => {
    res.send(result);
  }, reject => {
    res.sendStatus(500);
  }).catch(error => {
    res.sendStatus(500);
  })

});

router.get('/newsearch', function (req, res) {
  // maybe make use of [req.originalUrl .baseUrl .path] later. req.params too

  // "/search?type=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address + "&top=" + item.type_of_ppa; // nop type pa

  // "/search?type=" + item.group + "&it=" + item.input_time + "&sn=" + item.streetname + "&sc=" + item.statecode; // sn sc it
  res.set('Content-Type', 'text/html');
  // res.sendFile(__dirname + '/search and places/index.html');
  console.log('req.query:', req.query); // find every thing that is req.query.search.query
  
  query.DistinctNotNullDataFromPPAs(req).then(result => {
    res.render('/newsearch2', result)
  }, reject => {
    res.sendStatus(500);
  }).catch(error => {
    res.sendStatus(500);
  })

});

router.get('/search', function (req, res) {
  // maybe make use of [req.originalUrl .baseUrl .path] later. req.params too

  // "/search?type=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address + "&top=" + item.type_of_ppa; // nop type pa

  // "/search?type=" + item.group + "&it=" + item.input_time + "&sn=" + item.streetname + "&sc=" + item.statecode; // sn sc it
  res.set('Content-Type', 'text/html');
  // res.sendFile(__dirname + '/search and places/index.html');
  console.log('req.query:', req.query); // find every thing that is req.query.search.query

  // if we know where the ppa is, get the geo data and show it on the map
  // if we don't know where the ppa is, ask the corper to show us on the map, we can even do this from the front end
  if (req.query.nop) {
    // should we only be getting data from info ? how about [ppas in] places table ?????????????
    // we have req.query.nop=name_of_ppa + req.query.pa=ppa_address + req.query.top=type_of_ppa
    // also select ppa closer to it and other relevant info we'll find later
    // also if we don't have the geo data for a school, we can try searching else where for it...
    // also we should track where the search is from coming from
    pool.query("SELECT name_of_ppa, ppa_address, type_of_ppa, ppa_geodata FROM info WHERE name_of_ppa = '" + req.query.nop + "'", function (error, results, fields) { // bring the results in ascending order
      console.log(results[0].ppa_geodata != '', 'we want to check', results)
      if (error) { // gracefully handle error e.g. ECONNRESET || ETIMEDOUT || PROTOCOL_CONNECTION_LOST, in this case re-execute the query or connect again, act approprately
        console.log(error);
        throw error;
      } else if (!helpers.isEmpty(results) && results[0].ppa_geodata != '') {
        // we're not adding the GeoJSON results to an array because it's only one result
        for (index = 0; index < results.length; index++) {
          /**
           * {
                  "type": "Feature",
                  "properties": {
                      "name": "Coors Field",
                      "amenity": "Hospital",
                      "popupContent": "The Amenity [Hospital], then the location/street name."
                  },
                  "geometry": {
                      "type": "Point",
                      "coordinates": [ 7.5098633766174325, 5.515524804961825 ]
                  }
              }
           */
          // unstringify the ppa_geodata entry
          // results[index]['ppa_geodata'] = JSON.parse(results[index].ppa_geodata);

          // re-arrange to GeoJSON Format
          results[index].type = "Feature";

          results[index].properties = {};
          results[index].properties.ppa_geodata = JSON.parse(results[index].ppa_geodata);
          results[index].properties.ppa_address = results[index].ppa_address;
          results[index].properties.type_of_ppa = results[index].type_of_ppa;
          results[index].properties.name_of_ppa = results[index].name_of_ppa;

          // shouldn't we add name of PPA and other details as well ?!?!?

          results[index].geometry = {};
          results[index].geometry.type = "Point";
          results[index].geometry.coordinates = [JSON.parse(results[index].ppa_geodata).longitude, JSON.parse(results[index].ppa_geodata).latitude];

          console.log(JSON.parse(results[index].ppa_geodata).latlng, '======++++++++====', JSON.parse(results[index]['ppa_geodata']).longitude, JSON.parse(results[index]['ppa_geodata']).latitude);

          delete results[index]['ppa_geodata'];
          delete results[index]['type_of_ppa'];
          delete results[index]['ppa_address'];

          // delete redundate data like longitude, latitude, and latlng in ppa_geodata after reassigning values
        }
      }

      ppa_details = {};

      if (req.session.statecode) {
        ppa_details.user.statecode = req.session.statecode.toUpperCase();
      }
      if (req.session.servicestate) {
        ppa_details.user.servicestate = req.session.servicestate;
      }
      if (req.session.batch) {
        ppa_details.user.batch = req.session.batch;
      }
      if (req.session.name_of_ppa) {
        ppa_details.user.name_of_ppa = req.session.name_of_ppa;
      }
      ppa_details.theppa = results[0]; // JSON.stringify(results);

      console.log('let\'s see nop that was searched for', ppa_details.theppa);
      // having it named 'pages/account.2' returns error cannot find module '2'
      res.render('pages/search', ppa_details);

    });
  } else if (req.query.rr) { // if it's an accomodation
    // req.query.it=input_time + req.query.sn=item.streetname + req.query.sc=item.statecode
    pool.query("SELECT * FROM accommodations WHERE rentrange = '" + req.query.rr + "' AND input_time = '" + moment(new Date(req.query.it)).format('YYYY-MM-DD HH:mm:ss') + "'", function (error, results, fields) {

      accommodation_details = {};
      accommodation_details.nop = '[]'; // initialize to empty because the frontend is expecting nop to be somthing. // somehow it's an array when it get to the front end, not string!!!!
      res.render('pages/search', accommodation_details);
    })

  } else {
    // SELECT DISTINCT name_of_ppa, type_of_ppa, ppa_address,ppa_geodata FROM info WHERE (name_of_ppa != '' OR null and type_of_ppa != '' OR null and ppa_address != '' OR null and ppa_geodata != '' OR null)

    pool.query("SELECT DISTINCT name_of_ppa, type_of_ppa, ppa_address, ppa_geodata, ppa_directions FROM info WHERE (name_of_ppa != '' OR null and type_of_ppa != '' OR null and ppa_address != '' OR null and ppa_geodata != '' OR null); SELECT * FROM accommodations WHERE expire > UTC_DATE", function (error, results, fields) {

      if (error) { // gracefully handle error e.g. ECONNRESET || ETIMEDOUT || PROTOCOL_CONNECTION_LOST, in this case re-execute the query or connect again, act approprately
        console.log(error);
        throw error;
      }
      console.log('looking for ooo', results)
      _details = {};
      _details.ppas = results[0];
      _details.accommodations = results[1];
      _details.theppa = [];
      _details.nop = undefined; // initialize to empty because the frontend is expecting nop to be somthing. // somehow it's an array when it get to the front end, not string!!!!
      res.render('pages/search', _details);
    })

  }

});

// edited
router.post('/sayhi', /* bodyParser.urlencoded({
  extended: true,
  type: 'application/x-www-form-urlencoded'
}), */ function (req, res) {
    console.log('the message', req.body);
    if (helpers.isEmpty(req.body.message)) {
      // console.log('empty');
      res.status(406).send('Not Acceptable'); //.render('pages/404'); // returns Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client
      // res.render('pages/404');
    } else {
      // console.log('NOT empthy');
      pool.query("INSERT INTO feedbacks ( message ) VALUES (" + pool.escape(req.body.message) + ")", function (error, results, fields) {

        if (error) throw error;

        if (results.affectedRows === 1) {
          res.status(200).send('OK'); //.render('pages/404');
        }
      });

    }
});

// upload.none()
router.post('/contact', /* bodyParser.urlencoded({ // edited
  extended: true,
  type: 'application/x-www-form-urlencoded'
}), */ function (req, res) {
    console.log('the message', req.body);

    pool.query("INSERT INTO feedbacks ( name, subject, email, message ) VALUES (" + pool.escape(req.body.name) + ',' + pool.escape(req.body.subject) + ',' + pool.escape(req.body.email) + ',' + pool.escape(req.body.message) + ")", function (error, results, fields) {

      if (error) throw error;

      if (results.affectedRows === 1) {
        res.status(200).send('OK'); //.render('pages/404');
      }
    });
});

router.get('/posts', function (req, res) {
  // set resposnse type to application/json
  res.setHeader('Content-Type', 'application/json');

  query.GetPosts(req).then(result => {
    res.status(200).send(result);
  }, reject => {
    res.sendStatus(500);
  }).catch(error => {
    res.sendStatus(500);
  })
  // res.status(200).send({ data: ["ghfc ty", "rewfhb iwre", "hblg er ieur\n\nthat apostrophe", "The happening place in Abia is NCCF!", "Well and NACC too. But NCCF would Never die!!!", "dsaf df asd", "5u96y j94938\nfdsig eor\n\ndfsnhgu es9rgre\n\ndsigj90e9re", "gfh r", "gejge rniog eoigrioerge ", "gf er rg erg", "fdg erei sug serugeis gr  \n\n\n\n\nThis", "test df gf byyyyyyyyy mee", "Okay. ", "This is it. And yep.", "I could sing. ... Oh"] });
});

/**the new profile page */
router.get('/profile', function (req, res) {
  fs.readFile('./constants/ngstateslga.json', (err, data) => {
    let jkl = JSON.parse(data);
    // let's hope there's no err


    if (req.session.loggedin) {
      let jn = req.session.statecode.toUpperCase()

      /**an array of all the local government in the state */
      let lgas = jkl.states[ngplaces.states_short.indexOf(jn.slice(0, 2))][ngplaces.states_long[ngplaces.states_short.indexOf(jn.slice(0, 2))]];
      // use the ones from their service state // AND servicestate = '" + req.session.servicestate + "'
      pool.query("SELECT name_of_ppa FROM info WHERE name_of_ppa != '' ; SELECT ppa_address from info WHERE ppa_address != '' AND servicestate = '" + req.session.servicestate + "'; SELECT city_town FROM info WHERE city_town != '' AND servicestate = '" + req.session.servicestate + "'; SELECT region_street FROM info WHERE region_street != '' AND servicestate = '" + req.session.servicestate + "'", function (error2, results2, fields2) {

        if (error2) throw error2;
        // console.log('PPAs', results2);

        res.set('Content-Type', 'text/html');
        // res.sendFile(__dirname + '/new profile/index.html');
        res.render('pages/profile', {
          statecode: req.session.statecode.toUpperCase(),
          servicestate: req.session.servicestate.toUpperCase(),
          batch: req.session.batch,
          names_of_ppas: results2[0], // array of objects ie names_of_ppas[i].name_of_ppa
          ppa_addresses: results2[1],
          cities_towns: results2[2],
          regions_streets: results2[3],
          states: ngplaces.states_long,
          lgas: lgas
          // select all distinct ppa type / address / name and send it to the front end as suggestions for the input when the corpers type
        });
      });
    } else {
      res.render('pages/login');
    }

  })
});

/**handles updating the corper's profile */
router.post('/profile', /* bodyParser.urlencoded({
  extended: true
}), */ function (req, res) {

  query.UpdateProfile({req_body: req.body, session_statecode: req.session.statecode.toUpperCase()})
    // cater for fields we already have, so that we don't touch them eg. servicestate
    // UPDATE 'info' SET 'firstname'=[value-1],'lastname'=[value-2],'accomodation_location'=[value-3],'servicestate'=[value-4],'batch'=[value-5],'name_of_ppa'=[value-6],'statecode'=[value-7],'email'=[value-8],'middlename'=[value-9],'password'=[value-10],'phone'=[value-11],'dateofreg'=[value-12],'lga'=[value-13],'city_town'=[value-14],'region_street'=[value-15],'stream'=[value-16],'type_of_ppa'=[value-17],'ppa_address'=[value-18],'travel_from_state'=[value-19],'travel_from_city'=[value-20],'spaornot'=[value-21] WHERE email = req.body.email
    // UPDATE info SET 'accomodation_location'=req.body.accomodation_location,'servicestate'=req.body.servicestate,'name_of_ppa'=[value-6],'lga'=req.body.lga,'city_town'=req.body.city_town,'region_street'=req.body.region_street,'stream'=req.body.stream,'type_of_ppa'=req.body.type_of_ppa,'ppa_address'=req.body.ppa_address,'travel_from_state'=req.body.travel_from_state,'travel_from_city'=req.body.travel_from_city,'spaornot'=req.body.spaornot WHERE email = req.body.email
    // let sqlquery = "INSERT INTO info(servicestate, lga, city_town, region_street, stream, accomodation_location, type_of_ppa, travel_from_state, travel_from_city) VALUES ('" + req.body.servicestate + "', '" + req.body.lga + "', '" + req.body.city_town + "', '" + req.body.region_street + "', '" + req.body.stream + "', '" + req.body.accomodation_location + "', '" + req.body.type_of_ppa + "', '" + req.body.travel_from_state + "', '" + req.body.travel_from_city + "', '" + req.body.spaornot + "' )";

    // let sqlquery = "UPDATE info SET accomodation_location = '" + req.body.accomodation_location + "', servicestate = '" + req.body.servicestate + "', name_of_ppa = '" + req.body.name_of_ppa + "', lga = '" + req.body.lga + "', city_town = '" + req.body.city_town + "', region_street = '" + req.body.region_street + "',   stream = '" + req.body.stream + "' , type_of_ppa = '" + req.body.type_of_ppa + "', ppa_address = '" + req.body.ppa_address + "', travel_from_state = '" + req.body.travel_from_state + "', travel_from_city = '" + req.body.travel_from_city + "', spaornot = '" + req.body.spaornot + "' WHERE email = '" + req.body.email + "' " ;

    /*[req.body.accomodation_location, req.body.servicestate, req.body.name_of_ppa, req.body.lga, req.body.city_town, req.body.region_street, req.body.stream, req.body.type_of_ppa, req.body.ppa_address, req.body.travel_from_state, req.body.travel_from_city, req.body.spaornot, req.body.email],*/
    console.log('\n\nthe req.body for /profile', req.body, '\n\n', req.body.statecode);
    // console.log('\n\n', req);
    let sqlquery = "UPDATE info SET accommodation_location = '" + (req.body.accommodation_location ? req.body.accommodation_location : '') +
      (req.body.servicestate ? "', servicestate = '" + req.body.servicestate : '') // if there's service state(i.e. corper changed service state in real life and from front end), insert it.
      +
      "', name_of_ppa = '" + req.body.name_of_ppa +
      "', ppa_directions = '" + req.body.ppadirections +
      "', lga = '" + req.body.lga + "', city_town = '" + req.body.city_town + "', region_street = '" +
      req.body.region_street + "',   stream = '" + req.body.stream + "' , type_of_ppa = '" +
      req.body.type_of_ppa + "', ppa_geodata = '" + (req.body.ppa_geodata ? req.body.ppa_geodata : '') + "', ppa_address = '" + req.body.ppa_address + "', travel_from_state = '" +
      req.body.travel_from_state + "', travel_from_city = '" + req.body.travel_from_city +
      (req.body.newstatecode ? "', statecode = '" + req.body.newstatecode.toUpperCase() : '') + // if there's a new statecode ...
      /* "', accommodationornot = '" + (req.body.accommodationornot ? req.body.accommodationornot : 'yes') + */
      "', wantspaornot = '" +
      req.body.wantspaornot + "' WHERE statecode = '" + req.session.statecode.toUpperCase() + "' "; // always change state code to uppercase, that's how it is in the db


    pool.query(sqlquery, function (error, results, fields) {
      console.log('updated user profile data: ', results);
      if (error) throw error;
      // go back to the user's timeline
      if (results.changedRows === 1 && !helpers.isEmpty(req.body)) {
        if (req.body.name_of_ppa) {
          req.session.name_of_ppa = req.body.name_of_ppa;
        }
        /* 
        // todo later...
  
        statecode: req.session.statecode.toUpperCase(),
        servicestate: req.session.servicestate,
        batch: req.session.batch, */

        if (req.body.newstatecode) { // if they are changing statecode to a different state, then their service state in the db should change and their ppa details too should change, tell them to change the ppa details if they don't change it
          // change statecode in other places too
          // this works because rooms only have one instance for every two corpers or statecode, so there's no DD/17B/7778-AB/17B/2334 and AB/17B/2334-DD/17B/7778 only one of it, same reason why there's no LIMIT 1 in the SELECT statement in REPLACE function
          let updatequery = "UPDATE chats SET room = (SELECT REPLACE( ( SELECT DISTINCT room WHERE room LIKE '%" + req.session.statecode.toUpperCase() + "%' ) ,'" + req.session.statecode.toUpperCase() + "','" + req.body.newstatecode.toUpperCase() + "')) ; " +
            " UPDATE chats SET message_from = '" + req.body.newstatecode.toUpperCase() + "' WHERE message_from = '" + req.session.statecode.toUpperCase() + "' ; " +
            " UPDATE chats SET message_to = '" + req.body.newstatecode.toUpperCase() + "' WHERE message_to = '" + req.session.statecode.toUpperCase() + "' ;" +
            " UPDATE posts SET statecode = '" + req.body.newstatecode.toUpperCase() + "' WHERE statecode = '" + req.session.statecode.toUpperCase() + "' ; " +
            " UPDATE accommodations SET statecode = '" + req.body.newstatecode.toUpperCase() + "' WHERE statecode = '" + req.session.statecode.toUpperCase() + "' ";
          pool.query(updatequery, function (error, results, fields) {
            console.log('updated statecode ', results);
            if (error) throw error;
            // connected!
            // at least ONE or ALL of these MUST update, not necessarily all that why we are using || and NOT && because it could be possible they've not chatted or posted anything at all, but they must have at least registered!
            if (results[0].affectedRows > 0 || results[1].affectedRows > 0 || results[2].affectedRows > 0 || results[3].affectedRows > 0 || results[4].affectedRows > 0) {
              // then status code is good
              console.log('we\'re really good with the update')

              // then change the session statecode
              req.session.statecode = req.body.newstatecode.toUpperCase();

              res.status(200).redirect(req.body.newstatecode.toUpperCase()); // if there's new statecode
            } else {
              console.log('we\'re bad with the update') // we should find out what went wrong
              /**
               * 
               * 
               * results looks like:
               * 
               * OkPacket {
                  fieldCount: 0,
                  affectedRows: 1,
                  insertId: 0,
                  serverStatus: 2,
                  warningCount: 1,
                  message: '',
                  protocol41: true,
                  changedRows: 0 
                }
  
                so we'd want to check out message attribute
               */

              // we should redirect to somewhere and not just block the whole system!!!!!!!!!!
            }
          });
          // should we save every change of statecode that ever occured ?
          // SELECT room FROM `chats` WHERE message_from = 'AB/17B/1234' or message_to = 'AB/17B/1234'

          // UPDATE `chats` SET `room`=[value-1],`message_from`=[value-3],`message_to`=[value-4] WHERE message_from = 'AB/17B/1234' or message_to = 'AB/17B/1234'
          //- UPDATE `chats` SET `message_from`=[value-3] WHERE message_from = 'AB/17B/1234'
          //- UPDATE `chats` SET `message_to`=[value-4] WHERE message_to = 'AB/17B/1234'

          // SELECT room from chats WHERE message_from = 'AB/17B/1234' or message_to = 'AB/17B/1234'
          // SELECT `room` FROM `chats` WHERE room LIKE '%AB/17B/1234%'

          // should know when who they are chatting with is online and when they are typing

          // for room change, consider using REPLACE('str', 'str_to_replace', 'replacement_str')
          // for room change, consider using REPLACE(SELECT `room` FROM `chats` WHERE room LIKE '%AB/17B/1234%', 'AB/17B/1234', 'OD/19B/7778')
          //- REPLACE(SELECT `room` FROM `chats` WHERE room LIKE '%AB/17B/1234%', 'AB/17B/1234', 'OD/19B/7778')

          // for room formation, concat('str1', 'str2', ..., 'strN'), or concat_ws('seperator', 'str1', 'str2', ..., 'strN')


        } else { // if no newstatecode
          res.status(200).redirect(req.session.statecode.toUpperCase() /* + '?e=y' */); // [e]dit=[y]es|[n]o
        }
        // res.sendStatus(200);
      } else {
        // res.sendStatus(500);
        res.status(500).redirect('/profile' + '?e=n'); // [e]dit=[y]es|[n]o
      }
    });

});

router.post('/addplace', upload.none(), function (req, res) {
  // handle post request, add data to database.
  console.log('came here /addplace', req.body);
  if (!helpers.isEmpty(req.body)) {

    query.AddPlace(req.body).then(result => {
      res.status(200).send('OK');
    }, reject => {
      res.sendStatus(500);
    }).catch(reason => {
      // we hope we never get here
      res.status(500).send('Internal Server Error')
    })
  } else {
    // send empty response feedback
  }
});

router.post('/posts', /* upload.array('see', 12), */ function (req, res, next) {

  const busboy = new Busboy({
    headers: req.headers,
    limits: { // set fields, fieldSize, and fieldNameSize later (security)
      files: 7, // don't upload more than 7 media files
      fileSize: 6 * 1024 * 1024 // 6MB
    }
  });
  let _media = []; // good, because we re-initialize on new post
  let _text = {};
  let uploadPromise = [];
  let get = true;
  busboy.on('file', function (fieldname, filestream, filename, transferEncoding, mimetype) {

    // there's also 'limit' and 'error' events https://www.codota.com/code/javascript/functions/busboy/Busboy/on
    filestream.on('limit', function () {
      console.log('the file was too large... nope');
      get = false;
      // don't listen to the data event anymore
      /* filestream.off('data', (data) => { // doesn't work
        console.log('should do nothing. what\'s data?', data)
      }) */

      // how should we send a response if one of the files/file is invalid [too big or not an accepted file type]?
    });

    if (filename !== '' && !helpers.acceptedfiles.includes(mimetype)) { // if mimetype it '' or undefined, it passes
      console.log('we don\'t accept non-image files... nope');
      get = false;
      // don't listen to the data event
      /* filestream.off('data', (data) => { // DOESN'T WORK!!!
        console.log('should do nothing. what\'s data?', data)
      }) */
    }

    /* filestream.on('readable', (what) => { // don't do this, unless, MABYE filestream.read() is called in the callback
      console.log('\ncurious what happens here\n', what)
    }) */


    filestream.on('data', function (data) {
      if (!get) {

      }

      console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
    });

    filestream.on('end', function (err) {
      // if we listend for 'file', even if there's no file, we still come here
      // so we're checking if it's empty before doing anything.
      /* console.log('readabe?///// ?', filestream.read()) // filestram.read() is always null ... */

      console.log('File [' + fieldname + '] Finished. Got ' + 'bytes');
      if (err) { console.log('err in busboy file end', err); }
    });


    // this is not a good method

    /**One thing you might be able to try is to read 0 bytes from the stream first and see if you get the appropriate 'end' event or not (perhaps on the next tick) */

    if (filename != '' && helpers.acceptedfiles.includes(mimetype)) { // filename: 1848-1844-1-PB.pdf, encoding: 7bit, mimetype: application/pdf
      /* let obj = {
          filestream: file_stream,
          mimetype: mimetype,
          filename: filename
      }; */
      // let _id = authorize(JSON.parse(cred_content), uploadFile, obj)

      let fileMetadata = {
        'name': filename, // Date.now() + 'test.jpg',
        parents: ['15HYR0_TjEPAjBjo_m9g4aR-afULaAzrt'] // upload to folder CorpersOnline-TEST 15HYR0_TjEPAjBjo_m9g4aR-afULaAzrt
      };
      let media = {
        mimeType: mimetype,
        body: filestream // fs.createReadStream("C:\\Users\\NWACHUKWU\\Pictures\\ad\\IMG-20180511-WA0001.jpg")
      };

      const up = ggle.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id',
      }).then(
        function (file) {

          // maybe send the upload progress to front end with sockets? https://github.com/googleapis/google-api-nodejs-client/blob/7ed5454834b534e2972746b28d0a1e4f332dce47/samples/drive/upload.js#L41

          console.log('upload File Id: ', file.data.id); // save to db
          // console.log('File: ', file);
          _media.push(file.data.id)

        }, function (err) {
          // Handle error
          console.error(err);

        }
      ).catch(function (err) {
        console.log('some other error ??', err)
      }).finally(() => {
        console.log('upload finally')
      });

      uploadPromise.push(up)

    }


    // https://stackoverflow.com/questions/26859563/node-stream-data-from-busboy-to-google-drive
    // https://stackoverflow.com/a/26859673/9259701
    filestream.resume() // must always be last in this callback else server HANGS

  });

  busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, transferEncoding, mimetype) {
    console.log('Field [' + fieldname + ']: value: ' + inspect(val));
    _text[fieldname] = val; // inspect(val); // seems inspect() adds double quote to the value
    console.warn('fielddname Truncated:', fieldnameTruncated, valTruncated, transferEncoding, mimetype);
  });

  // answer this question: https://stackoverflow.com/questions/26859563/node-stream-data-from-busboy-to-google-drive

  busboy.on('finish', async function () {
    console.log('Done parsing form!', _text, _media);
    // res.writeHead(303, { Connection: 'close', Location: '/' });
    // res.end();

    /**
     * if _media is empty & _text is not, just boardcast text,
     * of course _text is NOT EMPTY, it must never be empty
     * 
     * if _media and _text are both not empty, then boardcast accordingly
     */
    if (!helpers.isEmpty(_text) && helpers.isEmpty(uploadPromise)) {
      console.log('what\'s _text?', _text)
      console.log('post_time', _text.post_time)
      query.InsertRowInPostsTable({
        media: (_media.length > 0 ? _media : _text.mapimage ? _text.mapimage : ''),
        statecode: req.session.statecode,
        type: (_text.type ? _text.type : "sale"),
        text: _text.text,
        price: (_text.price ? _text.price : ""),
        location: req.session.location,
        post_time: _text.post_time
      }).then(result => {
        // then status code is good
        res.sendStatus(200);

        // once it saves in db them emit to other users
        socket.of('/user').to(req.session.statecode.substring(0, 2)).emit('boardcast message', {
          to: 'be received by everyoneELSE',
          post: {
            statecode: req.session.statecode,
            location: req.session.location,
            media: false,
            post_time: _text.post_time,
            type: _text.type,
            mapdata: (_text.mapimage ? _text.mapimage : ''),
            text: _text.text,
            age: moment(Number(_text.post_time)).fromNow(),
            price: (_text.price ? _text.price : '')
          }
        });
      }, reject => {
        console.log('rejected?', reject)
        res.sendStatus(500);
      }).catch(reason => {
        console.log('insert row failed', reason);
        // res.sendStatus(500); // Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client // what's setting it first?
      })
    } else if (!helpers.isEmpty(_text) && !helpers.isEmpty(uploadPromise)) {
      await Promise.all(uploadPromise);

      query.InsertRowInPostsTable({
        media: (_media.length > 0 ? _media.toString() : _text.mapimage ? _text.mapimage : ''),
        statecode: req.session.statecode,
        type: (_text.type ? _text.type : "sale"),
        text: _text.text,
        price: (_text.price ? _text.price : ""),
        location: req.session.location,
        post_time: _text.post_time,
      }).then(resolve => {

        // then status code is good
        res.sendStatus(200);

        // once it saves in db them emit to other users
        socket.of('/user').to(req.session.statecode.substring(0, 2)).emit('boardcast message', {
          to: 'be received by everyoneELSE',
          post: {
            statecode: req.session.statecode,
            location: req.session.location,
            media: (_media.length > 0 ? _media : false), // need to change this, just post _media, if it's empty, we'll check in frontend
            post_time: _text.post_time,
            type: _text.type,
            mapdata: (_text.mapimage ? _text.mapimage : ''),
            text: _text.text,
            age: moment(Number(_text.post_time)).fromNow(),
            price: (_text.price ? _text.price : '')
          }
        });
      }, reject => {
        // this is really important for the form to get response
        console.log('why?', reject)
        res.sendStatus(500);
        // === res.status(500).send('Internal Server Error')
      }).catch(reason => {
        // res.sendStatus(500); //  Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client
        console.log('what happened?', reason)
      })
    }
  });

  // handle post request, add data to database... do more

  return req.pipe(busboy)

});


router.post('/accommodations', /* upload.array('roomsmedia', 12), */ function (req, res) {


  const busboy = new Busboy({
    headers: req.headers,
    limits: { // set fields, fieldSize, and fieldNameSize later (security)
      files: 7, // don't upload more than 7 media files
      fileSize: 24 * 1024 * 1024 // 24MB
    }
  });
  let _media = []; // good, because we re-initialize on new post
  let _text = {};
  let uploadPromise = [];
  let get = true;



  busboy.on('file', function (fieldname, filestream, filename, transferEncoding, mimetype) {

    // there's also 'limit' and 'error' events https://www.codota.com/code/javascript/functions/busboy/Busboy/on
    filestream.on('limit', function () {
      console.log('the file was too large... nope');
      get = false;
      // don't listen to the data event anymore
      /* filestream.off('data', (data) => { // doesn't work
        console.log('should do nothing. what\'s data?', data)
      }) */

      // how should we send a response if one of the files/file is invalid [too big or not an accepted file type]?
    });

    if (filename !== '' && !helpers.acceptedfiles.includes(mimetype)) { // if mimetype it '' or undefined, it passes
      console.log('we don\'t accept non-image files... nope');
      get = false;
      // don't listen to the data event
      /* filestream.off('data', (data) => { // DOESN'T WORK!!!
        console.log('should do nothing. what\'s data?', data)
      }) */
    }

    /* filestream.on('readable', (what) => { // don't do this, unless, MABYE filestream.read() is called in the callback
      console.log('\ncurious what happens here\n', what)
    }) */


    filestream.on('data', function (data) {
      if (!get) {

      }

      console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
    });

    filestream.on('end', function (err) {
      // if we listend for 'file', even if there's no file, we still come here
      // so we're checking if it's empty before doing anything.
      /* console.log('readabe?///// ?', filestream.read()) // filestram.read() is always null ... */

      console.log('File [' + fieldname + '] Finished. Got ' + 'bytes');
      if (err) { console.log('err in busboy file end', err); }
    });


    // this is not a good method

    /**One thing you might be able to try is to read 0 bytes from the stream first and see if you get the appropriate 'end' event or not (perhaps on the next tick) */

    if (filename != '' && helpers.acceptedfiles.includes(mimetype)) { // filename: 1848-1844-1-PB.pdf, encoding: 7bit, mimetype: application/pdf
      /* let obj = {
          filestream: file_stream,
          mimetype: mimetype,
          filename: filename
      }; */
      // let _id = authorize(JSON.parse(cred_content), uploadFile, obj)

      let fileMetadata = {
        'name': filename, // Date.now() + 'test.jpg',
        parents: ['15HYR0_TjEPAjBjo_m9g4aR-afULaAzrt'] // upload to folder CorpersOnline-TEST 15HYR0_TjEPAjBjo_m9g4aR-afULaAzrt
      };
      let media = {
        mimeType: mimetype,
        body: filestream // fs.createReadStream("C:\\Users\\NWACHUKWU\\Pictures\\ad\\IMG-20180511-WA0001.jpg")
      };

      const up = ggle.drive.files.create({ // up = [u]pload [p]romise
        resource: fileMetadata,
        media: media,
        fields: 'id',
      }).then(
        function (file) {

          // maybe send the upload progress to front end with sockets? https://github.com/googleapis/google-api-nodejs-client/blob/7ed5454834b534e2972746b28d0a1e4f332dce47/samples/drive/upload.js#L41

          console.log('upload File Id: ', file.data.id); // save to db
          // console.log('File: ', file);
          _media.push(file.data.id)

        }, function (err) {
          // Handle error
          console.error(err);

        }
      ).catch(function (err) {
        console.log('some other error ??', err)
      }).finally(() => {
        console.log('upload finally')
      });

      uploadPromise.push(up)

    }


    // https://stackoverflow.com/questions/26859563/node-stream-data-from-busboy-to-google-drive
    // https://stackoverflow.com/a/26859673/9259701
    filestream.resume() // must always be last in this callback else server HANGS

  });

  busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, transferEncoding, mimetype) {
    console.log('Field [' + fieldname + ']: value: ' + inspect(val));
    _text[fieldname] = val; // inspect(val); // seems inspect() adds double quote to the value
    console.warn('fielddname Truncated:', fieldnameTruncated, valTruncated, transferEncoding, mimetype);
  });

  // answer this question: https://stackoverflow.com/questions/26859563/node-stream-data-from-busboy-to-google-drive

  busboy.on('finish', async function () {
    console.log('Done parsing form!', _text, _media);
    /**should we rename the names of file?
     * rename/change the file name appropriately // Date.now() part of name + get what's in the pic + file extension
     * 
     * value.filename = value.filename.slice(0, value.filename.lastIndexOf('.')) + req.body[value.size] + value.originalname.slice(value.originalname.lastIndexOf('.'));
     */

    /**
     * if _media is empty & _text is not, just boardcast text,
     * of course _text is NOT EMPTY, it must never be empty
     * 
     * if _media and _text are both not empty, then boardcast accordingly
     */
    if (!helpers.isEmpty(_text) && helpers.isEmpty(uploadPromise)) {
      console.log('what\'s _text?', _text)
      console.log('post_time', _text.post_time)
      query.InsertRowInAccommodationsTable({
        statecode: req.session.statecode,
        streetname: req.body.streetname,
        type: req.body.accommodationtype,
        price: req.body.price,
        media: [].toString(), // same as '' but for consitenc sake
        rentrange: req.body.rentrange,
        rooms: req.body.rooms,
        address: req.body.address,
        directions: req.body.directions,
        tenure: req.body.tenure,
        expire: (req.body.expiredate ? req.body.expiredate : ''),
        post_location: req.session.location,
        post_time: req.body.post_time,
        acc_geodata: (req.body.acc_geodata ? req.body.acc_geodata : '')
      }).then(resolve => {
        // then status code is good
        res.sendStatus(200);
  
        // console.log('me before you', moment(Number(req.body.post_time)).fromNow(), req.body.post_time);
  
        // once it saves in db them emit to other users
        socket.of('/user').emit('boardcast message', { // or 'accommodation'
          to: 'be received by everyoneELSE',
          post: {
            statecode: req.session.statecode,
            streetname: req.body.streetname,
            rentrange: req.body.rentrange,
            rooms: req.body.rooms,
            tenure: req.body.tenure,
            expiredate: (req.body.expiredate ? req.body.expiredate : ''),
            post_location: req.session.location,
            media: [], // make an empty array 
            post_time: new Date().toLocaleString(), // not sure we need and make use of post time
            type: req.body.accommodationtype,
            address: req.body.address,
            directions: req.body.directions,
            age: moment(Date.now()).fromNow(),
            price: req.body.price
          }
        });
      }, reject => {
        res.sendStatus(500);
      }).catch((reason) => {
        console.log('what happened?', reason)
      })

    } else if (!helpers.isEmpty(_text) && !helpers.isEmpty(uploadPromise)) {
      await Promise.all(uploadPromise);


      query.InsertRowInAccommodationsTable({
        statecode: req.session.statecode,
        streetname: _text.streetname,
        type: _text.accommodationtype,
        price: _text.price,
        media: _media.toString(), // .toString() only on the query
        rentrange: _text.rentrange,
        rooms: _text.rooms,
        address: _text.address,
        directions: _text.directions,
        tenure: _text.tenure,
        expire: (_text.expiredate ? _text.expiredate : ''),
        post_location: req.session.location,
        post_time: _text.post_time,
        acc_geodata: (_text.acc_geodata ? _text.acc_geodata : '')
      }).then(result => {
        res.sendStatus(200);

        console.log('me before you', moment(Number(_text.post_time)).fromNow(), _text.post_time);
        console.log('price', _text.price);

        // once it saves in db them emit to other users
        socket.of('/user').emit('boardcast message', { // or 'accommodation'
          to: 'be received by everyoneELSE',
          post: {
            statecode: req.session.statecode,
            streetname: _text.streetname,
            rentrange: _text.rentrange,
            rooms: _text.rooms,
            tenure: _text.tenure,
            expiredate: (_text.expiredate ? _text.expiredate : ''),
            post_location: req.session.location,
            media: _media,
            post_time: new Date().toLocaleString(), // not sure we need and make use of post time
            type: _text.accommodationtype,
            address: _text.address,
            directions: _text.directions,
            age: moment(Date.now()).fromNow(),
            price: _text.price
          }
        });
      }, reject => {
        console.log('insert row didn\'t work', reject);
        res.sendStatus(500);
      }).catch(reason => {
        console.log('insert row failed', reason);
      })

    }
  });

  // handle post request, add data to database... do more

  return req.pipe(busboy)


  // if there are images in the post user boardcasted
  if (req.files.length > 0) {
    // save the files in an array
    let arraymedia = [];

    /* let l = req.files.length;
    req.files.forEach(function (item, index, array) {
      console.log('item:\n', item,'index:\n', index);
    }); */

    // insert and work with the media
    Object.entries(req.files).forEach(
      ([key, value]) => {
        // console.log('key:', key, 'value:', value);

        // rename/change the file name appropriately // Date.now() part of name + get what's in the pic + file extension
        value.filename = value.filename.slice(0, value.filename.lastIndexOf('.')) + req.body[value.size] + value.originalname.slice(value.originalname.lastIndexOf('.'));

        /** When using the "single"
         data come in "req.file" regardless of the attribute "name". 
        **/
        let tmp_path = value.path;

        /** The original name of the uploaded file
            stored in the variable "originalname".
        **/
        // let target_path = 'img/' + value.originalname;
        let target_path = 'img/' + value.filename;

        /** A better way to copy the uploaded file. **/
        let src = fs.createReadStream(tmp_path);
        let dest = fs.createWriteStream(target_path);
        src.pipe(dest);

        src.on('end', function () {
          // res.render('complete');
          console.log('complete, pushing', value.originalname, value.filename);

          arraymedia.push(value.filename); // returns a number!

          // when we're done, insert in db and emit to other users

          console.log('COMPARING key and req.files.length', key + 1, req.files.length, ((parseInt(key) + 1) === req.files.length)); // key is a number with string data type,
          if (((parseInt(key) + 1) === req.files.length)) {
            console.log('media array null ?', arraymedia);

            query.InsertRowInAccommodationsTable({
              statecode: req.session.statecode,
              streetname: req.body.streetname,
              type: req.body.accommodationtype,
              price: req.body.price,
              media: arraymedia,
              rentrange: req.body.rentrange,
              rooms: req.body.rooms,
              address: req.body.address,
              directions: req.body.directions,
              tenure: req.body.tenure,
              expire: (req.body.expiredate ? req.body.expiredate : ''),
              post_location: req.session.location,
              post_time: req.body.post_time,
              acc_geodata: (req.body.acc_geodata ? req.body.acc_geodata : '')
            }).then(result => {
              res.sendStatus(200);

              console.log('me before you', moment(Number(req.body.post_time)).fromNow(), req.body.post_time);
              console.log('price', req.body.price);

              // once it saves in db them emit to other users
              socket.of('/user').emit('boardcast message', { // or 'accommodation'
                to: 'be received by everyoneELSE',
                post: {
                  statecode: req.session.statecode,
                  streetname: req.body.streetname,
                  rentrange: req.body.rentrange,
                  rooms: req.body.rooms,
                  tenure: req.body.tenure,
                  expiredate: (req.body.expiredate ? req.body.expiredate : ''),
                  post_location: req.session.location,
                  media: arraymedia,
                  post_time: new Date().toLocaleString(), // not sure we need and make use of post time
                  type: req.body.accommodationtype,
                  address: req.body.address,
                  directions: req.body.directions,
                  age: moment(Date.now()).fromNow(),
                  price: req.body.price
                }
              });
            }, reject => {
              res.sendStatus(500);
            }).catch(reason => {
              console.log('insert row failed', reason);
            })


          }


        });
        src.on('error', function (err) {
          console.log('error: ', err);
        });

        dest.on('close', function () {
          console.log('dooneeeee\n');
        })

      }
    );

  } else {

    query.InsertRowInAccommodationsTable({
      statecode: req.session.statecode,
      streetname: req.body.streetname,
      type: req.body.accommodationtype,
      price: req.body.price,
      media: '',
      rentrange: req.body.rentrange,
      rooms: req.body.rooms,
      address: req.body.address,
      directions: req.body.directions,
      tenure: req.body.tenure,
      expire: (req.body.expiredate ? req.body.expiredate : ''),
      post_location: req.session.location,
      post_time: req.body.post_time,
      acc_geodata: (req.body.acc_geodata ? req.body.acc_geodata : '')
    }).then(resolve => {
      // then status code is good
      res.sendStatus(200);

      console.log('me before you', moment(Number(req.body.post_time)).fromNow(), req.body.post_time);


      // once it saves in db them emit to other users
      socket.of('/user').emit('boardcast message', { // or 'accommodation'
        to: 'be received by everyoneELSE',
        post: {
          statecode: req.session.statecode,
          streetname: req.body.streetname,
          rentrange: req.body.rentrange,
          rooms: req.body.rooms,
          tenure: req.body.tenure,
          expiredate: (req.body.expiredate ? req.body.expiredate : ''),
          post_location: req.session.location,
          media: [], // make an empty array or sth else ...just make it empty
          post_time: new Date().toLocaleString(), // not sure we need and make use of post time
          type: req.body.accommodationtype,
          address: req.body.address,
          directions: req.body.directions,
          age: moment(Date.now()).fromNow(),
          price: req.body.price
        }
      });
    }, reject => {
      res.sendStatus(500);
    }).catch((reason) => {
      res.sendStatus(500);
    })


  }
  // ----------------------------------------------- delete this later. not yet, until we so if else for when there are no files.
  /* pool.query("INSERT INTO accommodations( statecode, streetname, type, price, media, rentrange, rooms, address, tenure, expire) VALUES ('" +
    req.session.statecode + "', '" + req.body.streetname + "', '" + req.body.accommodationtype + "', '" + req.body.price + "', '" +
    arraymedia + "', '" + req.body.rentrange + "', '" + req.body.rooms + "','" + req.body.address + "','" + req.body.tenure + "','" + (req.body.expiredate ? req.body.expiredate : '') +
    "')", function (error, results, fields) {
 
    if (error) {
      res.sendStatus(404); // handle here effectively, the server should not crash for whatsoever reason!. HANDLE ALL ERROR EFFECTIVELY! We tryna run a business
      throw error;
    }
 
    if (results.affectedRows === 1) {
      console.info('saved post to db successfully');
      res.sendStatus(200);
      // socket.of('/user').emit('boardcast message', { to: 'be received by everyoneELSE', post: data });
    }
  }); */


})

module.exports = router;