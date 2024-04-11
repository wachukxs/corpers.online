const { Op } = require("sequelize");
const db = require("../models");
const Busboy = require("busboy");

const chalk = require("chalk");

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
        res.sendStatus(500);
      }
    )
    .catch((reason) => {
      console.error("catching this err because:", reason);
      res.sendStatus(500);
    });
};

exports.getNigerianStateLGAs = (req, res) => {
  const _FUNCTIONNAME = "getNigerianStateLGAs";
  console.log("hitting", _FILENAME, _FUNCTIONNAME);

  if (!req.params?.stateId) {
    res.sendStatus(400); // missing param
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
        res.sendStatus(500);
      }
    )
    .catch((reason) => {
      console.error("catching this err because:", reason);
      res.sendStatus(500);
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

    busboy.on("finish", async function doneHandlePpaFieldsAndFiles() {
      console.log("Done parsing form!", _text, "\n\n media", _media);

      // todo: Do validation here.

      db.PPA.create(
        {
          name: _text.name,
          type_of_ppa: _text.category,
          Locations: [
            {
              address: _text.address,
              state_lga_id: _text.state_lga_id,
            },
          ],
        },
        {
          include: [{ association: "Locations" }],
        }
      )
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
        include: [{ model: db.StateLGA, include: [{ model: db.States },] }],
      },
    ],
  })
    .then(
      (ppas) => {
        // console.log("re:", states);
        res.send({
          ppas,
        });
      },
      (error) => {
        console.error(_FUNCTIONNAME, "error happened", error);
        res.sendStatus(500);
      }
    )
    .catch((reason) => {
      console.error("catching this err because:", reason);
      res.sendStatus(500);
    });
};
