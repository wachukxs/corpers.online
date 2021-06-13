const CorpMember = require('../models').CorpMember
const Chat = require('../models').Chat
const PPA = require('../models').PPA
const Accommodation = require('../models').Accommodation
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
        return CorpMember
          .create(req.body)
          .then(result => {
            console.log('re:', result);
            req.session.corper = result.dataValues
            // send welcome email
            helpers.sendSignupWelcomeEmail(req.body.email, req.body.firstname, result.dataValues.servicestate)
            jwt.sign({statecode: req.body.statecode.toUpperCase()}, process.env.SESSION_SECRET, (err, token) => {
              if (err) {
                console.error('sign up err', err)
                throw err // ? can we throw
              } else {
                console.log('======------------>signed up ...done jwt and', req.session.corper);
                // res.setHeader('Set-Cookie', 'name=value')
                
                // problem here https://stackoverflow.com/questions/49476080/express-session-not-persistent-after-redirect
                
                res.cookie('_online', token, cookieOptions)
                  .redirect(req.body.statecode.toUpperCase());
              }
            })
          }, error => {
            console.log('CorpersSignUp() error happened', error);
            console.log('----> error happened', error.errors[0], error.fields);

            
            
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
            console.log('\n\n\n// again Tables in database','==========================');
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
            ...req.session.corper
          });
        }, reject => {
          console.log('why TF?!', reject);

          // res.set('Content-Type', 'text/html')
          res.render('pages/account', {
            statecode: req.session.corper.statecode.toUpperCase(),
            servicestate: req.session.corper.servicestate, // isn't this Duplicated
            batch: req.params['3'],
            name_of_ppa: req.session.corper.name_of_ppa,
            total_num_unread_msg: 0, // really ??? Zero?
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
          [Op.or]: [
            { email: req.body.statecode },
            { statecode: req.body.statecode.toUpperCase() }, 
          ]
        }
      }).then(
        result => { // result is null if not statecode or email exists ... also tell when it's statecode or email that doesn't exist
        console.log('\n\n\n\tlogin we good', result);
        if (result && result.dataValues.password === req.body.password) { // password match
          req.session.corper = result.dataValues;
        // req.session.corper.location = result.response[0].servicestate + (result.response[0].city_town ? ', ' + result.response[0].city_town : ''); // + (results1[0].region_street ? ', ' + results1[0].region_street : '' )
        // req.session.loggedin = true;
  
        jwt.sign({statecode: req.body.statecode.toUpperCase()}, process.env.SESSION_SECRET, (err, token) => {
          if (err) throw err // no throw of errors
          else {
            // res.setHeader('Set-Cookie', 'name=value')
            res.cookie('_online', token, cookieOptions)
            console.log('we\'re moving', req.session);
            /* req.session.save(function(err) { // hate this
              // session saved
            }) */
            res.status(200).redirect(req.body.statecode.toUpperCase());
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
            corper: {},
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
              },
              {
                model: Accommodation,
                order: [
                    ['createdAt', 'ASC']
                ],
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
              attributes: PPA.getAllActualAttributes() // hot fix (problem highlighted in ./models/ppa.js) -- > should create a PR to fix it ... related to https://github.com/sequelize/sequelize/issues/13309
            }).then(_all_ppas => {
                  console.log('all ppas', _all_ppas); // uncomment to check later
                  _info.ppas = _all_ppas;
                  console.log('we good good on profile', _info);
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

    }
}