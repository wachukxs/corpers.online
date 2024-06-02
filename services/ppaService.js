const { Op } = require("sequelize");
const db = require("../models");
const Busboy = require("busboy");
const crypto = require("crypto");
const chalk = require("chalk");
const fs = require("fs");
const { uploadFile } = require("../helpers/ftp-upload");
const path = require("path");
const _FILENAME = path.basename(__filename);

exports.getNigerianStates = (req, res) => {
  const _FUNCTIONNAME = "getNigerianStates";
  console.log("hitting", _FILENAME, _FUNCTIONNAME);

  return db.States.findAll({
    attributes: { exclude: ["created_at", "updated_at"] },
  })
    .then(
      (states) => {
        // console.log("re:", states);
        res.send({
          states,
        });
      },
      (error) => {
        console.error(_FUNCTIONNAME, "error happened", error);
        res.status(500).json(null);
      }
    )
    .catch((reason) => {
      console.error("catching this err because:", reason);
      res.status(500).json(null);
    });
};

exports.getNigerianStatesAndLGAs = (req, res) => {
  const _FUNCTIONNAME = "getNigerianStatesAndLGAs";
  console.log("hitting", _FILENAME, _FUNCTIONNAME);

  return db.States.findAll({
    attributes: { exclude: ["created_at", "updated_at"] },
    include: [{
      model: db.StateLGA,
      attributes: { exclude: ["created_at", "updated_at", "state_id"] },
    }]
  })
    .then(
      (states_and_lgas) => {
        // console.log("re:", states);
        res.send({
          states_and_lgas,
        });
      },
      (error) => {
        console.error(_FUNCTIONNAME, "error happened", error);
        res.status(500).json(null);
      }
    )
    .catch((reason) => {
      console.error("catching this err because:", reason);
      res.status(500).json(null);
    });
};

exports.getNigerianStateLGAs = (req, res) => {
  const _FUNCTIONNAME = "getNigerianStateLGAs";
  console.log("hitting", _FILENAME, _FUNCTIONNAME);

  if (!req.params?.stateId || isNaN(parseInt(req.params?.stateId))) {
    res.status(400).json({ message: "Missing state param" });
  }

  return db.StateLGA.findAll({
    where: {
      state_id: req.params?.stateId,
    },
    attributes: { exclude: ["created_at", "updated_at", "state_id"] },
  })
    .then(
      (statesLga) => {
        // console.log('re:', statesLga);
        res.send({
          lgas: statesLga,
        });
      },
      (error) => {
        console.error("getNigerianStateLGAs() error happened", error);
        res.status(500).json(null);
      }
    )
    .catch((reason) => {
      console.error("catching this err because:", reason);
      res.status(500).json(null);
    });
};

exports.addPPA = (req, res) => {
  try {
    const busboy = Busboy({
      headers: req.headers,
      limits: {
        // set fields, fieldSize, and fieldNameSize later (security)
        files: 12, // don't upload more than 12 media files
        fileSize: 50 * 1024 * 1024, // 50 MB TODO: Review if we really want limit to be 50mb ... seems too high
      },
    });
    let _media = []; // good, because we re-initialize on new post
    let _text = {};

    busboy.on(
      "field",
      function handlePpaFields(
        fieldname,
        val,
        { nameTruncated, valueTruncated, encoding, mimeType }
      ) {
        console.log("Field [" + fieldname + "]: value: " + val);
        // this if block is an hot fix
        if (val && val !== "null") {
          _text[fieldname] = val;
        }
      }
    );

    busboy.on(
      "file",
      async function handleSalesFiles(fieldName, fileStream, info) {
        const { filename, transferEncoding, mimeType } = info;

        const fileExtension = filename.split(".").pop();

        const new_file_name =
          crypto.randomBytes(20).toString("hex") + `.${fileExtension}`;

        const saveTo = path.join(process.env.TEMP_UPLOAD_PATH, new_file_name);
        console.log("using saveTo", saveTo);
        fileStream.pipe(fs.createWriteStream(saveTo)).on("close", (err) => {
          console.log("done writing file!!!");

          // TODO: upload here??
        });
        console.log("got a file", filename);

        /**
         * FTP upload only works if you use here. Before the event listeners.
         */
        // const _url = await uploadFile(fileStream, filename)

        _media.push(new_file_name);

        // there's also 'limit' and 'error' events https://www.codota.com/code/javascript/functions/busboy/busboy/on
        fileStream.on("limit", function () {
          console.error("the file was too large... nope");
          get = false;
          // don't listen to the data event anymore
          /* fileStream.off('data', (data) => { // doesn't work
          console.log('should do nothing. what\'s data?', data)
        }) */

          // how should we send a response if one of the files/file is invalid [too big or not an accepted file type]?
        });

        /* fileStream.on('readable', (what) => { // don't do this, unless, MABYE fileStream.read() is called in the callback
          console.log('\ncurious what happens here\n', what)
        }) */

        fileStream.on("end", function (err) {
          // if we listened for 'file', even if there's no file, we still come here
          // so we're checking if it's empty before doing anything.
          /* console.log('readabe?///// ?', fileStream.read()) // filestram.read() is always null ... */

          console.log("File [" + fieldName + "] Finished. Got " + "bytes");
          if (err) {
            console.log("err in busboy file end", err);
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
        if (filename) {
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

    busboy.on("finish", async function doneHandlePpaFieldsAndFiles() {
      console.log("Done parsing form!", _text, "\n\n media", _media);

      // todo: Do validation here.

      let _new_ppa = {
        name: _text.name,
        type_of_ppa: _text.category,
        Locations: [
          {
            address: _text.address,
            state_lga_id: _text.state_lga_id,
            state_id: _text.state_id,
          },
        ],
      };

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

        _new_ppa.Media = __m.map((e) => ({ url: e }));
        // TODO: add alt_text later
      }

      db.PPA.create(_new_ppa, {
        include: [{ association: "Locations" }, { association: "Media" }],
      })
        .then(
          async (ppa) => {
            // remove the ppa id
            res.json({ ppa });
          },
          (reject) => {
            console.log("what error?", reject);
            res.status(403).json({});
          }
        )
        .catch((reason) => {
          console.log("why did you fail?", reason);
          res.status(403).json({});
        });
    });

    // handle post request, add data to database... do more
    return req.pipe(busboy);
  } catch (error) {
    console.log("what error?", error);
    res.status(403).json({});
  }
};

exports.getAllPPAs = (req, res) => {
  const _FUNCTIONNAME = "getAllPPAs";
  console.log("hitting", _FILENAME, _FUNCTIONNAME);

  return db.PPA.findAll({
    include: [
      {
        model: db.Location,
        include: [{ model: db.StateLGA }, { model: db.States }],
      },
      {
        model: db.Media,
        // exclude other foreign keys since they're null
        attributes: {
          exclude: [
            "chat_id",
            "accommodation_id",
            "sale_id",
            "corp_member_id",
            "location_id",
          ],
        },
      },
    ],
  })
    .then(
      (ppas) => {
        res.send({
          ppas,
        });
      },
      (error) => {
        console.error(_FUNCTIONNAME, "error happened", error);
        res.status(500).json(null);
      }
    )
    .catch((reason) => {
      console.error("catching this err because:", reason);
      res.status(500).json(null);
    });
};

exports.addReviewToPPA = (req, res) => {
  try {
    const _FUNCTIONNAME = "addReviewToPPA";
    console.log("hitting", _FILENAME, _FUNCTIONNAME);
    // TODO: Do validation here.

    console.log("corper id", req.session?.corper?.id);
    db.Review.create({
      corp_member_id: req.session.corper.id,
      comment: req.body.comment,
      star_rating: req.body.star_rating,
      ppa_id: req.body.ppa_id,
    })
      .then(
        async (review) => {
          res.json({ review });
        },
        (reject) => {
          console.log("what error?", reject);
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

/**
 * This is a temporary service method.
 * @param {*} req
 * @param {*} res
 */
exports.searchPPAs = (req, res) => {
  console.log("searching", req.body);

  const { searchText } = req.body;

  // TODO: Convert both to lowercase.
  db.PPA.findAll({
    where: {
      [Op.or]: [
        {
          name: {
            [Op.like]: `%${searchText}%`,
          },
        },
        {
          type_of_ppa: {
            [Op.like]: `%${searchText}%`,
          },
        },
        // docs: https://sequelize.org/docs/v6/advanced-association-concepts/eager-loading/#complex-where-clauses-at-the-top-level
        {
          "$Locations.address$": {
            [Op.like]: `%${searchText}%`,
          },
        },
      ],
    },
    include: [
      {
        model: db.Media,
        attributes: {
          exclude: [
            "accommodation_id",
            "chat_id",
            "corp_member_id",
            "sale_id",
            "location_id",
          ],
        },
      },
      {
        model: db.Location,
        attributes: {
          exclude: ["accommodation_id", "corp_member_id"],
        },
        // This included Media might be redundant, but the case for it is if this location have Media that the PPA doesn't have.
        include: [
          {
            model: db.Media,
            attributes: {
              exclude: [
                "accommodation_id",
                "chat_id",
                "corp_member_id",
                "sale_id",
                "location_id",
              ],
            },
          },
        ],
      },
    ],
  })
    .then(
      (ppas) => {
        console.log(
          '"%s" search term yielded %d results!',
          searchText,
          ppas?.length
        );

        res.json({ ppas });
      },
      (reject) => {
        res.status(500).json({});
        console.error("uhmmmm not good", reject);
      }
    )
    .catch((reject) => {
      console.error("is this the error ?", reject);
      res.status(500).json({});
    });
};
