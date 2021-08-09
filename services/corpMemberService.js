const CorpMember = require('../models').CorpMember
const Chat = require('../models').Chat
const PPA = require('../models').PPA
const Accommodation = require('../models').Accommodation
const Alert = require('../models').Alert
const Sale = require('../models').Sale
const Media = require('../models').Media
const Location = require('../models').Location
const { Op } = require("sequelize");
const helpers = require('../utilities/helpers')
const jwt = require('jsonwebtoken')
const sequelize = require('../not_models/db').sequelize
const auth = require('../helpers/auth')
const fs = require('fs');
const ngstates = require('../utilities/ngstates')
const Busboy = require('busboy');

/**
 * options for setting JWT cookies
 * 
 * */
let cookieOptions = {
  httpOnly: true, // frontend js can't access
  maxAge: auth.maxAge,
  // sameSite: 'strict', // https://github.com/expressjs/session/issues/660#issuecomment-514384297
  // path: '' // until we figure out how to add multiple path
}

if (process.env.NODE_ENV === 'production') {
  cookieOptions.secure = true // localhost, too, won't work if true
}

module.exports = {
    /**
     * 
     * @param {*} req 
     * @param {*} res 
     * @returns result of creating a new corpMember entry in our databasebundleRenderer.renderToStream
     * 
     * Insert new data for a corp member in our database
     */
    create(req, res) {
        console.log('\n\ncorpMember cntrl -- create()', req.body)
        // req.body.remember: 'on' // also check if req.body.remember
        return CorpMember
          .create(req.body)
          .then(result => {
            console.log('re:', result);
            req.session.corper = result.dataValues
            // send welcome email
            helpers.sendSignupWelcomeEmail(req.body.email, req.body.firstname, result.dataValues.servicestate)
            jwt.sign({
              statecode: req.body.statecode.toUpperCase(),
              email: req.body.email.toLowerCase()
          }, process.env.SESSION_SECRET, (err, token) => {
              if (err) {
                console.error('sign up err', err)
                throw err // ? can we throw
              } else {
                console.log('\n\n\n\nsigned up ...done jwt and', req.session.corper);
                // res.setHeader('Set-Cookie', 'name=value')
                
                // problem here https://stackoverflow.com/questions/49476080/express-session-not-persistent-after-redirect
                
                res.cookie('_online', token, cookieOptions)
                  .redirect(req.body.statecode.toUpperCase());
              }
            })
          }, error => {
            console.error('CorpersSignUp() error happened', error);
            console.error('----> error happened', error.errors[0], error.fields);

            
            
            // res.send(error.message) // try this & not redirect
            if (error.errors[0].validatorKey == 'not_unique') {
              switch (error.errors[0].path) { // value: 'nwachukwuossai@gmail.com',
      
                case 'statecode':
                  res.redirect('/signup?m=ds'); // [m]essage = [d]uplicate [s]tatecode
                  break;
        
                case 'email':
                  res.redirect('/signup?m=de'); // [m]essage = [d]uplicate [e]mail
                  break;
        
                case 'invalid statecode':
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


  
    },

    /**
     * <% var total_num_unread_msg = oldunreadchats.filter((value, index, array) => { return value.message_to == corper.statecode && value.message_sent == 0 }).length ; %>
     * @param {*} req 
     * @param {*} res 
     * @returns total unread message
     */
    unreadMessges(req, res) {
      console.log('req.params/session', req.session, req.params) // req.path is shorthand for url.parse(req.url).pathname

      return Chat
        .count({
          where: {
            message_to: req.session.corper.statecode,
            message_sent: false,
            message: {
              [Op.not]: null
            }
          }
        })
        .then(result => {
          console.log('\n\n\nwhat is this', req.session);

          sequelize.getQueryInterface().showAllTables().then((tableObj) => {
            console.log('\n\n\nunread messages part', req.session.corper);
            console.log(tableObj, tableObj.length);
          })
          .catch((err) => {
            console.log('showAlltable ERROR',err);
          })

          // res.set('Content-Type', 'text/html') // causes ERR_HTTP_HEADERS_SENT
          res.render('pages/account', {
            statecode: req.session.corper.statecode.toUpperCase(),
            batch: req.params['3'],
            total_num_unread_msg: result.dataValues,
            corper: req.session.corper
          });
        }, reject => {
          console.log('why TF?!', reject);

          // res.set('Content-Type', 'text/html')
          res.render('pages/account', {
            statecode: req.session.corper.statecode.toUpperCase(),
            servicestate: req.session.corper.servicestate, // isn't this Duplicated
            batch: req.params['3'],
            name_of_ppa: req.session.corper.name_of_ppa,
            total_num_unread_msg: 0, // ...
            picture_id: req.session.corper.picture_id, // if there's picture_id // hmmm
            firstname: req.session.corper.firstname
          });
        })
        .catch((err) => { // we should have this .catch on every query
          console.error('our system should\'ve crashed:', err)
          res.redirect('/?e') // go back home, we should tell you an error occured
        })
    },

    login(req, res) {
      console.log('\n\n\nwhat are we getting', req.body);
      return CorpMember.findOne({
        where: { // we're gonna use email or state code soon.
          [Op.or]: [ // will use identifier
            { email: req.body.identifier.toLowerCase() },
            { statecode: req.body.identifier.toUpperCase() }, 
          ]
        },
        raw: false, // don't use raw: true, and result.dataValues together // also the link on this comment https://stackoverflow.com/a/60951697
        attributes: { exclude: ['pushSubscriptionStringified'] }
      }).then(
        result => { // result is null if not statecode or email exists ... also tell when it's statecode or email that doesn't exist
         
        console.log('\n\n\n\nlogin we good', result);
        if (result && result.dataValues.password === req.body.password) { // password match
          
          console.log('do we have what we want ?', result.dataValues._location);

          req.session.corper = result.dataValues
        jwt.sign({
          statecode: result.dataValues.statecode,
          email: result.dataValues.email
        }, process.env.SESSION_SECRET, (err, token) => {
          if (err) throw err // no throw of errors
          else {
            // res.setHeader('Set-Cookie', 'name=value')
            res.cookie('_online', token, cookieOptions)
            console.log("pleaseee", req.session.corper._servicestate);
            console.log('we\'re moving', req.session);
            /* req.session.save(function(err) { // hate this
              console.log("saved session");
            }) */
            res.status(200).redirect(result.dataValues.statecode.toUpperCase());
          }
        })
        } else if(result && result.dataValues.password !== req.body.password){
          res.status(502).redirect('/login?p=w'); // [p]assword = [w]rong
        } else if (!result) {
          res.status(502).redirect('/login?m=s'); // [m]essage = [s]ignup // tell corper at the front end
        }
        
  
        
      }, reject => {
        console.error('login err', reject)
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
    },

    getProfile(req, res) {
      fs.readFile('./utilities/ngstateslga.json', (err, data) => {
        let jkl = JSON.parse(data);
        // let's hope there's no err
    
          let jn = req.session.corper.statecode.toUpperCase()
    
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

          CorpMember.findOne({
            where: {
                statecode: {
                    [Op.eq]: req.session.corper.statecode,
                }
            },
            include: [
              {
                model: Media,
              },
              {
                model: Sale,
                order: [
                    ['createdAt', 'ASC']
                ],
                include: [{
                  model: Media,
                  as: 'saleMedia'
                }],
              },
              {
                model: Accommodation,
                order: [
                    ['createdAt', 'ASC']
                ],
                include: [{
                  model: Location
                }, {
                  model: Media,
                  as: 'accommodationMedia'
                }],
                attributes: Accommodation.getAllActualAttributes()
              },
              {
                model: PPA,
                include: [{
                  model: Location
                }],
                // as: 'ppa',
                attributes: PPA.getAllActualAttributes() // hot fix (problem highlighted in ./models/ppa.js) -- > should create a PR to fix it ... related to https://github.com/sequelize/sequelize/issues/13309
              }
            ],
            attributes: CorpMember.getSafeAttributes()
        })
        // .toJSON()
        .then(_corper_sales_accommodations_ppa => {

          // _corper_sales_accommodations_ppa.dataValues.createdAt = _corper_sales_accommodations_ppa.dataValues.createdAt.toString()
          // _corper_sales_accommodations_ppa.dataValues.updatedAt = _corper_sales_accommodations_ppa.dataValues.updatedAt.toString()

            console.log("\n\n\n\n\n\ndid we get corp member's Sales n Accommodation n ppa?", _corper_sales_accommodations_ppa);

            _info.corper = _corper_sales_accommodations_ppa.dataValues;
            PPA.findAll({
              // where: { // how do we get PPAs from only a certain state! and even narrow it down to region
              //     statecode: { // doesn't exist on PPA model.
              //         [Op.eq]: `${req.session.corper.statecode.substring(0, 2)}`, // somewhat redundant
              //     },
              // },
              include: [{
                model: Location
              }],
              attributes: PPA.getAllActualAttributes() // hot fix (problem highlighted in ./models/ppa.js) -- > should create a PR to fix it ... related to https://github.com/sequelize/sequelize/issues/13309
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
              // statecode: req.session.corper.statecode.toUpperCase(),
              // servicestate: req.session.corper.servicestate.toUpperCase(),
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
            query.GetCorperPosts(req.session.corper.statecode.toUpperCase())
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
              // statecode: req.session.corper.statecode.toUpperCase(),
              // servicestate: req.session.corper.servicestate.toUpperCase(),
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
    },

    postProfile(req, res) {
      const busboy = new Busboy({
        headers: req.headers,
        limits: { // set fields, fieldSize, and fieldNameSize later (security)
          files: 12, // don't upload more than 12 media files
          fileSize: 24 * 1024 * 1024 // 24MB
        }
      });
    
      let _profile_data = {
        statecode: req.session.corper.statecode
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
            parents: ['1mtYhohO0qpXIwt6NXZzo9vlU4IF0NX0D'] // upload to folder CorpersOnline Profile Pics
          };
          let media = {
            mimeType: mimetype,
            body: filestream // fs.createReadStream("C:\\Users\\NWACHUKWU\\Pictures\\ad\\IMG-20180511-WA0001.jpg")
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
    
              connectionPool.query('UPDATE info SET picture_id = ? WHERE statecode = ?', [file.data.id, req.session.corper.statecode.toUpperCase()], function (error, results, fields) {
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
    
      busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, transferEncoding, mimetype) {
        // console.log('Field [' + fieldname + ']: value: ' + inspect(val));
        
        _profile_data[fieldname] = val; // inspect(val); // seems inspect() adds double quote to the value
        
        console.warn(fieldname, val, fieldnameTruncated, valTruncated, transferEncoding, mimetype);
      });
    
      busboy.on('finish', async function () {
        console.log('we done parsing form, now updating', _profile_data)

        let corpMemberUpdate = await CorpMember.update(
          {
            ..._profile_data
          }
          ,{
            where: {
              statecode: req.session.corper.statecode
            }
          }
          ,{
            returning: true
          }
        )

        let _corpMemberUpdate = await CorpMember.findOne(
        {
          where: {
            statecode: req.session.corper.statecode
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
          attributes: PPA.getAllActualAttributes()
        });
        console.log('\n\nis corpMemberPPA instanceof PPA ??\n\n', corpMemberPPA instanceof PPA);
        console.log('corpMemberPPA is', corpMemberPPA);
        if (corpMemberPPA) { // also check if profile data has name_of_ppa & type_of_ppa
          if (_profile_data.name_of_ppa) {
            corpMemberPPA.name = _profile_data.name_of_ppa
          }
          if (_profile_data.type_of_ppa) {
            corpMemberPPA.type_of_ppa = _profile_data.type_of_ppa
          }
          
          let corpMemberPPALocation = await corpMemberPPA.getLocation(); // get PPA or use .getPPA instanch
          console.log('\n\nis corpMemberPPALocation instanceof Location ??\n\n', corpMemberPPALocation instanceof Location);
          console.log('corpMemberPPALocation is', corpMemberPPALocation);
          if (corpMemberPPALocation) {
            if (_profile_data.ppa_address) {
              corpMemberPPALocation.directions = _profile_data.ppa_directions
            }
            if (_profile_data.ppa_directions) {
              corpMemberPPALocation.address = _profile_data.ppa_address
            }
            
          } else {
            let _locationUpdate = await Location.create({
              directions: _profile_data.ppa_directions,
              address: _profile_data.ppa_address,
            })
  
            // update location if the corp member's ppa has location
            let __ppaUpdate = await _ppaUpdate.setLocation(_locationUpdate)
  
          }
        } else {
          let _ppaUpdate = await PPA.create({
            name: _profile_data.name_of_ppa,
            type_of_ppa: _profile_data.type_of_ppa
          }, {
            returning: PPA.getAllActualAttributes()
          })

          let ppaUpdate = await _corpMemberUpdate.setPPA(_ppaUpdate)

          let _locationUpdate = await Location.create({
            directions: _profile_data.ppa_directions,
            address: _profile_data.ppa_address,
          })

          // update location if the corp member's ppa has location
          let __ppaUpdate = await _ppaUpdate.setLocation(_locationUpdate)

          console.log('updated ppa profile', ppaUpdate);

          console.log('updated ppa profile', __ppaUpdate);
        }
        

        try {
          const __model = CorpMember
          for (let assoc of Object.keys(__model.associations)) {
            for (let accessor of Object.keys(__model.associations[assoc].accessors)) {
              console.log(__model.name + '.' + __model.associations[assoc].accessors[accessor]+'()');
            }
          }


          const ___model = PPA
          for (let assoc of Object.keys(___model.associations)) {
            for (let accessor of Object.keys(___model.associations[assoc].accessors)) {
              console.log(___model.name + '.' + ___model.associations[assoc].accessors[accessor]+'()');
            }
          }
        } catch (error) {
          console.error('trying to get assocs', error);
        }

        // checking if it updated:
        
        

        // console.log('updated profile PPA', corpMemberPPAUpdate);
        // for (var key in _profile_data) {
        //   req.session.corper[key] = _profile_data[key]
        // }

        // if (_profile_data.newstatecode) {
        //   req.session.corper.statecode = _profile_data.newstatecode.toUpperCase();
        // }

        res.sendStatus(201) // sending a 'Created' response ... not 200 OK response
        // .redirect(result); // no need to redirect, just send status code
        

      })
    
      return req.pipe(busboy)
    },

    async savePushSubscription (req, res) { // Busboy doesn't support json https://github.com/mscdex/busboy/issues/125#issuecomment-237715028
      console.log('oh well, here', req.body);

      // it would be good practice to make sure the payload has all the required data
      // const subscriptionObject = {
      //   endpoint: pushSubscription.endpoint,
      //   keys: {
      //     p256dh: pushSubscription.p256dh, // getKeys is not a function
      //     auth: pushSubscription.auth
      //   }
      // };
      

      let corpMemberUpdate = await CorpMember.update(
        {
          pushSubscriptionStringified: req.body
        }
        ,{
          where: {
            statecode: req.session.corper.statecode
          }
        }
        ,{
          // returning: true
        }
      )
      

      
      try {
        const __model = CorpMember
        for (let assoc of Object.keys(__model.associations)) {
          for (let accessor of Object.keys(__model.associations[assoc].accessors)) {
            console.log(__model.name + '.' + __model.associations[assoc].accessors[accessor]+'()');
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
      

    },

    createAlert(req, res) {
      const busboy = new Busboy({
        headers: req.headers,
        limits: { // set fields, fieldSize, and fieldNameSize later (security)
          files: 12, // don't upload more than 12 media files
          fileSize: 24 * 1024 * 1024 // 24MB
        }
      });
    
      let _alert_data = {
        statecode: req.session.corper.statecode,
        rooms: []
      };

      busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, transferEncoding, mimetype) {
        switch (fieldname) {
          // for accommodation
          case 'alert-accommodation-rooms':
            _alert_data['rooms'].push(val)
            break;
          case 'alert-accommodation-min-price':
            _alert_data['minPrice'] = val;
            break;
          case 'alert-accommodation-max-price':
            _alert_data['maxPrice'] = val;
            break;
          case 'alert-accommodation-type':
            _alert_data['accommodationType'] = val;
            break;
          // for sale
          case 'alert-sale-item-name':
            _alert_data['itemname'] = val;
            break;
          case 'alert-sale-min-price':
            _alert_data['minPrice'] = val;
            break;
          case 'alert-sale-max-price':
            _alert_data['maxPrice'] = val;
            break;

          // for both ?? [on the finish event, we'll check to see if all the accommodation input were filled, if yes, then create accommodation alert. Can do same for sales too. Can happen for both.]
          case 'type':
            _alert_data['type'] = val;
            break;
          default: // for things like statecode
            _alert_data[fieldname] = val; // inspect(val); // seems inspect() adds double quote to the value
            break;
        }

        /**
         * alert data {
              statecode: 'AB/20A/1234',
              rooms: 'Sitting room,Bathroom,Dining room',
              type: 'accommodation',
              accommodationType: 'Flat',
              minPrice: '1500',
              maxPrice: '7800'
            }


            id: 4,
            statecode: 'AB/20A/1234',
            rooms: 'Sitting room,Kitchen,Dining room',
            type: 'accommodation',
            accommodationType: 'Self contain',
            minPrice: 4000,
            maxPrice: 18000,
            updatedAt: 2021-08-02T06:58:25.806Z,
            createdAt: 2021-08-02T06:58:25.806Z,
            itemname: null,
            note: null,
            locationId: null
         */
        
        console.warn(fieldname, val, fieldnameTruncated, valTruncated, transferEncoding, mimetype);
      });

      busboy.on('finish', function () {
        _alert_data.rooms = _alert_data.rooms.toString()
        console.log("alert data", _alert_data);

        Alert
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
    },


    getPosts(req, res) {
      console.log("??????? req.query:", req.query);
      res.setHeader('Content-Type', 'application/json');
      Sale.findAll({ // also add PPA
        where: {
            itemname: {
                [Op.substring]: req.query.q, // hmmm...
            },
            ... (req.query.s && {
                statecode: {
                    [Op.substring]: req.query.s.substring(0, 2),
                }
            })
        },
        order: [
            ['createdAt', 'ASC']
        ],
        include: [
            {
                model: Media,
                as: 'saleMedia',
                
            },
            {
                model: CorpMember,
                as: 'saleByCorper',
                attributes: CorpMember.getSafeAttributes()
            }
        ]
    })
    .then(_sales => {
        console.log("\n\n\n\n\n\ndid we get corp member's Sales?", _sales);
        Accommodation.findAll({ // also add PPA
            where: {
              [Op.or]: [
                {
                  accommodationType: {
                      [Op.substring]: req.query.q,
                  }
                },
                // ...
              ],
              
              ... (req.query.s && {
                  statecode: {
                      [Op.substring]: req.query.s.substring(0, 2),
                  }
              })
            },
            order: [
                ['createdAt', 'ASC']
            ],
            include: [
                {
                    model: Media,
                    as: 'accommodationMedia',
                },
                {
                    model: CorpMember,
                    as: 'accommodationByCorper',
                    attributes: CorpMember.getSafeAttributes(), // isn't bringing the other _location & service state
                },
                {
                    model: Location,
                }
            ],
            attributes: Accommodation.getAllActualAttributes()
        }).then(_accommodations => {
            console.log("\n\n\n\n\n\ndid we get corp member's Accommodation?", _accommodations);
            // combine both ?? sort by
            let _sales_accommodations = _sales.concat(_accommodations);
            _sales_accommodations.sort((firstEl, secondEl) => { firstEl.createdAt - secondEl.createdAt });
            
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
              /* if (thisisit.data[ngstates.states_long[(ngstates.states_short.indexOf(ele.statecode.substring(0,2)))]]) {
                thisisit.data[ngstates.states_long[(ngstates.states_short.indexOf(ele.statecode.substring(0,2)))]].push(ele)
              } else {
                thisisit.data[ngstates.states_long[(ngstates.states_short.indexOf(ele.statecode.substring(0,2)))]] = [ele]
              } */

              if (ngstates.states_long[(ngstates.states_short.indexOf(_post.statecode.substring(0,2)))] in thisisit.data) {
                thisisit.data[ngstates.states_long[(ngstates.states_short.indexOf(_post.statecode.substring(0,2)))]].push(_post)
              } else {
                thisisit.data[ngstates.states_long[(ngstates.states_short.indexOf(_post.statecode.substring(0,2)))]] = [_post]
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
  

    },


    async searchPosts(req, res) {

      let _accommodations = await Accommodation.findAll()
      let _sales = await Sale.findAll()
      let result = { _accommodations, _sales }

      // TODO, locations (and PPAs) // how do we filter PPAs
      if (req.query.type == 'accommodation') {
        result._accommodation = await Accommodation.findOne({
          where: {
            id: req.query.id
          }
        })
      } else if (req.query.type == 'sale') {
        result._sale = await Sale.findOne({
          where: {
            id: req.query.id
          }
        })
      } else if (req.query.type == 'location') {
        result._location = await Location.findOne({
          where: {
            id: req.query.id
          }
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
}