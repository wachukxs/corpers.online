const db = require("../models");
const helpers = require("../utilities/helpers");
const busboy = require("busboy");
const ggle = require("../helpers/uploadgdrive");
const { io, IOEventNames } = require("../sockets/routes");
inspect = require("util").inspect;
const path = require("path");
const { uploadFile } = require("../helpers/ftp-upload");
const _FILENAME = path.basename(__filename);
const fs = require("fs");
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

    _busboy.on(
      "file",
      async function handleSalesFiles(fieldName, fileStream, info) {
        const { filename, transferEncoding, mimeType } = info;

        const fileExtension = filename.split(".").pop();

        const new_file_name =
          crypto.randomBytes(20).toString("hex") + `.${fileExtension}`;

        const saveTo = path.join(process.env.TEMP_UPLOAD_PATH, new_file_name);
        console.log("using saveTo", saveTo);

        // there's also 'limit' and 'error' events https://www.codota.com/code/javascript/functions/busboy/busboy/on
        fileStream.on("limit", function () {
          console.error("the file was too large... nope");
          get = false;
          // TODO: don't listen to the data event anymore

          // TODO: how should we send a response if one of the files/file is invalid [too big or not an accepted file type]?
        });

        // https://stackoverflow.com/a/20891472
        fileStream.on("error", function (err) {
          console.log("ERROR:" + err);
          file.resume();
        });

        fileStream.pipe(fs.createWriteStream(saveTo)).on("close", (err) => {
          if (err) {
            console.log("ERRR creating file stream", err);
          } else {
            console.log("done writing file!!!");

            // TODO: upload here??
          }
        });
        console.log("got a file", filename);

        /**
         * FTP upload only works if you use here. Before the event listeners.
         */
        // const _url = await uploadFile(fileStream, filename)

        _media.push(new_file_name);

        if (filename && !helpers.acceptedfiles.includes(mimeType)) {
          // if mimetype is '' or undefined, it passes
          console.log("we don't accept non-image files... nope");
          get = false;
          // don't listen to the data event
        }

        /* fileStream.on('readable', (what) => { // don't do this, unless, MABYE fileStream.read() is called in the callback
          console.log('\ncurious what happens here\n', what)
        }) */

        fileStream.on("end", function (err) {
          // if we listened for 'file', even if there's no file, we still come here
          // so we're checking if it's empty before doing anything.
          /* console.log('readable?///// ?', fileStream.read()) // filestram.read() is always null ... */

          if (err) {
            console.log("err in busboy file end", err);
          } else {
            console.log("File [" + fieldName + "] Finished. Got bytes");
          }
        });

        fileStream.on("close", () => {
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
          // ggle.uploadFile(fileStream, filename)
        }

        // https://stackoverflow.com/a/26859673/9259701
        fileStream.resume(); // must always be last in this callback else server HANGS
      }
    );

    _busboy.on("field", function handleSalesFields(fieldName, val, info) {
      /**
       * would skip 0s, but we don't need zeros
       *
       * null gets converted to string. So (val !== 'null') is a hotfix
       */
      if (val && val !== "null") {
        _text[fieldName] = val; // seems inspect() adds double quote to the value
      }
      console.log("Field [" + fieldName + "]: value: " + inspect(val));
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
        url: (_media.length > 0 ? _media.toString() : _text.mapimage ? _text.mapimage : ''), // deal with mapimage later
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

          const tem_path = path.join(process.env.TEMP_UPLOAD_PATH, element);
          const _url = await uploadFile(tem_path, element);
          __m.push(_url);
          console.log("processed upload", _url);

          // delete the recently uploaded file from (temp) disk
          fs.unlink(tem_path, (err) => {
            if (err) console.error("err deleting file", err);
            console.log(tem_path, "was deleted");
          });
        }

        new_sale.Media = __m.map((e) => ({ url: e }));
        // TODO: add alt_text later
      }
      /**
       * NOTE: Can only include Media cause it was created along side it.
       */
      try {
        _sale_to_save = await db.Sale.create(new_sale, {
          include: [{ model: db.Media }],
        });
      } catch (error) {
        console.log('err creating sale', error);

        return res.status(400).json()
      }

      if (uploadPromise.length) {
        let _media_to_send = await _sale_to_save.getSaleMedia();

        console.log("\n\n then the media", _media_to_send);
      }

      const __sale_to_save = _sale_to_save.toJSON();

      // TODO: try to move this into a hook, populate _sale_to_save itself.
      __sale_to_save.CorpMember = await _sale_to_save.getCorpMember?.({
        attributes: db.CorpMember.getPublicAttributes(),
      });

      // TODO: No need to send the _sale_to_save data back in the response, they'll eventually get it via websockets. We can also save on response size data.
      res.status(200).json({ data: __sale_to_save }); // for test // [will revert to] res.status(200).json(null);
      // console.log("\n\n\n\nafter saving post\n\n:", _sale_to_save);

      // once it saves in db then emit to other users
      io.of("/")
        .to(req.session.corper.state_code.substring(0, 2))
        .emit(IOEventNames.BROADCAST_MESSAGE, {
          to: "be received by everyone else",
          post: [__sale_to_save],
        });

      req._sale_to_save = _sale_to_save; // for the next middleware (Alerts Service)
      next();
    });

    // handle post request, add data to database... do more

    req.pipe(_busboy);
  } catch (error) {
    console.log("Error in", _FILENAME, _FUNCTIONNAME);
    console.error(error);
    res.status(500).json(null);
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
  _busboy.on("field", function (fieldName, val, info) {
    // console.log('Field [' + fieldName + ']: value: ' + inspect(val));

    _sale_data[fieldName] = inspect(val); // seems inspect() adds double quote to the value

    console.warn(fieldName, val, info);
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
          res.status(200).json(null);
        },
        (reject) => {
          console.error("update sale reject err what happened?", reject);
          res.status(500).json(null); // [e]dit=[y]es|[n]o
        }
      )
      .catch((err) => {
        // we should have this .catch on every query
        console.error(
          "update sales cath err our system should've crashed:",
          err
        );
        res.status(502).json(null); // we should tell you an error occured
      });
  });

  return req.pipe(_busboy);
};

exports.bookmarkSale = (req, res) => {
  try {
    const _FUNCTIONNAME = "bookmarkSale";
    console.log("hitting", _FILENAME, _FUNCTIONNAME);
    // TODO: Do validation here.

    if (!req.params?.id || isNaN(parseInt(req.params?.id))) {
      res.status(400).json({ message: "Missing state param, id" });
    }

    console.log("corper id", req.session?.corper?.id);
    // TODO: corp_member_id & sale_id needs to be unique together.
    db.SaleBookmark.create({
      corp_member_id: req.session.corper.id,
      sale_id: parseInt(req.params?.id),
    })
      .then(
        async (result) => {
          res.json({ result });
        },
        (reject) => {
          console.log("what error?", reject);

          if (reject?.original?.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(403).json({
              message: "Item not found"
            });
          }

          res.status(403).json({});
        }
      )
      .catch((reason) => {
        console.log("why did you fail?", reason);
        res.status(403).json({});
      });
  } catch (error) {
    console.log("what error?", error);
    res.status(403).json({});
  }
};

exports.unBookmarkSale = (req, res) => {
  try {
    const _FUNCTIONNAME = "unBookmarkSale";
    console.log("hitting", _FILENAME, _FUNCTIONNAME);
    // TODO: Do validation here.

    if (!req.params?.id || isNaN(parseInt(req.params?.id))) {
      res.status(400).json({ message: "Missing state param, id" });
    }

    console.log("corper id", req.session?.corper?.id);
    // TODO: corp_member_id & sale_id needs to be unique together.
    db.SaleBookmark.destroy({
      where: {
        corp_member_id: req.session.corper.id,
        sale_id: parseInt(req.params?.id),
      }
    })
      .then(
        async (result) => {
          res.json({ result });
        },
        (reject) => {
          console.log("what error?", reject);

          if (reject?.original?.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(403).json({
              message: "Item not found"
            });
          }

          res.status(403).json({});
        }
      )
      .catch((reason) => {
        console.log("why did you fail?", reason);
        res.status(403).json({});
      });
  } catch (error) {
    console.log("what error?", error);
    res.status(403).json({});
  }
};

exports.likeSale = (req, res) => {
  try {
    const _FUNCTIONNAME = "likeSale";
    console.log("hitting", _FILENAME, _FUNCTIONNAME);
    // TODO: Do validation here.

    if (!req.params?.id || isNaN(parseInt(req.params?.id))) {
      res.status(400).json({ message: "Missing state param, id" });
    }

    console.log("corper id", req.session?.corper?.id);
    // TODO: corp_member_id & sale_id needs to be unique together.
    db.SaleLike.create({
      corp_member_id: req.session.corper.id,
      sale_id: parseInt(req.params?.id),
    })
      .then(
        async (result) => {
          res.json({ result });
        },
        (reject) => {
          console.log("what error?", reject);
          
          if (reject?.original?.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(403).json({
              message: "Item not found"
            });
          }
          
          res.status(403).json({});
        }
      )
      .catch((reason) => {
        console.log("why did you fail?", reason);
        res.status(403).json({});
      });
  } catch (error) {
    console.log("what error?", error);
    res.status(403).json({});
  }
};

exports.unLikeSale = (req, res) => {
  try {
    const _FUNCTIONNAME = "unLikeSale";
    console.log("hitting", _FILENAME, _FUNCTIONNAME);
    // TODO: Do validation here.

    if (!req.params?.id || isNaN(parseInt(req.params?.id))) {
      res.status(400).json({ message: "Missing state param, id" });
    }

    console.log("corper id", req.session?.corper?.id);
    // TODO: corp_member_id & sale_id needs to be unique together.
    db.SaleLike.destroy({
      where: {
        corp_member_id: req.session.corper.id,
        sale_id: parseInt(req.params?.id),
      }
    })
      .then(
        async (result) => {
          res.json({ result });
        },
        (reject) => {
          console.log("what error?", reject);
          
          if (reject?.original?.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(403).json({
              message: "Item not found"
            });
          }

          res.status(403).json({});
        }
      )
      .catch((reason) => {
        console.log("why did you fail?", reason);
        res.status(403).json({});
      });
  } catch (error) {
    console.log("what error?", error);
    res.status(403).json({});
  }
};
