const Sale = require('../models').Sale
const Media = require('../models').Media
const CorpMember = require('../models').CorpMember
const helpers = require('../utilities/helpers')
const Busboy = require('busboy');
const ggle = require('../helpers/uploadgdrive');
const socket = require('../sockets/routes')
const ngplaces = require('../utilities/ngstates')
inspect = require('util').inspect;

module.exports = {
    deleteSale(req, res) {
        
      return Sale.destory({
        where: {
          id: req.body.id, // saleId ?
          statecode: req.session.corper.statecode.toUpperCase() 
        }
      })
      .then(_result => res.status(200).send(_result))
      .catch(error => res.status(400).send(error));
    },
    /**
     * creates a new sale post
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @returns http status code
     */
    create(req, res, next) {

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
          console.error('the file was too large... nope');
          get = false;
          // don't listen to the data event anymore
          /* filestream.off('data', (data) => { // doesn't work
            console.log('should do nothing. what\'s data?', data)
          }) */
    
          // how should we send a response if one of the files/file is invalid [too big or not an accepted file type]?
        });
    
        if (filename !== '' && !helpers.acceptedfiles.includes(mimetype)) { // if mimetype is '' or undefined, it passes
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
    
              // console.log('upload File Id: ', file.data.id); // save to db
              // console.log('File: ', file);
              _media.push(file.data.id)
    
            }, function (err) {
              // Handle error
              console.error(err);
            }
          ).catch(function (err) {
            console.error('some other error ??', err)
          }).finally(() => {
            // console.log('upload finally')
          });
          uploadPromise.push(up)
        }
    
        // https://stackoverflow.com/questions/26859563/node-stream-data-from-busboy-to-google-drive
        // https://stackoverflow.com/a/26859673/9259701
        filestream.resume() // must always be last in this callback else server HANGS
    
      });
    
      busboy.on('field', function (fieldname, val, fieldnameTruncated, valTruncated, transferEncoding, mimetype) {
        // console.log('Field [' + fieldname + ']: value: ' + inspect(val));
        
        // should we do like we did for accommodation ?? ...yess , we'll check too
        
        _text[fieldname] = val; // inspect(val); // seems inspect() adds double quote to the value
        console.warn('fielddname Truncated:', fieldnameTruncated, valTruncated, transferEncoding, mimetype);
      });
    
      // answer this question: https://stackoverflow.com/questions/26859563/node-stream-data-from-busboy-to-google-drive
    
      busboy.on('finish', async function () {
        // console.log('Done parsing form!', _text, _media);
        // res.writeHead(303, { Connection: 'close', Location: '/' });
        // res.end();
    
        /**
         * 
         * if _media and _text are both not empty, then boardcast accordingly
         * 
         * if _media is empty & _text is not, just boardcast text,
         * of course _text is NOT EMPTY, it must never be empty
         * 
         * 
         * Sale.getCorpMember()
            Sale.setCorpMember()
            Sale.createCorpMember()
            Sale.getMedium()
            Sale.setMedium()
            Sale.createMedium()
         */
        if (!helpers.isEmpty(_text) && !helpers.isEmpty(uploadPromise)) {
          await Promise.all(uploadPromise);
          // console.log('what\'s _text?', _text)


          // ===> https://github.com/sequelize/sequelize/issues/3807
          
          /* const _media_to_save = await Media.create({
            urls: (_media.length > 0 ? _media.toString() : _text.mapimage ? _text.mapimage : ''), // deal with mapimage later
            // altText: '', // add later
          });
          const _sale_to_save = await Sale.create({
            // mediaId: _media_to_save.id,
            statecode: req.session.corper.statecode,
            type: (_text.type ? _text.type : "sale"),
            text: _text.text,
            itemname: _text.itemname,
            price: (_text.price ? _text.price : ""),
            location: req.session.corper.location,
            post_time: _text.post_time
          }, {
            include: [{ all: true }], // [{ all: true, nested: true }]
          });
          await _sale_to_save.setMedium(_media_to_save)
          let _media_to_send = await _sale_to_save.getMedium() // can't call .toJSON()
          let f = _sale_to_save.reload();
          let jkl = _sale_to_save.get({
            plain: true
          })
          console.log(f, "\n\n\n\n ===??++++ ///", jkl); */

          const _sale_to_save = await Sale.create({
            statecode: req.session.corper.statecode,
            text: _text.text,
            itemname: _text.itemname,
            price: _text.price,
            location: req.session.corper.location,
            saleMedia: {
              urls: (_media.length > 0 ? _media.toString() : _text.mapimage ? _text.mapimage : ''), // deal with mapimage later
              // altText: '', // add later
            }
          }, {
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
          });

          // https://stackoverflow.com/a/55113682/9259701 & https://github.com/sequelize/sequelize/issues/4970#issuecomment-161712562
          const __model = Sale
          for (let assoc of Object.keys(__model.associations)) {
            for (let accessor of Object.keys(__model.associations[assoc].accessors)) {
              console.log(__model.name + '.' + __model.associations[assoc].accessors[accessor]+'()');
            }
          }

          let _media_to_send = await _sale_to_save.getSaleMedia()

          // well, no need for media here
          _sale_to_save.saleByCorper = await _sale_to_save.getSaleByCorper(); // role eyes ...fix this for sequelize ... it should auto do it ...
          _sale_to_save.dataValues.saleByCorper = await _sale_to_save.getSaleByCorper();
          
          // console.log("\n associated media is", _media_to_send);
              res.sendStatus(200);
              console.log("\n\n\n\nafter saving post\n\n:", _sale_to_save, "\n\n then the media", _media_to_send);
              // once it saves in db them emit to other users
              socket.of('/user').to(req.session.corper.statecode.substring(0, 2)).emit('boardcast message', {
                to: 'be received by everyone else',
                post: [_sale_to_save.toJSON()]
                  /* {
                  statecode: req.session.corper.statecode,
                  location: req.session.corper.location,
                  media: false,
                  post_time: _text.post_time,
                  type: _text.type,
                  mapdata: (_text.mapimage ? _text.mapimage : ''),
                  text: _text.text,
                  itemname: _text.itemname,
                  price: (_text.price ? _text.price : ''),
                  firstname: _text.firstname,
                  picture_id: req.session.corper.picture_id
                } */
              });

          
        } else if (!helpers.isEmpty(_text) && helpers.isEmpty(uploadPromise)) {
          
    
          const _sale_to_save = await Sale.create({
            statecode: req.session.corper.statecode,
            type: (_text.type ? _text.type : "sale"),
            text: _text.text,
            itemname: _text.itemname,
            price: (_text.price ? _text.price : ""),
            location: req.session.corper.location,
            post_time: _text.post_time
          })
         
            console.log('\n\nthe\nsale\nwe\nare\nsending', resolve);
            // then status code is good
            res.sendStatus(200);

            // and no need for media here, since it's not included in the create method ... cause it's just gonna be null if we include it
            _sale_to_save.saleByCorper = await _sale_to_save.getSaleByCorper();
            _sale_to_save.dataValues.saleByCorper = await _sale_to_save.getSaleByCorper();

    
            // once it saves in db them emit to other users
            socket.of('/user').to(req.session.corper.statecode.substring(0, 2)).emit('boardcast message', {
              to: 'be received by everyoneELSE',
              post: [resolve]
              /* {
                statecode: req.session.corper.statecode,
                location: req.session.corper.location,
                media: (_media.length > 0 ? _media : false), // need to change this, just post _media, if it's empty, we'll check in frontend
                post_time: _text.post_time,
                type: _text.type,
                itemname: _text.itemname,
                mapdata: (_text.mapimage ? _text.mapimage : ''),
                text: _text.text,
                age: moment(Number(_text.post_time)).fromNow(),
                price: (_text.price ? _text.price : ''),
                firstname: _text.firstname,
                picture_id: req.session.corper.picture_id
              } */
            });
          
        }
      });
    
      // handle post request, add data to database... do more
    
      return req.pipe(busboy)
    },
}