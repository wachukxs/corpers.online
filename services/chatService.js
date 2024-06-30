const db = require('../models')
const helpers = require('../utilities/helpers')
const Busboy = require('busboy');
const ggle = require('../helpers/uploadgdrive');
const ngplaces = require('../utilities/ngstates')
inspect = require('util').inspect;
const auth = require('../helpers/auth')
const { Op } = require("sequelize");
const path = require("path");
const _FILENAME = path.basename(__filename);

// TODO: will need to change
exports.getChatData = async (req, res) => {
    const _FUNCTIONNAME = 'getChatData'
    console.log('hitting', _FILENAME, _FUNCTIONNAME);
    
    db.Chat.findAll(
        {
          where: {
            [Op.or]: [
                { message_from: req.session.corper?.id },
                { message_to: req.session.corper?.id },
            ]
          },
          include: [
            {
              model: db.CorpMember,
              as: "FromCorpMember",
              attributes: [...db.CorpMember.getPublicAttributes(), 'id'],
            },
            {
              model: db.CorpMember,
              as: "ToCorpMember",
              attributes: [...db.CorpMember.getPublicAttributes(), 'id'],
            },
          ],
          order: [["created_at", "ASC"]],
        }
      )
        .then(
          (chats) => {
            // reformat the chats. (can't use Map, it's send as empty obj - not really JSON)
            const results = {};

            for (const index in chats) {
                const chat = chats[index]
                if (results[chat.room]) {
                    results[chat.room].texts.push(chat)
                } else {
                    results[chat.room] = {
                        texts: [chat]
                    }
                }
            }

            res.status(200).json({
                message: "CorpMember chats",
                results,
              });

          },
          (reject) => {
            // very bad
            console.log("what /chats error?", reject);
            // emit failed response.
            res.status(501).json({
                message: "An error occurred while fetching your chats.",
              });
          }
        )
        .catch((reason) => {
          console.log("why did /chats fail?", reason);
          // send failed response.
          res.status(501).json({
            message: "An error occurred while fetching your chats.",
          });
        });



    

}
