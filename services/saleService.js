const db = require("../models");
const helpers = require("../utilities/helpers");
const busboy = require("busboy");
const ggle = require("../helpers/uploadgdrive");
const socket = require("../sockets/routes");
const ngplaces = require("../utilities/ngstates");
inspect = require("util").inspect;
const path = require("path");
const { uploadFile } = require("../helpers/ftp-upload");
const _FILENAME = path.basename(__filename);
const fs = require("fs");
const ftp = require("basic-ftp");
const crypto = require("crypto");

exports.deleteSale = (req, res) => {
  const _FUNCTIONNAME = "updateProfilePhoto";
  console.log("hitting", _FILENAME, _FUNCTIONNAME);

  return db.Sale.destroy({
    where: {
      id: req.body.id, // saleId ?
      state_code: req.session.corper.state_code.toUpperCase(),
    },
  })
    .then((_result) => res.status(200).send(_result))
    .catch((error) => res.status(400).send(error));
};

/**
 * creates a new sale post
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @returns http status code
 */
exports.create = async (req, res, next) => {
  const _FUNCTIONNAME = "create";
  console.log("hitting", _FILENAME, _FUNCTIONNAME);

  try {
    const _busboy = busboy({
      headers: req.headers,
      limits: {
        // set fields, fieldSize, and fieldNameSize later (security)
        files: 12, // don't upload more than 12 media files
        fileSize: 20 * 1024 * 1024, // 6MB
      },
    });
    /**
     * @type string[]
     */
    let _media = []; // good, because we re-initialize on new post
    let _text = {};
    let uploadPromise = [];
    let get = true;

    const client = new ftp.Client();
    // client.ftp.verbose = true; // maybe only set on prod?

    const ftpOptions = {
      host: process.env.FTP_SERVER,
      user: process.env.FTP_USERNAME,
      password: process.env.FTP_PASSWORD,
      secure: process.env.NODE_ENV === "production",
    };
    if (client.closed) {
      await client.access(ftpOptions);
    }

    _busboy.on(
      "file",
      async function handleSalesFiles(fieldname, filestream, info) {
        // filename, transferEncoding, mimetype
        const { filename, encoding, mimeType } = info;

        const fileExtension = filename.split(".").pop();

        const new_file_name =
          crypto.randomBytes(20).toString("hex") + `.${fileExtension}`;

        const saveTo = path.join("./randoms", `busboy-uploads`, new_file_name);
        filestream.pipe(fs.createWriteStream(saveTo)).on("close", (err) => {
          console.log("done writing file!!!");
        });
        console.log("got a file", filename);

        /**
         * FTP upload only works if you use here. Before the event listeners.
         */
        // const _url = await uploadFile(filestream, filename)

        _media.push(new_file_name);

        // there's also 'limit' and 'error' events https://www.codota.com/code/javascript/functions/busboy/busboy/on
        filestream.on("limit", function () {
          console.error("the file was too large... nope");
          get = false;
          // don't listen to the data event anymore
          /* filestream.off('data', (data) => { // doesn't work
          console.log('should do nothing. what\'s data?', data)
        }) */

          // how should we send a response if one of the files/file is invalid [too big or not an accepted file type]?
        });

        if (filename && !helpers.acceptedfiles.includes(mimeType)) {
          // if mimetype is '' or undefined, it passes
          console.log("we don't accept non-image files... nope");
          get = false;
          // don't listen to the data event
          /* filestream.off('data', (data) => { // DOESN'T WORK!!!
          console.log('should do nothing. what\'s data?', data)
        }) */
        }

        /* filestream.on('readable', (what) => { // don't do this, unless, MABYE filestream.read() is called in the callback
          console.log('\ncurious what happens here\n', what)
        }) */

        filestream.on("data", function (data) {
          if (!get) {
          }
          console.log("File [" + fieldname + "] got " + data.length + " bytes");
        });

        filestream.on("end", function (err) {
          // if we listened for 'file', even if there's no file, we still come here
          // so we're checking if it's empty before doing anything.
          /* console.log('readabe?///// ?', filestream.read()) // filestram.read() is always null ... */

          console.log("File [" + fieldname + "] Finished. Got " + "bytes");
          if (err) {
            console.log("err in busboy file end", err);
          }
        });

        filestream.on("close", () => {
          console.log(`File [${filename}] done`);
        });

        // this is not a good method

        /**
         * One thing you might be able to try is
         * to read 0 bytes from the stream first
         * and see if you get the appropriate 'end' event
         * or not (perhaps on the next tick)
         * */
        if (filename && helpers.acceptedfiles.includes(mimeType)) {
          // filename: 1848-1844-1-PB.pdf, encoding: 7bit, mimetype: application/pdf
          /**
           * Google Drive upload can work in here.
           */
          // ggle.uploadFile(filestream, filename)
        }

        // https://stackoverflow.com/a/26859673/9259701
        filestream.resume(); // must always be last in this callback else server HANGS
      }
    );

    _busboy.on("field", function handleSalesFields(fieldname, val, info) {
      /**
       * would skip 0s, but we don't need zeros
       *
       * null gets converted to string. So (val !== 'null') is a hotfix
       */
      if (val && val !== "null") {
        _text[fieldname] = val; // seems inspect() adds double quote to the value
      }
      console.log("Field [" + fieldname + "]: value: " + inspect(val));
      console.log("raw value:", val);

      // should we do like we did for accommodation ?? ...yess , we'll check too

      console.warn("fielddname info:", info);
    });

    // answer this question: https://stackoverflow.com/questions/26859563/node-stream-data-from-busboy-to-google-drive

    _busboy.on("close", async function doneHandlingSalesFieldsAndFiles() {
      console.log("\nDone parsing form!", _text, _media);
      // res.writeHead(303, { Connection: 'close', Location: '/' });
      // res.end();

      let _sale_to_save;
      if (uploadPromise.length) {
        await Promise.all(uploadPromise);
      }

      console.log("what's _text?", _text);

      // https://github.com/sequelize/sequelize/issues/3807

      /* const _media_to_save = await db.Media.create({
        urls: (_media.length > 0 ? _media.toString() : _text.mapimage ? _text.mapimage : ''), // deal with mapimage later
        // alt_text: '', // add later
      });
      const _sale_to_save = await db.Sale.create({
        // media_id: _media_to_save.id,
        state_code: req.session.corper.state_code,
        type: (_text.type ? _text.type : "sale"),
        text: _text.text,
        item_name: _text.item_name,
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

      let new_sale = {
        corp_member_id: req.session.corper.id,
        text: _text.text,
        item_name: _text.item_name,
        price: _text.price,
      };
      if (_text?.minimum_price) {
        new_sale.minimum_price = parseInt(_text.minimum_price);
      }
      if (_media.length > 0) {
        // Upload all the files.
        let __m = [];
        for (let index = 0; index < _media.length; index++) {
          const element = _media[index];

          const tem_path = "./randoms/busboy-uploads/" + element;
          const _url = await uploadFile(tem_path, element);
          __m.push(_url);
          console.log("processed upload", _url);

          // delete the recently uploaded file from (temp) disk
          fs.unlink(tem_path, (err) => {
            if (err) console.error("err deleting file", err);
            console.log(tem_path, "was deleted");
          });
        }

        new_sale.Media = __m.map((e) => ({ urls: e }));
        // TODO: add alt_text later
        // TODO: delete the uploaded files from memory
      }
      /**
       * Can only include Media cause it was created along side it.
       */
      _sale_to_save = await db.Sale.create(new_sale, {
        include: [{ model: db.Media }],
      });

      if (uploadPromise.length) {
        let _media_to_send = await _sale_to_save.getSaleMedia();

        // well, no need for media here
        // _sale_to_save.saleByCorper = await _sale_to_save.getSaleByCorper(); // role eyes ...fix this for sequelize ... it should auto do it ...
        // _sale_to_save.dataValues.saleByCorper = await _sale_to_save.getSaleByCorper();

        console.log("\n\n then the media", _media_to_send);
      }

      res.status(200).json({ data: _sale_to_save }); // for test // [will revert to] res.sendStatus(200);
      console.log("\n\n\n\nafter saving post\n\n:", _sale_to_save);
      // once it saves in db them emit to other users
      socket
        .of("/corp-member")
        .to(req.session.corper.state_code.substring(0, 2))
        .emit("boardcast message", {
          to: "be received by everyone else",
          post: [_sale_to_save.toJSON()],
          /* {
            state_code: req.session.corper.state_code,
            location: req.session.corper.location,
            media: false,
            post_time: _text.post_time,
            type: _text.type,
            mapdata: (_text.mapimage ? _text.mapimage : ''),
            text: _text.text,
            item_name: _text.item_name,
            price: (_text.price ? _text.price : ''),
            first_name: _text.first_name,
            picture_id: req.session.corper.picture_id
          } */
        });

      req._sale_to_save = _sale_to_save; // for the next middleware (Alerts Service)
      next();
    });

    // handle post request, add data to database... do more

    req.pipe(_busboy);
  } catch (error) {
    console.log("Error in", _FILENAME, _FUNCTIONNAME);
    console.error(error);
    res.sendStatus(500);
  }
};

exports.update = (req, res) => {
  const _FUNCTIONNAME = "update";
  console.log("hitting", _FILENAME, _FUNCTIONNAME);

  const _busboy = busboy({
    headers: req.headers,
    limits: {
      // set fields, fieldSize, and fieldNameSize later (security)
      files: 12, // don't upload more than 12 media files
      fileSize: 24 * 1024 * 1024, // 24MB
    },
  });

  _sale_data = {};
  _busboy.on("field", function (fieldname, val, info) {
    // console.log('Field [' + fieldname + ']: value: ' + inspect(val));

    _sale_data[fieldname] = inspect(val); // seems inspect() adds double quote to the value

    console.warn(fieldname, val, info);
  });

  _busboy.on("close", async function () {
    console.log("updating sale");
    db.Sale.update(
      {
        ..._sale_data,
      },
      {
        where: {
          id: _sale_data.id,
        },
      }
    )
      .then(
        (result) => {
          console.log("sale update", result);
          res.sendStatus(200);
        },
        (reject) => {
          console.error("update sale reject err what happened?", reject);
          res.sendStatus(500); // [e]dit=[y]es|[n]o
        }
      )
      .catch((err) => {
        // we should have this .catch on every query
        console.error(
          "update sales cath err our system should've crashed:",
          err
        );
        res.sendStatus(502); // we should tell you an error occured
      });
  });

  return req.pipe(_busboy);
};
