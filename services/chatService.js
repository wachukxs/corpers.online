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
    
    // TODO: Optimize this, only load the last 500?? messages
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
            {
              model: db.ChatRoom,
              as: "Room",
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
              attributes: db.ChatRoom.getPublicAttributes(),
            },
          ],
          order: [["created_at", "ASC"]],
        }
      )
        .then(
          (chats) => {
            /**
             * reformat the chats. (can't use Map, it's send as empty obj - not really JSON)
             * 
             * Can we avoid doing all this processing, and fetch thing directly like this straight from the db?
             */
            const results = {};

            for (const index in chats) {
                const chat = chats[index]

                // todo: add: (we'll calculate it while we're adding chats.)
                // unread_messages?: number
                if (results[chat.room]) {
                    results[chat.room].texts.push(chat)
                } else {
                    results[chat.room] = {
                        texts: [chat],
                        recipient_id: chat?.Room?.message_to,
                        initiator_id: chat?.Room?.message_from,
                        room: chat?.room,
                        recipient_name: chat?.Room?.["ToCorpMember"]?.first_name,
                        initiator_name: chat?.Room?.["FromCorpMember"]?.first_name,
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
