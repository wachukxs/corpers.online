const db = require('../models')
const helpers = require('../utilities/helpers')
const Busboy = require('busboy');
const ggle = require('../helpers/uploadgdrive');
const socket = require('../sockets/routes')
const ngplaces = require('../utilities/ngstates')
const auth = require('../helpers/auth')
const path = require('path');
const _FILENAME = path.basename(__filename);

// these are repeating in other services, they should be global.
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


/**
 * needs work
 * @param {*} req 
 * @param {*} res 
 * @returns http status code
 */
exports.delete = (req, res) => {
  const _FUNCTIONNAME = 'delete'
  console.log('hitting', _FILENAME, _FUNCTIONNAME);
  return db.Accommodation.destory({
    where: {
      id: req.body.id, // accommodationId ?
      statecode: req.session.corper.statecode.toUpperCase()
    }
  })
    .then(_result => res.status(200).send(_result))
    .catch(error => res.status(400).send(error));
}

/**
 * WHY IS TENURE == Roommate ??? can't we do better ??
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
exports.create = (req, res, next) => {
  const _FUNCTIONNAME = 'create'
    console.log('hitting', _FILENAME, _FUNCTIONNAME);
    
  try {
    
    const busboy = new Busboy({
      headers: req.headers,
      limits: { // set fields, fieldSize, and fieldNameSize later (security)
        files: 12, // don't upload more than 12 media files
        fileSize: 50 * 1024 * 1024 // 50 MB TODO: Review if we really want limit to be 50mb ... seems too high
      }
    });
    let _media = []; // good, because we re-initialize on new post
    let _text = {};
    _text.availableRooms = []; // hot fix
    let uploadPromise = [];
    let get = true;
  
    busboy.on('file', function handleAccommodationFiles(fieldname, filestream, filename, transferEncoding, mimetype) {
  
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
            console.error('from where ?? google drive', err);
  
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
  
    }, (error) => {
      console.error('maybe some error that might happen', error);
    });
  
    busboy.on('field', function handleAccommodationFields(fieldname, val, fieldnameTruncated, valTruncated, transferEncoding, mimetype) {
      console.log('Field [' + fieldname + ']: value: ' + val);
      // this if block is an hot fix
      _text[fieldname] = val;
      console.warn('fielddname Truncated:', fieldnameTruncated, valTruncated, transferEncoding, mimetype);
    });
  
    // answer this question: https://stackoverflow.com/questions/26859563/node-stream-data-from-busboy-to-google-drive
  
    busboy.on('finish', async function doneHandleAccommodationFieldsAndFiles() {
      console.log('Done parsing form!', _text, " \n\n media", _media, " \n\n upload promise", uploadPromise);
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
  
      _text.availableRooms = _text.availableRooms.toString(); // so we can save ... may optimize later
  
  
      console.log(db.CorpMember.getSafeAttributes());
  
      const __model = db.Accommodation
      for (let assoc of Object.keys(__model.associations)) {
        for (let accessor of Object.keys(__model.associations[assoc].accessors)) {
          console.log(__model.name + '.' + __model.associations[assoc].accessors[accessor] + '()');
        }
      }
  
      let _accommodation_to_save;
      if (!helpers.isEmpty(_text) && helpers.isEmpty(uploadPromise)) {
        console.log('what\'s _text?', _text)
  
        console.log('\n\ndo we have statecode', req.session.corper.statecode);
  
        /***
         * Heavy fix for Sequelize ...if you're chaining (not using await), you can't create models with include ...the result doesn't have the included data.
         * 
         * for instance if Accommodation.create() is a chained promise with .then().catch(), it creates fine if there's no nested model object ...
         * but it won't create properly if there's a nested object.
         * 
         * It should have better error reporting when using any of a model's set...() method without providing arguments/parameters
         * 
         * It should filter out object id needs when creating a new model, and ignore the rest (does that already I think)
         */
  
        _accommodation_to_save = await db.Accommodation.create({
          ..._text,
          statecode: req.session.corper.statecode,
        }, {
          include: [
            {
              model: db.Media,
              as: 'accommodationMedia', // ideally we shouldn't do this ...but sequlize says we must ...will create an OS PR for it
            },
            {
              model: db.CorpMember,
              as: 'accommodationByCorper',
              attributes: db.CorpMember.getSafeAttributes()
            }
          ]
        })
  
        /***
         * Seems if we don't call this, the included nested models won't be included in the result
         */
        let _from_corper = await _accommodation_to_save.getAccommodationByCorper()
        _accommodation_to_save.accommodationByCorper = await _accommodation_to_save.getAccommodationByCorper()
        _accommodation_to_save.dataValues.accommodationByCorper = await _accommodation_to_save.getAccommodationByCorper() // (await _accommodation_to_save.getAccommodationByCorper()).toJSON() works too
  
  
        // then status code is good
        res.sendStatus(200);
  
        console.log('what acc we are now sedning to front end', _accommodation_to_save.toJSON());
  
        // once it saves in db them emit to other users
        socket.of('/user').emit('boardcast message', { // or 'accommodation'
          to: 'be received by everyoneELSE',
          post: [_accommodation_to_save.toJSON()]
        });
  
  
      } else if (!helpers.isEmpty(_text) && !helpers.isEmpty(uploadPromise)) {
        await Promise.all(uploadPromise);
  
  
        console.log('\n\ndo we have statecode', req.session.corper.statecode);
  
        _accommodation_to_save = await db.Accommodation.create( // causes error for virtual fields when returning values : SequelizeDatabaseError: column "type" does not exist
          {
            statecode: req.session.corper.statecode,
            ..._text,
            accommodationMedia: {
              urls: (_media.length > 0 ? _media.toString() : _text.mapimage ? _text.mapimage : ''), // deal with mapimage later
              // altText: '', // add later
            },
            // Location: {
            //   address: _text.address,
            //   directions: _text.directions
            // }
          }
          , {
            include: [
              {
                model: db.Media,
                as: 'accommodationMedia', // ideally we shouldn't do this ...but sequlize says we must ... maybe ... might create an OS PR for it
              },
              {
                model: db.CorpMember,
                as: 'accommodationByCorper',
                attributes: db.CorpMember.getSafeAttributes()
              },
              {
                model: db.Location,
              }
            ],
            returning: db.Accommodation.getCreationAttributes()
          },)
  
        // since it's a new accommodation, no need to check if it already has accommodation:
  
        // NO NEED ANYMORE
        // we do this, so we can associate the accommodationId
        console.log('_accommodation_to_save.id \n\n', _accommodation_to_save.id);
        await _accommodation_to_save.createLocation({
          address: _text.address,
          directions: _text.directions,
          CorpMemberId: req.session.corper.id,
          accommodationId: _accommodation_to_save.id
        })
  
        let k = (await _accommodation_to_save.getAccommodationMedia()).toJSON();
  
        /// FUCKKK
        _accommodation_to_save.accommodationByCorper = await _accommodation_to_save.getAccommodationByCorper({
          // attributes: db.CorpMember.getSafeAttributes() // shouldn't have to comment out
        })
        _accommodation_to_save.dataValues.accommodationByCorper = await _accommodation_to_save.getAccommodationByCorper()
  
        _accommodation_to_save.Location = await _accommodation_to_save.getLocation()
        _accommodation_to_save.dataValues.Location = await _accommodation_to_save.getLocation()
  
  
        res.sendStatus(200);
  
  
        console.log('what acc we are sedning', _accommodation_to_save, "\n\n\nadddnndd", k);
  
        // once it saves in db them emit to other users
        socket.of('/user').emit('boardcast message', { // or 'accommodation'
          to: 'be received by everyoneELSE',
          post: [_accommodation_to_save.toJSON()]
        });
  
  
      }
  
      req._accommodation_to_save = _accommodation_to_save; // for the next middleware (Alerts Service)
      next()
    });
  
    // handle post request, add data to database... do more
    return req.pipe(busboy)
  } catch (error) {
    console.log('Error in', _FILENAME, _FUNCTIONNAME);
    console.error(error)
    res.sendStatus(500)
  }
}

/**
 * needs work
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */

exports.update = (req, res) => {
  const _FUNCTIONNAME = 'update'
    console.log('hitting', _FILENAME, _FUNCTIONNAME);
  const busboy = new Busboy({
    headers: req.headers,
    limits: { // set fields, fieldSize, and fieldNameSize later (security)
      files: 12, // don't upload more than 12 media files
      fileSize: 24 * 1024 * 1024 // 24MB
    }
  });

  _accommodation_data = {}
  _accommodation_data.availableRooms = []; // hot fix
  busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, transferEncoding, mimetype) {
    console.log('Field [' + fieldname + ']: value: ' + val);

    if (fieldname === 'rooms') {
      _accommodation_data['availableRooms'].push(val)
    } else {
      _accommodation_data[fieldname] = val;
    }
    console.warn(fieldname, val, fieldnameTruncated, valTruncated, transferEncoding, mimetype);
  });

  busboy.on('finish', async function () {
    _accommodation_data.availableRooms = _accommodation_data.availableRooms.toString()
    console.log('we are updating acc?', {
      ..._accommodation_data
    })
    db.Accommodation.update({
      ..._accommodation_data
    }, {
      where: {
        id: _accommodation_data.id
      }
    })
      .then(result => {

        console.log('updated accommodation', result);
        res.sendStatus(200);
      }, reject => {
        console.error('update acc reject what happened?', reject)
        res.sendStatus(500);
      }).catch((err) => { // we should have this .catch on every query
        console.error('update acc, our system should\'ve crashed:', err)
        res.sendStatus(502) // we should tell you an error occured
      })
  })

  return req.pipe(busboy)

}
