const Sale = require('../models').Sale
const Chat = require('../models').Chat
const Media = require('../models').Media
const CorpMember = require('../models').CorpMember
const Accommodation = require('../models').Accommodation
const helpers = require('../utilities/helpers')
const Busboy = require('busboy');
const ggle = require('../helpers/uploadgdrive');
const socket = require('../sockets/routes')
const ngplaces = require('../utilities/ngstates')
inspect = require('util').inspect;
const auth = require('../helpers/auth')


module.exports = {
    async getChatData (req, res) {
        // req.query.posts.who and req.query.posts.when
      
        // to get old chats
      
        console.log('logged in? we in chats now', req.session.loggedin, 'req.query =>', req.query, '\n??')

        let _all_corp_member_chats = await Chat.findAll({
        where: {
            message_from: {
                [Op.eq]: `${req.session.corper.statecode}`, // somewhat redundant
            },
            room: {
                [Op.like]: `%${req.session.corper.statecode}%` // or use req.query.s
            },
            message: {
                [Op.not]: null
            }
        },
        });

        // "SELECT * FROM chats WHERE message_to = '" + req.query.s + "' AND message IS NOT NULL AND message_sent = false ;" +
        // "SELECT * FROM chats WHERE message_from = '" + req.query.s + "' AND message IS NOT NULL AND message_sent = false ;" +

        let _all_chats_to_corp_member = await Chat.findAll({
            where: {
                message_to: {
                    [Op.eq]: `${req.session.corper.statecode}`, // or use req.query.s
                },
                message_sent: {
                    [Op.is]: false,
                },
                message: {
                    [Op.not]: null
                }
            },
        })

        let _all_chats_from_corp_member = await Chat.findAll({
            where: {
                message_from: {
                    [Op.eq]: `${req.session.corper.statecode}`, // or use req.query.s
                },
                message_sent: {
                    [Op.is]: false,
                },
                message: {
                    [Op.not]: null
                }
            },
        })

        let item_to_chat_about;
        if (req.query.posts.type == 'sale') {
            // "SELECT * FROM posts WHERE statecode = '" + req.query.posts.who + "' AND post_time = '" + req.query.posts.when + "' ;"
            
        } else if (req.query.posts.type == 'accommodation') {
            // "SELECT * FROM accommodations WHERE expire > NOW() AND statecode = '" + req.query.posts.who + "' AND input_time = '" + moment(new Date(parseInt(req.query.posts.when))).format('YYYY-MM-DD HH:mm:ss') + "' ; "
            
        }
      
        
         /* return query.GetChatData(req).then(result => {
           res.set('Content-Type', 'text/html');
           console.log('all chat kini', result);
           res.render('pages/chat', result);
         }, reject => {
           res.set('Content-Type', 'text/html');
           res.redirect('/login');
         }).catch(reason => {
           // we hope we never get here
           console.log('what happened at /chat???', reason);
           res.redirect('/login');
         }) */
      
    }
}