const { Op } = require("sequelize");
const helpers = require('../utilities/helpers')
const jwt = require('jsonwebtoken')
const db = require('../models')
const auth = require('../helpers/auth')
const fs = require('fs');
const ngstates = require('../utilities/ngstates')
const Busboy = require('busboy');

const chalk = require('chalk');

const path = require('path');
const _FILENAME = path.basename(__filename);

/**
 * options for setting JWT cookies
 * 
 * */
let cookieOptions = {
  httpOnly: true, // so frontend js can't access
  maxAge: auth.maxAge,
  sameSite: 'none',
  // path: '' // until we figure out how to add multiple path
}

if (process.env.NODE_ENV === 'production') {
  cookieOptions.secure = true // localhost, too, won't work if true
}


/**
 * Insert new data for a corp member in our database
 */
exports.create = (req, res) => {
  const _FUNCTIONNAME = 'create'
  console.log('hitting', _FILENAME, _FUNCTIONNAME);

  console.log('\n\ncorpMember cntrl -- create()', req.body)
  // req.body.remember: 'on' // also check if req.body.remember
  return db.CorpMember
    .create(req.body)
    .then(result => {
      console.log('re:', result);
      req.session.corper = result.dataValues // set inside successful jwt signing
      // send welcome email
      helpers.sendSignupWelcomeEmail(req.body.email, req.body.first_name, result.dataValues.service_state)

      jwt.sign({
        state_code: req.body.state_code.toUpperCase(),
        email: req.body.email.toLowerCase()
      }, process.env.SESSION_SECRET, (err, token) => {
        if (err) {
          console.error('sign up err', err)
          throw err // ? can we throw
        } else {
          console.log('\n\n\n\nsigned up ...done jwt and', req.session.corper);
          // res.setHeader('Set-Cookie', 'name=value')

          // problem here https://stackoverflow.com/questions/49476080/express-session-not-persistent-after-redirect

          res.cookie('_online', token, cookieOptions).status(200).json({
            state_code: req.body.state_code.toUpperCase(),
            message: 'OK'
          })
        }
      })
    }, error => {
      console.error('CorpersSignUp() error happened', error);
      console.error('----> error happened', error.errors[0], error.fields);



      // res.send(error.message) // try this & not redirect
      if (error.errors[0].validatorKey == 'not_unique') {
        switch (error.errors[0].path) { // value: 'nwachukwuossai@gmail.com',

          case 'state_code':
            res.redirect('/signup?m=ds'); // [m]essage = [d]uplicate [s]tatecode
            break;

          case 'email':
            res.redirect('/signup?m=de'); // [m]essage = [d]uplicate [e]mail
            break;

          case 'invalid state_code':
            res.redirect('/signup?m=is') // [m]essage = [i]nvalid [s]tatecode
            break;

          default:
            res.redirect('/signup?m=ue'); // [m]essage = [u]naccounted [e]rror
            break;
        }
      } else { // should also switch for maybe invalid values
        res.redirect('/signup?m=ue'); // [m]essage = [u]naccounted [e]rror
      }
    }).catch(reason => {
      console.error('catching this err because:', reason);
      res.redirect('/signup?m=ue')
    });
  // .then(_test => res.status(201).send(_test))
  // .catch(error => res.status(400).send(error));



}

/**
 * <% var total_num_unread_msg = oldunreadchats.filter((value, index, array) => { return value.message_to == corper.state_code && value.message_sent == 0 }).length ; %>
 * @param {*} req 
 * @param {*} res 
 * @returns total unread message
 */
exports.unreadMessages = (req, res) => {
  const _FUNCTIONNAME = 'unreadMessages'
  console.log('hitting', _FILENAME, _FUNCTIONNAME);

  console.log('req.params/session', req.session, req.params) // req.path is shorthand for url.parse(req.url).pathname

  return db.Chat
    .count({
      where: {
        message_to: req.session.corper.state_code,
        message_sent: false,
        message: {
          [Op.not]: null
        }
      }
    })
    .then(result => {
      console.log('\n\n\nwhat is this', req.session);

      db.sequelize.getQueryInterface().showAllTables().then((tableObj) => {
        console.log('\n\n\nunread messages part', req.session.corper);
        console.log(tableObj, tableObj.length);
      })
        .catch((err) => {
          console.log('showAlltable ERROR', err);
        })

      // res.set('Content-Type', 'text/html') // causes ERR_HTTP_HEADERS_SENT
      res.render('pages/account', {
        state_code: req.session.corper.state_code.toUpperCase(),
        batch: req.params['3'],
        total_num_unread_msg: result.dataValues,
        corper: req.session.corper
      });
    }, reject => {
      console.log('why TF?!', reject);

      // res.set('Content-Type', 'text/html')
      res.render('pages/account', {
        state_code: req.session.corper.state_code.toUpperCase(),
        service_state: req.session.corper.service_state, // isn't this Duplicated
        batch: req.params['3'],
        name_of_ppa: req.session.corper.name_of_ppa,
        total_num_unread_msg: 0, // ...
        picture_id: req.session.corper.picture_id, // if there's picture_id // hmmm
        first_name: req.session.corper.first_name
      });
    })
    .catch((err) => { // we should have this .catch on every query
      console.error('our system should\'ve crashed:', err)
      res.redirect('/?e') // go back home, we should tell you an error occured
    })
}

exports.login = (req, res) => {
  const _FUNCTIONNAME = 'login'
  console.log('hitting', _FILENAME, _FUNCTIONNAME);

  return db.CorpMember.findOne({
    where: { // we're gonna use email or state code soon.
      [Op.or]: [ // will use username
        { email: req.body.username.toLowerCase() },
        { state_code: req.body.username.toUpperCase() },
      ]
    },
    raw: false, // don't use raw: true, and result.dataValues together // also the link on this comment https://stackoverflow.com/a/60951697
    attributes: { exclude: ['push_subscription_stringified'] }
  }).then(
    (result) => { // result is null if not state_code or email exists ... also tell when it's state_code or email that doesn't exist

      if (result && result.dataValues.password === req.body.password) { // password match
        console.log(chalk.bgGreen('login we good'));
        /**
         * mask the password
         * previously with result.dataValues.password.replace(/[a-zA-Z0-9]/ig, '*')
         * 
         * But that gives away the length of password, now just '*****'
         */
        result.dataValues.password = '*****'

        // remove the id too
        result.dataValues.id = undefined
        
        req.session.corper = result.dataValues
        jwt.sign({
          state_code: result.dataValues.state_code,
          email: result.dataValues.email
        }, process.env.SESSION_SECRET, (err, token) => {
          if (err) { // throw err // no throw of errors
            console.error(err)
            res.sendStatus(500)
          } else {
            // res.setHeader('Set-Cookie', 'name=value')
            res.cookie('_online', token, cookieOptions)
            console.log(chalk.bgBlue('Logged In'), req.session.corper?.state_code?.toUpperCase());
            /* req.session.save(function(err) { // hate this
              console.log("saved session");
            }) */
            res.status(200).json({
              message: 'Nice!',
              data: result
            })
          }
        })
      } else if (result && result.dataValues.password !== req.body.password) {
        console.log(chalk.bgRed('login was bad'));

        // TODO: kill what ever cookie was there
        res.status(401).json({
          message: 'Wrong Password',
          error: ''
        })
      } else if (!result) {
        // TODO: kill what ever cookie was there
        res.status(401).json({
          message: 'Account not found. Please sign up.',
          error: ''
        })
      }

    }, reject => {
      console.error('login err', reject)
      res.sendStatus(500)

    }).catch(reason => {
      console.error('login err', reason)
      res.sendStatus(500)
    })
}

exports.getProfile = (req, res) => {
  const _FUNCTIONNAME = 'updateProfilePhoto'
  console.log('hitting', _FILENAME, _FUNCTIONNAME);

  fs.readFile('./utilities/ngstateslga.json', (err, data) => {
    let jkl = JSON.parse(data);
    // let's hope there's no err

    let jn = req.session.corper.state_code.toUpperCase()

    /**an array of all the local government in the state */
    let lgas = jkl.states[ngstates.states_short.indexOf(jn.slice(0, 2))][ngstates.states_long[ngstates.states_short.indexOf(jn.slice(0, 2))]];
    // res.set('Content-Type', 'text/html');
    let _info = { // TODO: fill up info object with corp member data so incase of failure, profile page is loaded with corpers' information
      corper: req.session.corper, // {}, // as fall back, we could initialize to req.session.corper
      ppas: [],
      states: ngstates.states_long,
      lgas,
      current_year: new Date().getFullYear() // will have no need when we start using express locals
    }

    db.CorpMember.findOne({
      where: {
        state_code: {
          [Op.eq]: req.session.corper.state_code,
        }
      },
      include: [
        {
          model: db.Media,
        },
        {
          model: db.Sale,
          order: [
            ['created_at', 'ASC']
          ],
          include: [{
            model: db.Media,
            as: 'saleMedia'
          }],
        },
        {
          model: db.Accommodation,
          order: [
            ['created_at', 'ASC']
          ],
          include: [{
            model: db.Location
          }, {
            model: db.Media,
            as: 'accommodationMedia'
          }],
          attributes: db.Accommodation.getAllActualAttributes()
        },
        {
          model: db.PPA,
          include: [{
            model: db.Location
          }],
          // as: 'ppa',
          attributes: db.PPA.getAllActualAttributes() // hot fix (problem highlighted in ./models/ppa.js) -- > should create a PR to fix it ... related to https://github.com/sequelize/sequelize/issues/13309
        }
      ],
      attributes: db.CorpMember.getSafeAttributes()
    })
      // .toJSON()
      .then(_corper_sales_accommodations_ppa => {

        // _corper_sales_accommodations_ppa.dataValues.created_at = _corper_sales_accommodations_ppa.dataValues.created_at.toString()
        // _corper_sales_accommodations_ppa.dataValues.updated_at = _corper_sales_accommodations_ppa.dataValues.updated_at.toString()

        console.log("\n\n\n\n\n\ndid we get corp member's Sales n Accommodation n ppa?", _corper_sales_accommodations_ppa);

        _info.corper = _corper_sales_accommodations_ppa.dataValues;
        db.PPA.findAll({
          // where: { // how do we get PPAs from only a certain state! and even narrow it down to region
          //     state_code: { // doesn't exist on PPA model.
          //         [Op.eq]: `${req.session.corper.state_code.substring(0, 2)}`, // somewhat redundant
          //     },
          // },
          include: [{
            model: db.Location
          }],
          attributes: db.PPA.getAllActualAttributes() // hot fix (problem highlighted in ./models/ppa.js) -- > should create a PR to fix it ... related to https://github.com/sequelize/sequelize/issues/13309
        }).then(_all_ppas => {
          _all_ppas.forEach(element => {
            if (element.dataValues.Location) {
              console.log('\n\n\tchecking address\n\n\n', element.dataValues.Location);
            }
          });
          console.log('all ppas', _all_ppas); // uncomment to check later
          _info.ppas = _all_ppas;
          console.log('we good good on profile', _info);
          console.log('what is acc', _info.corper.Accommodation);
          res.render('pages/profile', _info);
        }, _err_all_ppas => {

          res.render('pages/profile', _info, (err, html) => {
            console.error('err rendering profile page', err, html);
          });
          console.error('uhmmmm agina not good', _err_all_ppas);
        }).catch(reject => {

          console.error('is this the error ???>>>', reject);
          // right ?? ?? we can't just not send anything ...
          res.render('pages/profile', _info);
        })



      }, (reject) => {
        res.render('pages/profile', _info);
        console.error('uhmmmm not good', reject);
        console.log('emitting empty posts, first user or the tl is empty')
      }).catch(reject => {
        console.error('is this the error ?', reject);

        // right ?? ?? we can't just not send anything ...
        res.render('pages/profile', _info);
      })




    /*
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
      */

  })
}

exports.updateProfile = async (req, res) => {
  const _FUNCTIONNAME = 'updateProfile'
  console.log('hitting', _FILENAME, _FUNCTIONNAME);

  console.log('getting', req.body);

  try {
    const corpMember = await db.CorpMember
    .findOne({ 
      where: { state_code: req.session.corper.state_code },
      /**
       * removed 'id'
       * 
       * causes Error: You attempted to save an instance with no primary key, this is not allowed since it would result in a global update
       */
      attributes: {exclude: ['password']}
    })

    corpMember.set({...req.body})

    await corpMember.save()

    res.status(200).json({
      message: 'Profile updated',
      data: corpMember.toJSON()
    })
  } catch (error) {
    console.error(`'ERR in ${_FILENAME} ${_FUNCTIONNAME}:`, error)
    res.status(501).json({
      message: 'Hello, an Error occurred.',
    })
  }

}

exports.updateProfilePhoto = (req, res) => {
  const _FUNCTIONNAME = 'updateProfilePhoto'
  console.log('hitting', _FILENAME, _FUNCTIONNAME);

  const busboy = new Busboy({
    headers: req.headers,
    limits: { // set fields, fieldSize, and fieldNameSize later (security)
      files: 12, // don't upload more than 12 media files
      fileSize: 24 * 1024 * 1024 // 24MB
    }
  });

  let _profile_data = {
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

          connectionPool.query('UPDATE info SET picture_id = ? WHERE state_code = ?', [file.data.id, req.session.corper.state_code.toUpperCase()], function (error, results, fields) {
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

  busboy.on('finish', async function () {
    console.log('we done parsing form, now updating', _profile_data)

    let corpMemberUpdate = await db.CorpMember.update(
      {
        ..._profile_data
      }
      , {
        where: {
          state_code: req.session.corper.state_code
        }
      }
      , {
        returning: true
      }
    )

    let _corpMemberUpdate = await db.CorpMember.findOne(
      {
        where: {
          state_code: req.session.corper.state_code
        }
      })

    // update req.session
    console.log('updated profile', corpMemberUpdate);


    /**
     * From https://sequelize.org/master/manual/model-querying-basics.html
     * Similarly, it's also possible to remove a selected few attributes:

      Model.findAll({
        attributes: { exclude: ['baz'] }
      });
     */

    // update ppa if the corp has ppa
    let corpMemberPPA = await _corpMemberUpdate.getPPA({
      attributes: db.PPA.getAllActualAttributes()
    });
    console.log('\n\nis corpMemberPPA instanceof PPA ??\n\n', corpMemberPPA instanceof db.PPA);
    console.log('corpMemberPPA is', corpMemberPPA);
    if (corpMemberPPA) { // also check if profile data has name_of_ppa & type_of_ppa
      if (_profile_data.name_of_ppa) {
        corpMemberPPA.name = _profile_data.name_of_ppa
      }
      if (_profile_data.type_of_ppa) {
        corpMemberPPA.type_of_ppa = _profile_data.type_of_ppa
      }

      let corpMemberPPALocation = await corpMemberPPA.getLocation(); // get PPA or use .getPPA instanch
      console.log('\n\nis corpMemberPPALocation instanceof Location ??\n\n', corpMemberPPALocation instanceof db.Location);
      console.log('corpMemberPPALocation is', corpMemberPPALocation);
      if (corpMemberPPALocation) {
        if (_profile_data.ppa_address) {
          corpMemberPPALocation.directions = _profile_data.ppa_directions
        }
        if (_profile_data.ppa_directions) {
          corpMemberPPALocation.address = _profile_data.ppa_address
        }

      } else {
        let _locationUpdate = await db.Location.create({
          directions: _profile_data.ppa_directions,
          address: _profile_data.ppa_address,
        })

        // update location if the corp member's ppa has location
        let __ppaUpdate = await _ppaUpdate.setLocation(_locationUpdate)

      }
    } else {
      let _ppaUpdate = await db.PPA.create({
        name: _profile_data.name_of_ppa,
        type_of_ppa: _profile_data.type_of_ppa
      }, {
        returning: db.PPA.getAllActualAttributes()
      })

      let ppaUpdate = await _corpMemberUpdate.setPPA(_ppaUpdate)

      let _locationUpdate = await db.Location.create({
        directions: _profile_data.ppa_directions,
        address: _profile_data.ppa_address,
      })

      // update location if the corp member's ppa has location
      let __ppaUpdate = await _ppaUpdate.setLocation(_locationUpdate)

      console.log('updated ppa profile', ppaUpdate);

      console.log('updated ppa profile', __ppaUpdate);
    }

    res.sendStatus(201) // sending a 'Created' response ... not 200 OK response

  })

  return req.pipe(busboy)
}

exports.updateProfileBio = (req, res) => {

  const _FUNCTIONNAME = 'updateProfileBio'
  console.log('hitting', _FILENAME, _FUNCTIONNAME);

  db.CorpMember.update({
    public_profile: req.body.public_profile,
    nickname: req.body.nickname,
    bio: req.body.profile,
  }, {
    where: {
      state_code: req.session.corper.state_code
    },
    returning: true
  }).then((result) => {
    res.status(200).json({
      message: 'Updated profile bio',
      data: result
    })
  }, (err) => {
    console.error(`'ERR in ${_FILENAME} ${_FUNCTIONNAME}:`, err)
    res.status(501).json({
      message: 'Hello. An Error Occurred.',
    })
  }).catch((error) => {
    console.error(`'ERR in ${_FILENAME} ${_FUNCTIONNAME}:`, error)
    res.status(501).json({
      message: 'We could not update bio details. An error occured'
    })
  })
}

exports.updateProfileServiceDetails = (req, res) => {

  const _FUNCTIONNAME = 'updateProfileServiceDetails'
  console.log('hitting', _FILENAME, _FUNCTIONNAME);

  db.CorpMember.update({
    service_state: req.body.serviceState,
    lga: req.body.lga,
    city_or_town: req.body.cityOrTown,
    region_street: req.body.street,
    stream: req.body.stream,
  }, {
    where: {
      state_code: req.session.corper.state_code
    }
  }).then((result) => {
    res.status(200).json({
      message: 'Hello',
      data: result
    })
  }, (err) => {
    console.error(`'ERR in ${_FILENAME} ${_FUNCTIONNAME}:`, err)
    res.status(501).json({
      message: 'Hello. An Error Occurred.',
    })
  }).catch((error) => {
    console.error(`'ERR in ${_FILENAME} ${_FUNCTIONNAME}:`, error)
    res.status(501).json({
      message: 'We could not update bio details. An error occured'
    })
  })
}

exports.updateProfilePpaDetails = (req, res) => {

  const _FUNCTIONNAME = 'updateProfilePpaDetails'
  console.log('hitting', _FILENAME, _FUNCTIONNAME);

  db.CorpMember.update({
    public_profile: req.body.public_profile,
    nickname: req.body.nickname,
    bio: req.body.profile,
  }, {
    where: {
      state_code: req.session.corper.state_code
    },
    returning: true
  }).then((result) => {
    res.status(200).json({
      message: 'Hello',
      data: result
    })
  }, (err) => {
    console.error(`'ERR in ${_FILENAME} ${_FUNCTIONNAME}:`, err)
    res.status(501).json({
      message: 'Hello. An Error Occurred.',
    })
  }).catch((error) => {
    console.error(`'ERR in ${_FILENAME} ${_FUNCTIONNAME}:`, error)
    res.status(501).json({
      message: 'We could not update bio details. An error occured'
    })
  })
}

exports.updateProfileOtherDetails = (req, res) => {

  const _FUNCTIONNAME = 'updateProfileOtherDetails'
  console.log('hitting', _FILENAME, _FUNCTIONNAME);

  db.CorpMember.update({
    public_profile: req.body.public_profile,
    nickname: req.body.nickname,
    bio: req.body.profile,
  }, {
    where: {
      state_code: req.session.corper.state_code
    },
    returning: true
  }).then((result) => {
    res.status(200).json({
      message: 'Hello',
      data: result
    })
  }, (err) => {
    console.error(`'ERR in ${_FILENAME} ${_FUNCTIONNAME}:`, err)
    res.status(501).json({
      message: 'Hello. An Error Occurred.',
    })
  }).catch((error) => {
    console.error(`'ERR in ${_FILENAME} ${_FUNCTIONNAME}:`, error)
    res.status(501).json({
      message: 'We could not update bio details. An error occured'
    })
  })
}

// This shouldn't be async
exports.savePushSubscription = async (req, res) => { // Busboy doesn't support json https://github.com/mscdex/busboy/issues/125#issuecomment-237715028
  const _FUNCTIONNAME = 'updateProfilePhoto'
  console.log('hitting', _FILENAME, _FUNCTIONNAME);

  console.log('oh well, here', req.body);

  // it would be good practice to make sure the payload has all the required data
  // const subscriptionObject = {
  //   endpoint: pushSubscription.endpoint,
  //   keys: {
  //     p256dh: pushSubscription.p256dh, // getKeys is not a function
  //     auth: pushSubscription.auth
  //   }
  // };


  let corpMemberUpdate = await db.CorpMember.update(
    {
      push_subscription_stringified: req.body
    }
    , {
      where: {
        state_code: req.session.corper.state_code
      }
    }
  )



  try {
    const __model = db.CorpMember
    for (let assoc of Object.keys(__model.associations)) {
      for (let accessor of Object.keys(__model.associations[assoc].accessors)) {
        console.log(__model.name + '.' + __model.associations[assoc].accessors[accessor] + '()');
      }
    }

  } catch (error) {
    console.error('trying to get assocs', error);
  }

  // checking if it updated:
  if (corpMemberUpdate && corpMemberUpdate[0] > 0) { // object [ 1 ]
    res.sendStatus(200) // sending a 'Created' response ... not 200 OK response
  } else {
    res.sendStatus(500)
  }
  console.log('did push sub update?', typeof corpMemberUpdate, corpMemberUpdate);


  // .redirect(result); // no need to redirect, just send status code


}

exports.createAlert = (req, res) => {
  const _FUNCTIONNAME = 'updateProfilePhoto'
  console.log('hitting', _FILENAME, _FUNCTIONNAME);

  const busboy = new Busboy({
    headers: req.headers,
    limits: { // set fields, fieldSize, and fieldNameSize later (security)
      files: 12, // don't upload more than 12 media files
      fileSize: 24 * 1024 * 1024 // 24MB
    }
  });

  let _alert_data = {
    state_code: req.session.corper.state_code,
    rooms: []
  };

  busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, transferEncoding, mimetype) {
    switch (fieldname) {
      // for accommodation
      case 'alert-accommodation-rooms':
        _alert_data['rooms'].push(val)
        break;
      case 'alert-accommodation-min-price':
        _alert_data['minimum_price'] = val;
        break;
      case 'alert-accommodation-max-price':
        _alert_data['max_price'] = val;
        break;
      case 'alert-accommodation-type':
        _alert_data['accommodation_type'] = val;
        break;
      // for sale
      case 'alert-sale-item-name':
        _alert_data['item_name'] = val;
        break;
      case 'alert-sale-min-price':
        _alert_data['minimum_price'] = val;
        break;
      case 'alert-sale-max-price':
        _alert_data['max_price'] = val;
        break;

      // for both ?? [on the finish event, we'll check to see if all the accommodation input were filled, if yes, then create accommodation alert. Can do same for sales too. Can happen for both.]
      case 'type':
        _alert_data['type'] = val;
        break;
      default: // for things like state_code
        _alert_data[fieldname] = val;
        break;
    }

    console.warn(fieldname, val, fieldnameTruncated, valTruncated, transferEncoding, mimetype);
  });

  busboy.on('finish', function () {
    _alert_data.rooms = _alert_data.rooms.toString()
    console.log("alert data", _alert_data);

    db.Alert
      .create(_alert_data)
      .then(result => {
        console.log('_alert_data re:', result);

        res.sendStatus(201)

      }, error => {
        console.error('alert creation() error happened', error);
        console.error('alert error happened', error.errors[0], error.fields);

        res.sendStatus(501)
      }).catch(reason => {
        console.error('catching this alert err because:', reason);
        res.sendStatus(501)
      });


  });



  return req.pipe(busboy)
}


/**
 * when we add location search, we should only search for location that has ppa
 * or we should directly search PPAs
 * @param {*} req 
 * @param {*} res 
 */
exports.getPosts = (req, res) => {
  const _FUNCTIONNAME = 'updateProfilePhoto'
  console.log('hitting', _FILENAME, _FUNCTIONNAME);

  console.log("??????? req.query:", req.query);
  res.setHeader('Content-Type', 'application/json');
  db.Sale.findAll({ // also add PPA
    where: {
      item_name: {
        [Op.substring]: req.query.q.substring(1), // hmmm...  // remove first letter
      },
      ... (req.query.s && {
        state_code: {
          [Op.substring]: req.query.s.substring(0, 2),
        }
      })
    },
    order: [
      ['created_at', 'ASC']
    ],
    include: [
      {
        model: db.Media,
        as: 'saleMedia',

      },
      {
        model: db.CorpMember,
        as: 'saleByCorper',
        attributes: db.CorpMember.getSafeAttributes()
      }
    ]
  })
    .then(_sales => {
      console.log("\n\n\n\n\n\ndid we get corp member's Sales?", _sales);
      db.Accommodation.findAll({ // also add PPA
        where: {
          [Op.or]: [
            {
              accommodation_type: {
                [Op.substring]: req.query.q,
              }
            },
            // ...
          ],

          ... (req.query.s && {
            state_code: {
              [Op.substring]: req.query.s.substring(0, 2),
            }
          })
        },
        order: [
          ['created_at', 'ASC']
        ],
        include: [
          {
            model: db.Media,
            as: 'accommodationMedia',
          },
          {
            model: db.CorpMember,
            as: 'accommodationByCorper',
            attributes: db.CorpMember.getSafeAttributes(), // isn't bringing the other _location & service state
          },
          {
            model: db.Location,
          }
        ],
        attributes: db.Accommodation.getAllActualAttributes()
      }).then(_accommodations => {
        console.log("\n\n\n\n\n\ndid we get corp member's Accommodation?", _accommodations);
        // combine both ?? sort by
        let _sales_accommodations = _sales.concat(_accommodations);
        _sales_accommodations.sort((firstEl, secondEl) => { firstEl.created_at - secondEl.created_at });

        console.log("\n\n\n\n\n\ndid we all searching +?", _sales_accommodations);
        // will def change this later:
        let thisisit = {
          data: {
            // accommodations: _accommodations,
            // ABIA: _sales,// [], // will include later // will need it like that STATES
            // sales: _sales
          }
        };


        for (let index = 0; index < _sales_accommodations.length; index++) {

          let _post = _sales_accommodations[index]
          /* if (thisisit.data[ngstates.states_long[(ngstates.states_short.indexOf(ele.state_code.substring(0,2)))]]) {
            thisisit.data[ngstates.states_long[(ngstates.states_short.indexOf(ele.state_code.substring(0,2)))]].push(ele)
          } else {
            thisisit.data[ngstates.states_long[(ngstates.states_short.indexOf(ele.state_code.substring(0,2)))]] = [ele]
          } */

          if (ngstates.states_long[(ngstates.states_short.indexOf(_post.state_code.substring(0, 2)))] in thisisit.data) {
            thisisit.data[ngstates.states_long[(ngstates.states_short.indexOf(_post.state_code.substring(0, 2)))]].push(_post)
          } else {
            thisisit.data[ngstates.states_long[(ngstates.states_short.indexOf(_post.state_code.substring(0, 2)))]] = [_post]
          }

        }

        console.log("what next ?\n", thisisit);

        res
          .status(200)
          .send(thisisit)

      }, (reject) => {
        res.sendStatus(500)
        console.error('uhmmmm not good', reject);
        console.log('emitting empty posts, first user or the tl is empty')
      }).catch(reject => {
        console.error('is this the error ?', reject);

        // right ?? ?? we can't just not send anything ...
        res.sendStatus(500)
      })



    }, (reject) => {
      res.sendStatus(500)
      console.error('uhmmmm not good', reject);
      console.log('emitting empty posts, first user or the tl is empty')
    }).catch(reject => {
      console.error('is this the error ?', reject);

      // right ?? ?? we can't just not send anything ...
      res.sendStatus(500)
    })


  // res.status(200).send({ data: ["ghfc ty", "rewfhb iwre", "hblg er ieur\n\nthat apostrophe", "The happening place in Abia is NCCF!", "Well and NACC too. But NCCF would Never die!!!", "dsaf df asd", "5u96y j94938\nfdsig eor\n\ndfsnhgu es9rgre\n\ndsigj90e9re", "gfh r", "gejge rniog eoigrioerge ", "gf er rg erg", "fdg erei sug serugeis gr  \n\n\n\n\nThis", "test df gf byyyyyyyyy mee", "Okay. ", "This is it. And yep.", "I could sing. ... Oh"] });


}

exports.searchPosts = async (req, res) => {
  const _FUNCTIONNAME = 'updateProfilePhoto'
  console.log('hitting', _FILENAME, _FUNCTIONNAME);

  let _accommodations = await db.Accommodation.findAll({
    include: [{
      model: db.Location
    }, {
      model: db.Media,
      as: 'accommodationMedia'
    }],
    attributes: db.Accommodation.getAllActualAttributes() // this is a hot fix
  })
  let _sales = await db.Sale.findAll()
  let _location_ppas = await db.Location.findAll({
    where: {
      ppa_id: {
        [Op.not]: null
      }
    }
  }) // filter only PPAs
  let result = { _accommodations, _sales, _location_ppas, _sale: null, _accommodation: null, _location_ppa: null }

  // TODO, locations (and PPAs) // how do we filter PPAs
  if (req.query.type == 'accommodation') {
    result._accommodation = await db.Accommodation.findOne({
      where: {
        id: req.query.id
      },
      include: [{
        model: db.Location
      }, {
        model: db.Media,
        as: 'accommodationMedia'
      }],
      attributes: db.Accommodation.getAllActualAttributes() // why is `accommodationId` be looked for in the query 
    })
  } else if (req.query.type == 'sale') {
    result._sale = await db.Sale.findOne({
      where: {
        id: req.query.id
      },
      include: [{
        model: db.Media,
        as: 'saleMedia'
      }],
    })
  } else if (req.query.type == 'location') { // a location that is a ppa
    result._location_ppa = await db.Location.findOne({
      where: {
        id: req.query.id,
        ppa_id: {
          [Op.not]: null
        }
      },
      include: [{
        model: db.PPA
      }, {
        model: db.Location
      }],
    })
  }

  result.current_year = new Date().getFullYear()
  result.corper = null
  if (req.session.corper) {
    result.corper = req.session.corper
  }
  res.set('Content-Type', 'text/html');
  res.render('pages/search', result)
}

exports.joinWaitList = (req, res) => {
  const _FUNCTIONNAME = 'joinWaitList'
  console.log('hitting', _FILENAME, _FUNCTIONNAME);

  return db.WaitList.create(req.body)
    .then(result => {
      // console.log('re:', result);

      res.status(200).send({
        message: "We got that. Thanks for joining our waitlist"
      })

    }, error => {
      console.error(`ERR in ${_FILENAME} ${_FUNCTIONNAME}:`, error)
      res.status(500).send({
        message: "We had an error, that can be fixed.",
        error: error.errors[0]
      })

    }).catch(reason => {
      console.error(`Caught ERR in ${_FILENAME} ${_FUNCTIONNAME}:`, error)
      res.status(500).send({
        message: "We had an error, so sorry about that."
      })
    });


}

exports.getAllUsers = (req, res) => {
  const _FUNCTIONNAME = 'getAllUsers'
  console.log('hitting', _FILENAME, _FUNCTIONNAME);
  return db.CorpMember.findAll().then(results => {
    res.status(200).send({
      data: results
    })
  }, error => {
    res.status(500).send({
      message: "We had an error, that can be fixed."
    })
  }).catch(reason => {
    console.error('catching this err because:', reason);
    res.status(500).send({
      message: "We had an error, so sorry about that."
    })
  });
}
