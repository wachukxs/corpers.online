const express = require('express');
const Busboy = require('busboy');
const multer = require('multer');
inspect = require('util').inspect;
const jwt = require('jsonwebtoken')
const auth = require('../helpers/auth')
const helpers = require('../utilities/helpers')
const socket = require('../sockets/routes')
const ngstates = require('../utilities/ngstates')
const moment = require('moment');
const query = require('../utilities/queries');
const fs = require('fs');
const ggle = require('../helpers/uploadgdrive');
const db = require('../models');
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
    if (err) {
      res.status(500).json(null)
    } else {
      let jkl = JSON.parse(data);
      // let's hope there's no err
      res.status(200).send(jkl);
    }
  })
});

router.get('/allppas', function (req, res) {
  res.set('Content-Type', 'application/json');
  query.AllPPAs().then(result => {
    res.send(result);
  }, reject => {
    res.status(500).json(null);
  }).catch(error => {
    res.status(500).json(null);
  })

});

router.get('/oldsearch', auth.checkJWT, function (req, res) {
  // maybe make use of [req.originalUrl .baseUrl .path] later. req.params too

  // "/search?type=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address + "&top=" + item.type_of_ppa; // nop type pa

  // "/search?type=" + item.group + "&it=" + item.input_time + "&sn=" + item.address + "&sc=" + item.state_code; // sn sc it
  res.set('Content-Type', 'text/html');
  // res.sendFile(__dirname + '/search and places/index.html');
  
  if (req.query.search) { // use this logic in DistinctNotNullDataFromPPAs()
    console.log('keyword searched:', req.query.search.query); // find every thing that is req.query.search.query
  }
  
  query.DistinctNotNullDataFromPPAs(req).then(result => {
    result.current_year = new Date().getFullYear()
    result.corper = null
    if (req.session.corper) {
      result.corper = req.session.corper
    }
    res.render('pages/search', result)
  }, reject => {
    console.info(reject)
    res.status(500).json(null);
  }).catch(error => {
    console.error('/search', error)
    res.status(500).json(null);
  })

});

// obselete ... (for now?)
router.get('/old-items', function (req, res) {
  // maybe make use of [req.originalUrl .baseUrl .path] later. req.params too

  // "/search?type=" + item.group + "&nop=" + item.name_of_ppa + "&pa=" + item.ppa_address + "&top=" + item.type_of_ppa; // nop type pa

  // "/search?type=" + item.group + "&it=" + item.input_time + "&sn=" + item.address + "&sc=" + item.state_code; // sn sc it
  res.set('Content-Type', 'text/html');
  // res.sendFile(__dirname + '/search and places/index.html');

  console.log('req.query:', req.query); // find every thing that is req.query.search.query
  // req.query: { search: { query: 'ibadan' } }

  // if we know where the ppa is, get the geo data and show it on the map
  // if we don't know where the ppa is, ask the corper to show us on the map, we can even do this from the front end
  if (req.query.nop) {
    query.SearchNOPs(req).then(data => { // ---- we don't use here, refactor codebase
      result = {
        data: data,
        current_year: new Date().getFullYear()
      }
      res.render('pages/search', result); // having it named 'pages/account.2' returns error cannot find module '2'
    }, error => {
      res.status(502).render('pages/search');
    }).catch((err) => { // we should have this .catch on every query
      console.error('our system should\'ve crashed:', err)
      res.status(502).render('pages/search') // we should tell you an error occured
    })
  } 
  // if it's an accomodation 
  else if (req.query.rr) {// ---- we don't use here, refactor codebase
    query.SearchAcc(req).then(data => {
      result = {
        data: data,
        current_year: new Date().getFullYear()
      }
      res.render('pages/search', result);
    }, error => {
      result = {
        current_year: new Date().getFullYear(),
        data: {
          sales: []
        }
      }
      res.render('pages/search', result);
    }).catch((err) => { // we should have this .catch on every query
      console.error('our system should\'ve crashed:', err)
      res.status(502).render('pages/search') // we should tell you an error occured
    })
    
  } else if(req.query.pt) {
    query.GetAllSalesAndOneSale(req.query).then(data => { // we use here for /items
      result = {
        data: data,
        current_year: new Date().getFullYear()
      }
      res.render('pages/search', result);
    }, error => {
      res.status(500).render('pages/search');
    }).catch((err) => { // we should have this .catch on every query
      console.error('our system should\'ve crashed:', err)
      res.status(502).render('pages/search') // we should tell you an error occured
    })
  } else { // we only use here
    query.GetSales().then(sales => {
      result = {
        data: sales,
        current_year: new Date().getFullYear()
      }
      res.render('pages/search', result);
    }, error => {
      res.render('pages/search');
    }).catch((err) => { // we should have this .catch on every query
      console.error('our system should\'ve crashed:', err)
      res.status(502).render('pages/search') // we should tell you an error occured
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
      res.status(406).json(null);
    } else {
      pool.query("INSERT INTO feedbacks ( message ) VALUES (" + pool.escape(req.body.message) + ")", function (error, results, fields) {
        if (error) throw error;
        else if (results.affectedRows === 1) {
          res.status(200).json(null);
        }
      });

    }
});


router.post('/contact', function (req, res) {
    const busboy = Busboy({
      headers: req.headers,
    });
    let _feedback_data = {}

    busboy.on('field', function (fieldname, val, info) {
      console.log('Field [' + fieldname + ']: value: ' + inspect(val));
      
      _feedback_data[fieldname] = val; // inspect(val); // seems inspect() adds double quote to the value
      
    });


    busboy.on('close', async function () {
      query.GiveFeedback(_feedback_data).then(result => {
        res.status(200).json(null);
      }, reject => {
        res.status(500).json(null);
      }).catch(error => {
        res.status(500).json(null);
      })

     })
  
    return req.pipe(busboy)

    
    /* pool.query("INSERT INTO feedback ( name, subject, email, message ) VALUES (" + pool.escape(req.body.name) + ',' + pool.escape(req.body.subject) + ',' + pool.escape(req.body.email) + ',' + pool.escape(req.body.message) + ")", function (error, results, fields) {

      if (error) throw error;

      if (results.affectedRows === 1) {
        res.status(200).json(null);
      }
    }); */
});

router.get('/oldposts', auth.verifyJWT, function (req, res) {
  // set resposnse type to application/json
  res.setHeader('Content-Type', 'application/json');
  query.GetPosts(req).then(result => {
    res.status(200).send(result);
  }, reject => {
    res.status(500).json(null);
  }).catch(error => {
    res.status(500).json(null);
  })
  // res.status(200).send({ data: ["ghfc ty", "rewfhb iwre", "hblg er ieur\n\nthat apostrophe", "The happening place in Abia is NCCF!", "Well and NACC too. But NCCF would Never die!!!", "dsaf df asd", "5u96y j94938\nfdsig eor\n\ndfsnhgu es9rgre\n\ndsigj90e9re", "gfh r", "gejge rniog eoigrioerge ", "gf er rg erg", "fdg erei sug serugeis gr  \n\n\n\n\nThis", "test df gf byyyyyyyyy mee", "Okay. ", "This is it. And yep.", "I could sing. ... Oh"] });
});

/**the new profile page */
router.get('/oldprofile', auth.verifyJWT, function (req, res) {
  fs.readFile('./utilities/ngstateslga.json', (err, data) => {
    let jkl = JSON.parse(data);
    // let's hope there's no err

      let jn = req.session.corper.state_code.toUpperCase()

      /**an array of all the local government in the state */
      let lgas = jkl.states[ngstates.states_short.indexOf(jn.slice(0, 2))][ngstates.states_long[ngstates.states_short.indexOf(jn.slice(0, 2))]];
      res.set('Content-Type', 'text/html');
      let info = {}
      query.GetPlacesByTypeInOurDB(req).then(data => {
        info = {
          // state_code: req.session.corper.state_code.toUpperCase(),
          // service_state: req.session.corper.service_state.toUpperCase(),
          // batch: req.session.corper.batch,
          names_of_ppas: data.names_of_ppas, // array of objects ie names_of_ppas[i].name_of_ppa
          ppa_addresses: data.ppa_addresses,
          cities_towns: data.cities_towns,
          regions_streets: data.regions_streets,
          states: ngstates.states_long,
          lgas: lgas,
          current_year: new Date().getFullYear(),
          // picture_id: req.session.corper.picture_id,
          ...req.session.corper
          // select all distinct ppa type / address / name and send it to the front end as suggestions for the input when the corpers type
        }
        // console.log('data going to /profile page', info);
        return info
      }, reject => {
        
        throw reject
      }).then(_info => {
        query.GetCorperPosts(req.session.corper.state_code.toUpperCase())
          .then(val => { // val is an array of two arrays. each of these array contain objects of posts and accomodations
            console.log(' testing', val);
            _info.sales_posts = val[0] // array of objects
            _info.accommodation_posts = val[1] // array of objects
            res.render('pages/profile', _info);
          }, err => {
            console.error('testing ===', err)
          })
      }, err => {
        throw err
      }).catch((err) => { // we should have this .catch on every query
        console.error('our system should\'ve crashed:', err)
        info = {
          // state_code: req.session.corper.state_code.toUpperCase(),
          // service_state: req.session.corper.service_state.toUpperCase(),
          // batch: req.session.corper.batch,
          states: ngstates.states_long,
          lgas: lgas,
          current_year: new Date().getFullYear(),
          // ...(req.session.corper.picture_id) && {picture_id: req.session.corper.picture_id},
          ...req.session.corper
        }
        info.sales_posts = [] // array of objects
        info.accommodation_posts = [] // array of objects
        res.status(502).render('pages/profile', info) // we should tell you an error occured
      })

  })
});

/**
 * handles updating the corper's profile 
 * 
 * when they change their state_code, it should redirect to their new state_code
 * 
 * */
router.post('/oldprofile', auth.verifyJWT, /* bodyParser.urlencoded({
  extended: true
}), */ function (req, res) {
  const busboy = Busboy({
    headers: req.headers,
    limits: { // set fields, fieldSize, and fieldNameSize later (security)
      files: 12, // don't upload more than 12 media files
      fileSize: 24 * 1024 * 1024 // 24MB
    }
  });

  _profile_data = {
    state_code: req.session.corper.state_code
  };

  busboy.on('file', function (fieldname, filestream, filename, transferEncoding, mimetype) {

    // there's also 'limit' and 'error' events https://www.codota.com/code/javascript/functions/busboy/Busboy/on
    filestream.on('limit', function () {
      console.log('the file was too large... nope');
      
      // don't listen to the data event anymore
      /* filestream.off('data', (data) => { // doesn't work
        console.log('should do nothing. what\'s data?', data)
      }) */

      // how should we send a response if one of the files/file is invalid [too big or not an accepted file type]?
    });

    if (filename !== '' && !helpers.acceptedfiles.includes(mimetype)) { // if mimetype it '' or undefined, it passes
      console.log('we don\'t accept non-image files... nope');
      
      // don't listen to the data event
      /* filestream.off('data', (data) => { // DOESN'T WORK!!!
        console.log('should do nothing. what\'s data?', data)
      }) */
    }

    /* filestream.on('readable', (what) => { // don't do this, unless, MABYE filestream.read() is called in the callback
      console.log('\ncurious what happens here\n', what)
    }) */

    filestream.on('data', function (data) {
      // console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
    });

    filestream.on('end', function (err) {
      // if we listend for 'file', even if there's no file, we still come here
      // so we're checking if it's empty before doing anything.
      /* console.log('readabe?///// ?', filestream.read()) // filestram.read() is always null ... */

      console.log('File [' + fieldname + '] Finished. Got ' + 'bytes');
      if (err) { console.error('err in busboy file end', err); }
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
        parents: [process.env.CO_PPICS_GDRIVE]
      };
      let media = {
        mimeType: mimetype,
        body: filestream
      };

      const up = ggle.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id, thumbnailLink',
      }).then(
        function (file) {

          // maybe send the upload progress to front end with sockets? https://github.com/googleapis/google-api-nodejs-client/blob/7ed5454834b534e2972746b28d0a1e4f332dce47/samples/drive/upload.js#L41

          // console.log('upload File Id: ', file.data.id); // save to db
          // console.log('thumbnailLink: ', file.data.thumbnailLink);
          req.session.corper.picture_id = file.data.id // or we could add picture_id to _profile_data

          db.sequelize.query('UPDATE info SET picture_id = ? WHERE state_code = ?', [file.data.id, req.session.corper.state_code.toUpperCase()], function (error, results, fields) {
            if (error) throw error;
            else {
              console.log('updated pic')
            }
          });

        }, function (err) {
          // Handle error
          console.error(err);
        }
      ).catch(function (err) {
        console.error('some other error ??', err)
      }).finally(() => {
        // console.log('upload finally block')
      });
    }

    // https://stackoverflow.com/questions/26859563/node-stream-data-from-busboy-to-google-drive
    // https://stackoverflow.com/a/26859673/9259701
    filestream.resume() // must always be last in this callback else server HANGS

  });

  busboy.on('field', function (fieldname, val, info) {
    // console.log('Field [' + fieldname + ']: value: ' + inspect(val));
    
    _profile_data[fieldname] = val; // inspect(val); // seems inspect() adds double quote to the value
    
    console.warn('busboy fieldw info', info);
  });

  busboy.on('close', async function () {
    // console.log('we done?')
    query.UpdateProfile(_profile_data).then(result => { // result is the state_code
      
      // update req.session
      for (var key in _profile_data) {
        req.session.corper[key] = _profile_data[key]
      }
      
      if (_profile_data.newstatecode) {
        req.session.corper.state_code = _profile_data.newstatecode.toUpperCase();
      }
      // console.log('new pic id?', req.session.corper.picture_id);
      res.status(200).redirect(result); // redirect to their [new?]state_code
    }, reject => {
      console.error('what happened?', reject)
      res.status(500).redirect('/profile?e=n'); // [e]dit=[y]es|[n]o
    }).catch((err) => { // we should have this .catch on every query
      console.error('our system should\'ve crashed:', err)
      res.status(502).render('pages/profile?e=n') // we should tell you an error occured
    })
   })

  return req.pipe(busboy)
});

router.post('/oldupdateaccommodation', auth.verifyJWT, function (req, res) {
  const busboy = Busboy({
    headers: req.headers,
    limits: { // set fields, fieldSize, and fieldNameSize later (security)
      files: 12, // don't upload more than 12 media files
      fileSize: 24 * 1024 * 1024 // 24MB
    }
  });

  _accommodation_data = {}
  _accommodation_data.rooms = []; // hot fix
  busboy.on('field', function (fieldname, val, info) {
    // console.log('Field [' + fieldname + ']: value: ' + inspect(val));
    
    if (fieldname === 'rooms') {
      _accommodation_data[fieldname].push(val)
    } else {
      _accommodation_data[fieldname] = val; // inspect(val); // seems inspect() adds double quote to the value
    }
  });

  busboy.on('close', async function () {
    // console.log('we done?')
    query.UpdateAccommodation(_accommodation_data)
    
    .then(result => {
      
      console.log('updated accommodation', result);
      res.status(200).json(null);
    }, reject => {
      console.error('update acc reject what happened?', reject)
      res.status(500).json(null);
    }).catch((err) => { // we should have this .catch on every query
      console.error('update acc, our system should\'ve crashed:', err)
      res.status(502).json(null) // we should tell you an error occured
    })
   })

  return req.pipe(busboy)
})

router.post('/oldupdatesale', auth.verifyJWT, function (req, res) {
  const busboy = Busboy({
    headers: req.headers,
    limits: { // set fields, fieldSize, and fieldNameSize later (security)
      files: 12, // don't upload more than 12 media files
      fileSize: 24 * 1024 * 1024 // 24MB
    }
  });

  _sale_data = {}
  busboy.on('field', function (fieldname, val, info) {
    // console.log('Field [' + fieldname + ']: value: ' + inspect(val));
    
    _sale_data[fieldname] = val; // inspect(val); // seems inspect() adds double quote to the value
    
  });

  busboy.on('close', async function () {
    // console.log('we done?')
    query.UpdateSale(_sale_data).then(result => {
      res.status(200).json(null);
    }, reject => {
      console.error('update sale what happened?', reject)
      res.status(500).json(null); // [e]dit=[y]es|[n]o
    }).catch((err) => { // we should have this .catch on every query
      console.error('our system should\'ve crashed:', err)
      res.status(502).json(null) // we should tell you an error occured
    })
   })

  return req.pipe(busboy)
})

router.post('/olddeleteaccommodation', auth.verifyJWT, function (req, res) {
  const busboy = Busboy({
    headers: req.headers,
    limits: { // set fields, fieldSize, and fieldNameSize later (security)
      files: 12, // don't upload more than 12 media files
      fileSize: 24 * 1024 * 1024 // 24MB
    }
  });

  _accommodation_data = {}
  busboy.on('field', function (fieldname, val, info) {
    // console.log('Field [' + fieldname + ']: value: ' + inspect(val));
    
    _accommodation_data[fieldname] = val; // inspect(val); // seems inspect() adds double quote to the value
    
  });

  busboy.on('close', async function () {
    // console.log('we done?')
    query.DeleteAccommodation([_accommodation_data.post_time, req.session.corper.state_code.toUpperCase()]).then(result => {
      res.status(200).json(null);
    }, reject => {
      console.error('delete acc what happened?', reject)
      res.status(500).json(null); // [e]dit=[y]es|[n]o
    }).catch((err) => { // we should have this .catch on every query
      console.error('our system should\'ve crashed:', err)
      res.status(502).json(null) // we should tell you an error occured
    })
   })

  return req.pipe(busboy)
})

/* 
router.post('/deletesale', auth.verifyJWT, function (req, res) {
  const busboy = Busboy({
    headers: req.headers,
    limits: { // set fields, fieldSize, and fieldNameSize later (security)
      files: 12, // don't upload more than 12 media files
      fileSize: 24 * 1024 * 1024 // 24MB
    }
  });

  _sale_data = {}
  busboy.on('field', function (fieldname, val, info) {
    // console.log('Field [' + fieldname + ']: value: ' + inspect(val));
    
    _sale_data[fieldname] = val; // inspect(val); // seems inspect() adds double quote to the value
    
  });

  busboy.on('close', async function () {
    // console.log('we done?')
    query.DeleteSale([_sale_data.post_time, req.session.corper.state_code.toUpperCase()]).then(result => {
      res.status(200).json(null);
    }, reject => {
      console.error('delete sale what happened?', reject)
      res.status(500).json(null); // [e]dit=[y]es|[n]o
    }).catch((err) => { // we should have this .catch on every query
      console.error('our system should\'ve crashed:', err)
      res.status(502).json(null) // we should tell you an error occured
    })
   })

  return req.pipe(busboy)
})
 */

router.post('/addplace', upload.none(), function (req, res) {
  // handle post request, add data to database.
  console.log('came here /addplace', req.body);
  if (!helpers.isEmpty(req.body)) {
    query.AddPlace(req.body).then(result => {
      res.status(200).send('OK');
    }, reject => {
      res.status(500).json(null);
    }).catch(reason => {
      // we hope we never get here
      res.status(500).json(null)
    })
  } else {
    // send empty response feedback
  }
});


router.post('/oldaccommodations', auth.verifyJWT, /* upload.array('roomsmedia', 12), */ function (req, res) {

  const busboy = Busboy({
    headers: req.headers,
    limits: { // set fields, fieldSize, and fieldNameSize later (security)
      files: 12, // don't upload more than 12 media files
      fileSize: 50 * 1024 * 1024 // 50 MB
    }
  });
  let _media = []; // good, because we re-initialize on new post
  let _text = {};
  _text.rooms = []; // hot fix
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
      if (!get) { // ?? why?

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


    // this is not a very very good method

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
        parents: [process.env.CO_TEST_GDRIVE]
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

          // maybe send the upload progress to front end with sockets? https://github.com/googleapis/google-api-nodejs-client/blob/7ed5454834b534e2972746b28d0a1e4f332dce47/samples/drive/upload.js#L41

          console.log('upload File Id: ', file.data.id); // save to db
          // console.log('File: ', file);
          _media.push(file.data.id)

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


    // https://stackoverflow.com/questions/26859563/node-stream-data-from-busboy-to-google-drive
    // https://stackoverflow.com/a/26859673/9259701
    filestream.resume() // must always be last in this callback else server HANGS

  });

  busboy.on('field', function (fieldname, val, info) {
    console.log('Field [' + fieldname + ']: value: ' + inspect(val));
    // this if block is an hot fix
    if (val && val !== 'null') {
      if (fieldname === 'rooms') {
        // do we need to save rooms differently??
        _text[fieldname].push(val)
      } else {
        _text[fieldname] = val; // inspect(val); // seems inspect() adds double quote to the value
      }
    }
    
    console.warn('field info:', info);
  });

  // answer this question: https://stackoverflow.com/questions/26859563/node-stream-data-from-busboy-to-google-drive

  busboy.on('close', async function () {
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
      let acc_data = { // why are we boardcasting req ?
        state_code: req.session.corper.state_code,
        // streetname: _text.streetname,
        type: _text.accommodationtype,
        price: _text.price,
        media: [].toString(), // same as '' but for consistency sake
        rentrange: _text.rentrange,
        rooms: _text.rooms.toString(), // hot fix
        address: _text.address,
        directions: _text.directions,
        tenure: _text.tenure,
        expire: (_text.expiredate ? _text.expiredate : ''),
        post_location: req.session.corper.location,
        post_time: _text.post_time,
        acc_geodata: (_text.acc_geodata ? _text.acc_geodata : ''),
        roommate_you: (_text.roommate_you ? _text.roommate_you : ''),
        roommate_type: (_text.roommate_type ? _text.roommate_type : '')
      }
      query.InsertRowInAccommodationsTable(acc_data).then(resolve => {
        // then status code is good
        res.status(200).json(null);
  
        // console.log('me before you', moment(Number(_text.post_time)).fromNow(), _text.post_time);
  
        // once it saves in db them emit to other users
        socket.of('/user').emit('boardcast message', { // or 'accommodation'
          to: 'be received by everyoneELSE',
          post: {
            first_name: _text.first_name,
            state_code: req.session.corper.state_code,
            // streetname: _text.streetname,
            rentrange: _text.rentrange,
            rooms: _text.rooms,
            tenure: _text.tenure,
            expiredate: (_text.expiredate ? _text.expiredate : ''),
            post_location: req.session.corper.location,
            media: [], // make an empty array because there were no media posted
            post_time: _text.post_time,
            type: _text.accommodationtype,
            address: _text.address,
            directions: _text.directions,
            age: moment(Date.now()).fromNow(), // is this correct?
            price: _text.price,
            picture_id: req.session.corper.picture_id,
            roommate_you: (_text.roommate_you ? _text.roommate_you : ''),
            roommate_type: (_text.roommate_type ? _text.roommate_type : '')
          }
        });
      }, reject => {
        res.status(500).json(null);
      }).catch((reason) => {
        console.error('what happened?', reason)
        res.status(500).json(null)
      })

    } else if (!helpers.isEmpty(_text) && !helpers.isEmpty(uploadPromise)) {
      await Promise.all(uploadPromise);

      query.InsertRowInAccommodationsTable({
        state_code: req.session.corper.state_code,
        streetname: _text.streetname,
        type: _text.accommodationtype,
        price: _text.price,
        media: _media.toString(), // .toString() only on the query
        rentrange: _text.rentrange,
        rooms: _text.rooms.toString(),
        address: _text.address,
        directions: _text.directions,
        tenure: _text.tenure,
        expire: (_text.expiredate ? _text.expiredate : ''),
        post_location: req.session.corper.location,
        post_time: _text.post_time,
        acc_geodata: (_text.acc_geodata ? _text.acc_geodata : ''),
        roommate_you: (_text.roommate_you ? _text.roommate_you : ''),
        roommate_type: (_text.roommate_type ? _text.roommate_type : '')
      }).then(result => {
        res.status(200).json(null);

        console.log('me before you', moment(Number(_text.post_time)).fromNow(), _text.post_time);
        console.log('price', _text.price);

        // once it saves in db them emit to other users
        socket.of('/user').emit('boardcast message', { // or 'accommodation'
          to: 'be received by everyoneELSE',
          post: {
            first_name: _text.first_name,
            state_code: req.session.corper.state_code,
            streetname: _text.streetname,
            rentrange: _text.rentrange,
            rooms: _text.rooms,
            tenure: _text.tenure,
            expiredate: (_text.expiredate ? _text.expiredate : ''),
            post_location: req.session.corper.location,
            media: _media,
            post_time: _text.post_time,
            type: _text.accommodationtype,
            address: _text.address,
            directions: _text.directions,
            age: moment(Number(_text.post_time)).fromNow(),
            price: _text.price,
            picture_id: req.session.corper.picture_id,
            roommate_you: (_text.roommate_you ? _text.roommate_you : ''),
            roommate_type: (_text.roommate_type ? _text.roommate_type : '')
          }
        });
      }, reject => { // give proper feedback based on error
        console.log('insert row didn\'t work', reject);
        res.status(500).json(null);
      }).catch(reason => {
        console.log('insert row failed', reason);
        res.status(500).json(null)
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
              state_code: req.session.corper.state_code,
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
              post_location: req.session.corper.location,
              post_time: req.body.post_time,
              acc_geodata: (req.body.acc_geodata ? req.body.acc_geodata : '')
            }).then(result => {
              res.status(200).json(null);

              console.log('me before you', moment(Number(req.body.post_time)).fromNow(), req.body.post_time);
              console.log('price', req.body.price);

              // once it saves in db them emit to other users
              socket.of('/user').emit('boardcast message', { // or 'accommodation'
                to: 'be received by everyoneELSE',
                post: {
                  state_code: req.session.corper.state_code,
                  streetname: req.body.streetname,
                  rentrange: req.body.rentrange,
                  rooms: req.body.rooms,
                  tenure: req.body.tenure,
                  expiredate: (req.body.expiredate ? req.body.expiredate : ''),
                  post_location: req.session.corper.location,
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
              res.status(500).json(null);
            }).catch(reason => {
              console.log('insert row failed', reason);
              res.status(500).json(null)
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
      state_code: req.session.corper.state_code,
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
      post_location: req.session.corper.location,
      post_time: req.body.post_time,
      acc_geodata: (req.body.acc_geodata ? req.body.acc_geodata : '')
    }).then(resolve => {
      // then status code is good
      res.status(200).json(null);

      console.log('me before you', moment(Number(req.body.post_time)).fromNow(), req.body.post_time);


      // once it saves in db them emit to other users
      socket.of('/user').emit('boardcast message', { // or 'accommodation'
        to: 'be received by everyoneELSE',
        post: {
          state_code: req.session.corper.state_code,
          streetname: req.body.streetname,
          rentrange: req.body.rentrange,
          rooms: req.body.rooms,
          tenure: req.body.tenure,
          expiredate: (req.body.expiredate ? req.body.expiredate : ''),
          post_location: req.session.corper.location,
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
      res.status(500).json(null);
    }).catch((reason) => {
      res.status(500).json(null);
    })


  }
})

module.exports = router;