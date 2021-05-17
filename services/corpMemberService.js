const CorpMember = require('../models').CorpMember
const Chat = require('../models').Chat
const { Op } = require("sequelize");
const helpers = require('../utilities/helpers')
const jwt = require('jsonwebtoken')

const auth = require('../helpers/auth')
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
                console.log('======------------>');
                // res.setHeader('Set-Cookie', 'name=value')
                res.cookie('_online', token, cookieOptions)
                res.status(200).redirect(req.body.statecode.toUpperCase());
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
            message_to: req.session.corper.statecode.toUpperCase(), // do we need .toUpperCase() ?
            message_sent: false,
            message: {
              [Op.not]: null
            }
          }
        })
        .then(result => {
          console.log('what is this', req.session);
          res.set('Content-Type', 'text/html');
          res.render('pages/account', {
            statecode: req.session.corper.statecode.toUpperCase(),
            batch: req.params['3'],
            total_num_unread_msg: result.dataValues,
            ...req.session.corper
          });
        }, reject => {
          console.log('why TF?!', reject);

          res.set('Content-Type', 'text/html');
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
    }
}