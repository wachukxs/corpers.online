const db = require('../models')
const helpers = require('../utilities/helpers')
const Busboy = require('busboy');
const ggle = require('../helpers/uploadgdrive');
const socket = require('../sockets/routes')
const ngplaces = require('../utilities/ngstates')
inspect = require('util').inspect;
const auth = require('../helpers/auth')
const { Op } = require("sequelize");

exports.getChatData = async (req, res) => {
    const _FUNCTIONNAME = 'getChatData'
    console.log('hitting', _FILENAME, _FUNCTIONNAME);
    
    // req.query.posts.who and req.query.posts.when

    // to get old chats

    console.log('logged in? we in chats now', 'req.query =>', req.query, '\n??') // req.query => { posts: { type: 'sale', id: '2' } }

    // seems we'll just use this only
    // we need to format this in a way that would make it easy to be used in front end
    let _all_corp_member_chats = await db.Chat.findAll({
        where: {
            room: {
                [Op.like]: `%${req.session.corper.statecode}%` // or use req.query.s
            },
            message: {
                [Op.not]: null
            }
        },
        group: [ // NOT WORKING //
            ['Chat.id'], ['CorpMember.id'], ['CorpMember.Medium.id'], ['Medium.id'],
            ['Chat.room'],
        ],
        order: [['createdAt']],
        include: [
            {
                model: db.CorpMember,
                include: [{
                    model: db.Media,
                }],
            },
            {
                model: db.Media,
            }
        ]
    });

    // redundant, we can just count the results from ...
    let _total_num_unread_msg = await db.Chat
        .count({
            where: {
                message_to: req.session.corper.statecode,
                // message_sent: false, // should we be using this, or better still, do we need it???
                read_by_to: false,
                message: {
                    [Op.not]: null
                }
            }
        })


    let _all_chats_to_corp_member = await db.Chat.findAll({
        where: {
            message_to: {
                [Op.eq]: `${req.session.corper.statecode}`, // or use req.query.s
            },
            // message_sent: {
            //     [Op.is]: false,
            // },
            read_by_to: {
                [Op.is]: false,
            },
            message: {
                [Op.not]: null
            }
        },
    })

    let _all_chats_from_corp_member = await db.Chat.findAll({
        where: {
            message_from: {
                [Op.eq]: `${req.session.corper.statecode}`, // or use req.query.s
            },
            // message_sent: {
            //     [Op.is]: false,
            // },
            message: {
                [Op.not]: null
            }
        },
    })

    let _item_to_chat_about;
    if (req.query.posts && req.query.posts.type == 'sale') {
        _item_to_chat_about = await db.Sale.findByPk(req.query.posts.id, {
            include: {
                model: db.CorpMember,
                as: 'saleByCorper'
            }
        })
    } else if (req.query.posts && req.query.posts.type == 'accommodation') {
        _item_to_chat_about = await db.Accommodation.findByPk(req.query.posts.id, {
            include: {
                model: db.CorpMember,
                as: 'accommodationByCorper',
            },
            attributes: db.Accommodation.getAllActualAttributes()
        })
    }


    res.set('Content-Type', 'text/html');

    // need to format or arrange according to time
    let _new_all_corp_member_chats;

    if (_all_corp_member_chats.length > 0) {
        _new_all_corp_member_chats = {}
        _all_corp_member_chats.forEach((_chat, _i, _chat_arr) => {
            if (_new_all_corp_member_chats[_chat.room]) {
                _new_all_corp_member_chats[_chat.room].push(_chat)
            } else {
                _new_all_corp_member_chats[_chat.room] = []
                _new_all_corp_member_chats[_chat.room].push(_chat)
            }

        })
    }

    console.log('all chat kini', _all_corp_member_chats);

    // console.log('\n\n\n\n\t\t formatted all chat kini', _new_all_corp_member_chats);

    console.log('the item to chat about', _item_to_chat_about?.id, _item_to_chat_about?.type);

    console.log('\t\n_total_num_unread_msg\n\n', _total_num_unread_msg);
    res.render('pages/chat', {
        _all_corp_member_chats, // is an Array
        _item_to_chat_about: _item_to_chat_about,
        _total_num_unread_msg,
        _new_all_corp_member_chats,
        corper: req.session.corper
    });

}
