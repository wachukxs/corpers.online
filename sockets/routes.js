const query = require('../utilities/queries');
const moment = require('moment');
const path = require('path');
const _FILENAME = path.basename(__filename);
const db = require('../models')
const { Op } = require("sequelize");

// https://www.npmjs.com/package/socket.io#standalone
const io = require('socket.io')();
// find a more authentic way to calculate the numbers of corpers online using io(/user) --so even if they duplicate pages, it won't double count

/**
 * can do without the `.of('/')`
 */
io
.of('/')
.on('connection', (socket) => {
    console.log('got a socket connection /', socket.id)
    socket.on('hi', (msg, fn) => {
        console.log('got a socket hi msg /')

        fn({message: 'back from the moon'})
        socket.emit('hi', `from server socket: ${msg}`);
    });

    socket.on('broadcast_message', (msg, fn) => {
        console.log('got a socket bm msg /')
        fn({message: 'back from the moon'})
        
        io.emit('broadcast_message', `from server main: ${msg}`);
    });

    socket.emit('hi', `hiyaaaa from server socket:`);

    socket.emit('broadcast_message', `wad up from server socket:`);

    io.emit('hi', `hiyaaaa from server io:`);

    io.emit('broadcast_message', `from server io: someone joined`);

    socket.on('disconnect', () => {
        console.log('lost a socket connection /')
    });
});

const ioCorpMember = io.of('/corp-member')

ioCorpMember.on('connection', (socket) => { // when a new user is in the TIMELINE
    console.log('New connection on /corp-member.');

    socket.on('broadcast_message', (data, fn) => {
        console.log(socket.client.id + ' sent boardcast mesage on /corp-member to everyone.');

        // data.age = moment(data.post_time).fromNow();

        // if there are images in the post user boardcasted, before we save them to db, convert to string with double spaces ( '  ' ) between each image
        /* if (data.images) {

            var q = '';
            var l = data.images.length;
            data.images.forEach(function (item, index, array) {
                // console.log(item, index);
                q = l === index + 1 ? q.concat(item) : q.concat(item + '  ');

                // save each image
                console.log('checking', item.slice(item.indexOf(':') + 1, item.indexOf(';'))); // map picture won't save because they aren't in dataURL format
                query.InsertRowInMediaTable({
                    post_time: data.post_time , 
                    media: item, 
                    media_type: item.slice(item.indexOf(':') + 1, item.indexOf(';'))
                })
                
            });

        } */

        /* query.InsertRowInPostsTable({
            sender: data.sender , 
            state_code: data.state_code, 
            type: (data.type ? data.type : ""), 
            text: data.text, 
            media: (data.images ? q : ""), 
            price: data.price, 
            location: data.location, 
            post_time: data.post_time 
        }).then(result => {
            socket.in(socket.handshake.query.state_code.substring(0, 2)).emit('boardcast message', {
                to: 'be received by everyoneELSE',
                post: [data] // should be an array
            });
        }, reject => {
            console.log('failed to insert row in post table', reject);
        }).catch(reason => {
            console.log('error - insert row in post table');

        }) */
        // save to db --put picture in different columns
        // increse packet size for media (pixs and vids)
        // & when using pool.escape(data.text), there's no need for the enclosing single quotes incase the user has ' or any funny characters
        

        // this function will run in the client to show/acknowledge the server has gotten the message.
        // fn(data?.post_time);
    });

    socket.on('hi', (msg) => {
        socket.emit('hi', `from server: ${msg} /cm`);
    });
    socket.emit('hi', `from server 453: /cm`);

    ioCorpMember.emit('hi', `from server 000: /cm`);

    
    // let's do this first cause socket.handshake.query comes as sting ... will fix later
    // socket.handshake.query.corper = JSON.parse(socket.handshake.query.corper)

    // // join State room
    // socket.join(socket.handshake.query.state_code.substring(0, 2));
    // console.log('how many:', `total connection on all sockets ${io.sockets.clients.length}`, `& from timeline ${ioCorpMember.clients.length}`);
    
    socket.on('ferret', (asf, name, fn) => {
        // this funtion will run in the client to show/acknowledge the server has gotten the message.
        // so we can like tell the client a message has been recorded, seen, or sent.
        fn('woot ' + name + asf);
    });

    socket.emit('callback', {
        this: 'is the call back'
    });

    // find a way so if the server restarts (maybe because of updates and changes to this file) and the user happens to be in this URL log the user out of this url
    // console.log('well', socket.handshake.query.last_post, isEmpty(socket.handshake.query.last_post) );

    // doesn't work as expected, needs an OS PR
    ioCorpMember.emit('corpers_count', { // https://stackoverflow.com/a/59495277
        count:  socket.server.engine.clientsCount // ioCorpMember.server.engine.clientsCount // io.engine.clientsCount
    });

    // find a way to work with cookies in socket.request.headers object for loggining in users again

    // logot out time SELECT TIMESTAMPDIFF(MINUTE , session_usage_details.login_time , session_usage_details.logout_time) AS time

    //-------- optimize by running the two seperate queries (above & below) in parallel later

    // when any user connects, send them (previous) posts in the db before now (that isn't in their timeline)
    // find a way to handle images and videos
    /** sender, state_code, type, text, price, location, post_time, input_time */

    // posts currently in user's time line is socket.handshake.query.[p|a]utl.split(',')
    // console.log('socket.handshake.query', typeof socket.handshake.query, socket.handshake.query.sutl)


    // console.log('socket.handshake.query.sutl after', typeof sUTL, aUTL)
    
    // console.log('socket query parameter(s) [user timeline]\n', 'acc:' + aUTL.length, ' posts:' + sUTL.length); // if either equals 1, then user timeline is empty

    // SELECT * FROM posts WHERE post_time > 1545439085610 ORDER BY posts.post_time ASC (selects posts newer than 1545439085610 | or posts after 1545439085610)

    // right now, this query selects newer posts always | ''.split(',') returns a query with length 1 where the first elemeent is an empty string

    // ordering by ASC starts from oldest, so the first result is the oldest post and the newer ones is the last and that's what corpers see first

    // so we're selecting posts newer than the ones currently in the user's timeline. or the server closed the connection error

    // ways to convert from js format to sql format
    
    
    // remember to check if the query to know if the time is actually greater than or less
    // console.log(e, 'time causing the ish', aUTL[aUTL.length - 1], sUTL[sUTL.length - 1]); // when timeline is empty, e is "Invalid Date"

    // we stopped using sender column from posts table, so it's null !


    /* db.CorpMember.findAll({ // TODO: also add PPA
        where: {
            state_code: {
                [Op.like]: `%${socket.handshake.query.state_code.substring(0, 2)}%`,
            }
        },
        include: [{ // how can we specify this can be empty if possible
            model: db.Sale,
            where: {
                state_code: {
                    [Op.like]: `%${socket.handshake.query.state_code.substring(0, 2)}%`, // somewhat redundant
                },
                ... (sUTLlast && {
                    created_at: {
                        [Op.gt]: sUTLlast,
                }})
            },
            order: [
                ['created_at', 'ASC']
            ]
        },
        {
            model: db.Accommodation,
            where: {
                state_code: {
                    [Op.like]: `%${socket.handshake.query.state_code.substring(0, 2)}%`, // somewhat redundant
                },
                ... (sUTLlast && {
                    created_at: {
                        [Op.gt]: sUTLlast,
                }})
            },
            order: [
                ['created_at', 'ASC']
            ]
        }]
    })
    // .toJSON()
    .then(_sales_accommodations => {
        // console.log("\n\n\n\n\n\ndid we get corp member's Sales n Accommodation?", _sales_accommodations);
        
        socket.emit('boardcast message', {
            to: 'be received by everyoneELSE',
            post: _sales_accommodations
        });

    }, (reject) => {
        socket.emit('boardcast message', {
            to: 'be received by everyoneELSE',
            post: []
        });
        console.error('uhmmmm not good', reject);
        console.log('emitting empty posts, first user or the tl is empty')
    }).catch(reject => {
        console.error('is this the error ?', reject);

        // right ?? ?? we can't just not send anything ...
        socket.emit('boardcast message', {
            to: 'be received by everyoneELSE',
            post: []
        });
    }) */


    /* query.FetchPostsForTimeLine({
        statecode_substr: socket.handshake.query.state_code.substring(0, 2),
        last_sale_time: sUTLlast,
        last_accommodation_time: aUTLlast
    }).then((allposts_results) => {
        Object.entries(allposts_results).forEach(
            ([key, value]) => {

                // console.log('acc v:', value);
                socket.emit('boardcast message', {
                    to: 'be received by everyoneELSE',
                    post: value // should be an array
                });

            }
        );
    }, (reject) => {
        socket.emit('boardcast message', {
            to: 'be received by everyoneELSE',
            post: []
        });
        console.log('emitting empty posts, first user or the tl is empty');
    }).catch((reason) => {
        console.log('FetchPostForTimeLine failed');
        
    }) */

    socket.on('disconnect', function () {
        console.log('lost a connection on /corp-member');
        ioCorpMember.emit('corpers_count', {
            count: 'sth', // Object.keys(ioCorpMember.connected).length
        }); // todo the disconnected socket should boardcast, let's not waste things and time abeg
    });

});

const ioChat = io.of('/chat').on('connection', function (socket) {

    // let's do this first cause socket.handshake.query comes as sting ... will fix later
    socket.handshake.query.corper = JSON.parse(socket.handshake.query.corper)

        // get user details... we should have middleware to handle this

        // immediately join all the rooms presently online they are involved in, someone wants to chat with you
        var everyRoomOnline = Object.keys(ioChat.adapter.rooms)

        console.log('everyRoomOnline: ', everyRoomOnline);

        for (index = 0; index < everyRoomOnline.length; index++) {
            const onlineRoom = everyRoomOnline[index];

            if (onlineRoom.includes(socket.handshake.query.corper.state_code)) {
                console.log('\nsaw onlineRoom', `${onlineRoom} is got in ${socket.handshake.query.corper.state_code}`);
                socket.join(onlineRoom);
            }

        } // ON EVERY MESSAGE, WE CAN ITERATE THROUGH ALL THE CONNECTED ROOMS AND IF A ROOM CONTAINS BOTH THE .TO AND .FROM, WE SEND TO THAT ROOM BUT THIS METHOD IS INEFFICIENT, IF THE ROOM ISN'T ALREADY EXISTING, CREATE IT AND JOIN, ELSE JUST ONLY JOIN

        // socket.handshake.query.to and socket.handshake.query.corper.state_code

        // [so we save traffic, a bit maybe] also select old rooms, i.e. rooms not in everyOnlineRooms, also show that these rooms[the participants] are online[maybe with green in the front end][from chat.adapter.rooms object]
        
        /**
         * this block of code gets offline rooms, that the corper was in, and join.
         */

        // https://stackoverflow.com/a/51114095 // maybe create an OS MR for this.
        db.Chat.findAll({
            where: {
                room: {
                    [Op.like]: `%${socket.handshake.query.corper.state_code}%` // is state_code
                },
                message: {
                    [Op.not]: null
                }
            },
            attributes: ['room'],
            group: ['room']
        }).then(results => {
            console.log('\t\t\n\n\nall previous rooms\n\n:', results);

            let _rooms = results.map(result => result.room)
            console.log("roooooms:\n\n\n", _rooms);
            /* for (index = 0; index < results.length; index++) {
                const offlineRoom = results[index].room;

                if (offlineRoom.includes(socket.handshake.query.corper.state_code)) {
                    console.log('\nsaw offlineRoom', `${offlineRoom} is got in ${socket.handshake.query.corper.state_code}`);
                    socket.join(offlineRoom, () => {
                        console.log('\nand joined', `${offlineRoom}`);
                    });
                }

            } */
        }, reject => {
            console.error;('\t\t\n\n\ndid not get all previous rooms\n\n:', reject);
        }).catch(reason => {
            console.error;('\t\t\n\n\ncatchinggg did not get all previous rooms\n\n:', reason);
        })

        // SELECT DISTINCT room FROM chats WHERE room LIKE '%" + state_code + "%' AND message IS NOT NULL
        // query.GetStatecodeChatRooms(socket.handshake.query.corper.state_code)
        

        
        // save all the ever rooms a socket has been in, and output it so 

        // then every socket joins a room where their state code is mentioned [an array]

        // and if this new room is a room that isn't saved, it means it's a new room, save it. we know by checking the output of the results of all rooms a socket is mentioned in with this new room value

        // for now we are supporting only two per room
        // only join rooms that has more than one participant. else why is it a room? and you can't chat alone with yourself!
        // don't join rooms with the same state codes!! 
        // only join a room a socket isn't already in --socket.io already takes care of this!!


        /**
         * save all incoming message to db
         * save who to message time attachments [link to the file, array datatype]
         * 
         * when sockets come online, check if they have any unread message, then send it to them,
         * 
         * the room name will be both involved parties state_code. if more, then all their state_code or something unique
         * 
         * how do we know read and unread messages ?
         * 
         * check all connected sockets if that state code is online, 
         * send message to them and wait for the reciept funtion to run to mark the message as read
         * 
         * if they are not online then the message is unread
         * 
         * when they come online, check if they have any unread message, then send it to them,
         * 
         * and when they see the message, it should mark that it has been read... how ?
         */

        socket.on('hi', function (msg) {
            console.log('\nwhat we got:', msg);
        });

        socket.on('ferret', (asf, name, fn) => {
            // this funtion will run in the client to show/acknowledge the server has gotten the message.
            fn('from server: we got the message woot ' + name + asf);
        });

        /**this function checks if a corper is online, it takes the corper's state_code on a socket's query parameter and the socket namespace to check */
        function corperonline(sc, ns) {
            console.log('checking if someone is online')
            var x = Object.keys(ns.sockets);
            var t = false; // initialise to false
            for (const s of x) {
                
                console.log('checking if', ns.sockets[s].handshake.query.corper.state_code, 'is online');
                // console.log(ns.sockets[s].handshake.query, ns.sockets[s].handshake.query.corper.state_code);
                // should be query.corper.state_code ... need change in account.ejs
                if (ns.sockets[s].handshake.query.corper?.state_code == sc) { // if they're online
                    t = s; // true // return the socket.id
                    console.log('they are online...', s)
                    break;
                } else {
                    console.log('they are not online');
                }
            }
            return t;
        }

        socket.on('message', async (msg, fn) => {

            console.log('got a message', msg);
            // declare the encapsulating object
            var m = {
                'from': {},
                'to': {}
            };

            if (socket.handshake.query.corper.state_code != ('' || null) && msg.to != ('' && socket.handshake.query.corper.state_code && null)) { // send message only to a particular room
                /* var m = {
                  'from': { 'state_code': socket.handshake.query.corper.state_code },
                  'to': { 'state_code': msg.to },
                  'it': msg
                }; */

                // should make m.to the corper object
                /**
                 * m.to is an object of CorpMember
                 */
                m.to = await db.CorpMember.findOne({
                    where: {
                      state_code: msg.to
                    }
                  });
                console.log('did we get to /?', m.to);
                console.log('did we get to /0000?', m.to.id);
                /**
                 * m.from is an object of CorpMember
                 */
                m.from = socket.handshake.query.corper,
                m.it = msg;
                ;

                var everyRoomOnline = Object.keys(ioChat.adapter.rooms)
                // ON EVERY MESSAGE, WE CAN ITERATE THROUGH ALL THE CONNECTED ROOMS AND IF A ROOM CONTAINS BOTH THE .TO AND .FROM, WE SEND TO THAT ROOM BUT THIS METHOD IS INEFFICIENT, IF THE ROOM ISN'T ALREADY EXISTING, CREATE IT AND JOIN, ELSE JUST ONLY JOIN
                // console.log('\n\n\n\nevery online room', everyRoomOnline)

                //// in the IFs statements, check if the receipient sockets are online too before sending!!!

                var c_online = corperonline(msg.to, ioChat);
                //[TODO]// check if they are both in the room before sending to the room. [DONE]

                // THE TWO IF STATEMENTS HAVE THE SAME LOGIC BUT DIFFERENT IMPLMENTATION

                if (ioChat.adapter.rooms[socket.handshake.query.corper.state_code + '-' + msg.to] && c_online) {
                    // In the array!
                    var room = socket.handshake.query.corper.state_code + '-' + msg.to;
                    console.log('is in room ?', ioChat.adapter.rooms[room].sockets[socket.id]);
                    if (!ioChat.adapter.rooms[room].sockets[socket.id]) { // if the sending socket is NOT in the room

                    }

                    if (!ioChat.adapter.rooms[room].sockets[c_online]) {
                        ioChat.sockets[c_online].join(room, () => {
                            console.log(msg.to, "wasn't in", room, "just joined")
                        })
                    }
                    socket.join(room, () => {
                        // to do, add the socket the message is sent to to the room too
                        socket.to(room).broadcast.emit('message', m); // broadcast to everyone in the room
                        m.sent = true;
                    });
                    console.log('\n\ngot close to deliver ? 001', !m.sent)
                } else if (ioChat.adapter.rooms[msg.to + '-' + socket.handshake.query.corper.state_code] && c_online) {
                    // In the array!
                    console.log(socket.id, 'what ??????', c_online) // ioChat.sockets[c_online].id
                    var room = msg.to + '-' + socket.handshake.query.corper.state_code;

                    console.log('are in room ? sender = ', ioChat.adapter.rooms[room].sockets[socket.id], 'receipent =', ioChat.adapter.rooms[room].sockets[c_online]);
                    if (ioChat.adapter.rooms[room].sockets[socket.id] && ioChat.adapter.rooms[room].sockets[c_online]) { // if they are both online and in the room
                        socket.to(room).broadcast.emit('message', m);
                    } else {
                        ioChat.sockets[c_online].join(room, () => {
                            socket.join(room, () => {
                                socket.to(room).broadcast.emit('message', m);
                                m.sent = true;
                            });
                        })
                    }

                    console.log('\n\ngot close to deliver ? 02', !m.sent) // something is wrong here. if new delete all messages. and a new corper open a new chat with another corper. if the initiating corper sends messages, the other corper receives, the other corpers sends messages, the initiating corper doens't receive it immeidately 
                } else {
                    // Not in the array
                    // then add both sockets...from and to ...to thesame room [to get the .to, find the socket that the corper.state_code is msg.to]

                    var room = socket.handshake.query.corper.state_code + '-' + msg.to;

                    if (c_online) {
                        ioChat.sockets[c_online].join(room, () => {
                            socket.join(room, () => {
                                socket.to(room).broadcast.emit('message', m);
                                m.sent = true;
                            });
                        })
                    } else { // they must be offline
                        console.log('\n\ndid not deliver', !m.sent)
                        // emit an incremented number of unread message to other necessary pages, after inserting to database
                        var socket_id = corperonline(msg.to, ioCorpMember)
                        // console.log('akkkhhhh', ioCorpMember)
                        if (socket_id) {
                            console.log('\n\nfound socket', socket_id)
                            ioCorpMember.to(socket_id).emit('totalunreadmsg', 1)
                        }
                        m.sent = false;
                    }
                }

                // socket.emit('message', m); // only the socket (itself) sees it.
                fn(m) // run on client machine
                
                // save message to db
                db.Chat.create({
                    room: room,
                    message: msg.message,
                    message_from: socket.handshake.query.corper.state_code,
                    message_to: msg.to,
                    // media_id: , // add later
                    time: msg.time,
                    message_sent: m.sent,
                })
                // query.InsertRowInChatTable({
                //     room: room, 
                //     message_from: socket.handshake.query.corper.state_code, 
                //     message_to: msg.to, 
                //     time: msg.time, 
                //     message: msg.message, 
                //     message_sent: m.sent,
                //     post_time_by_to: msg.post_time_by_to,
                //     post_type_by_to: msg.post_type_by_to
                // })
                .then(result => {
                    // good
                }, reject => {
                    // very bad
                    console.log('what error?', reject);
                    
                }).catch(reason => {
                    console.log('why did you fail?', reason);
                    
                })               
            }

        });

        // Handle typing event
        socket.on('typing', function (data) {
            socket.broadcast.emit('typing', data);
        });

        socket.on('read', (chatInfo, fn) => {
            console.log('what is chatInfo', chatInfo);
            // UPDATE chats SET message_sent = true WHERE message IS NOT NULL AND message_from = '" + chatInfo.message_from + "' AND message_to = '" + chatInfo.message_to + "'"
            db.Chat.update({
                read_by_to: true,
                time_read: chatInfo.time_read
            }, {
                where: {
                    message_from: chatInfo.message_from,
                    message_to: chatInfo.message_to,
                    read_by_to: false,
                }
            })
            .then(result => {
                console.log('updated read receipts', result);
                fn(chatInfo);
            }, reject => {
                console.log('could not update read receipts', reject);
            }).catch(reason => {
                console.log('we really did not update read receipts', reason);
            })
            // check number of changed roles affected
            

            // this funtion will run in the client to show/acknowledge the server has gotten the message.
            // emit an event to message_from to know that his/her message has been read
        });

        // io.sockets.in(room).emit('message', 'what is going on, party people?'); // room is something unique. sockets.room

        //everyone, including self, in /chat will get it
        ioChat.emit('hi!', {
            test: 'from chat',
            '/chat': 'will get, it ?'
        });

});

const iomap = io.of('/map').on('connection', function (socket) { // when a new user connects to the map

    socket.on('addplace', function (data) {
        console.log('got some info', data)
    });

    socket.on('gotposition', function (data) {

    });

    socket.on('tracking', (asf, fn) => { // asf is what we sent from client
        // this funtion will run in the client to show/acknowledge the server has gotten the message.
        // console.log('trk', asf);
        fn(asf); // takes only one argument
    });
});

const iocount = io.of('/count').on('connection', function (countsocket) {
    // once you connect, send the number
    countsocket.emit('count', {
        number: io.sockets.clients.length
    });

    // while, you're connected, if someone else logs in or comes 'online', sent the number
    io.on('connection', function (socket) {
        console.log(io.sockets.clients.length, typeof io.sockets.clients.length); // clients counts the different ipaddresses connected
        console.log('+1')
        countsocket.emit('count', {
            number: io.sockets.clients.length
        });

        // if someone goes offline or dissconnects, send the number
        socket.on('disconnect', function () {
            console.log(io.sockets.clients.length, typeof io.sockets.clients.length);
            console.log('-1')
            countsocket.emit('count', {
                number: io.sockets.clients.length
            });
        });

    })

});

module.exports = io;

// https://openclassrooms.com/en/courses/2504541-ultra-fast-applications-using-node-js/2505653-socket-io-let-s-go-to-real-time#/id/r-2505616
