const query = require("../utilities/queries");
const moment = require("moment");
const path = require("path");
const _FILENAME = path.basename(__filename);
const db = require("../models");
const { Op } = require("sequelize");
const crypto = require("crypto");
const chalk = require("chalk");

// https://www.npmjs.com/package/socket.io#standalone
const io = require("socket.io")();
// find a more authentic way to calculate the numbers of corpers online using io(/user) --so even if they duplicate pages, it won't double count

/**
 * Should be same on FE.
 */
const IOEventNames = {
  HI: "hi",
  NEW_SALE: "new_sale",
  NEW_ACCOMMODATION: "new_accommodation",
  BROADCAST_MESSAGE: "broadcast_message",
  CHAT_MESSAGE: "chat_message",
  ERROR: "error",
  CONNECT: "connect",
  CONNECTION: "connection",
  DISCONNECT: "disconnect",
};

/**
 * Should be same on FE.
 */
const IOEventRoutes = {
  BASE: "/",
  CHAT: "/chat",
  MAP: "/map",
};

/**
 * can do without the `.of('/')`
 */
io.of(IOEventRoutes.BASE).on(IOEventNames.CONNECTION, async (socket) => {
  console.log("got a socket connection /", socket.id);

  // Join their state room.
  if (socket.handshake.query?.state_code) {
    socket.join(socket.handshake.query.state_code.substring(0, 2));
  }

  socket.on(IOEventNames.HI, (msg, fn) => {
    console.log(
      "got a socket hi msg /. total sockets",
      io.sockets.clients.length
    );

    fn({ message: "back from the moon" });
    socket.emit(IOEventNames.HI, `from server socket: ${msg}`);
  });

  socket.on(IOEventNames.BROADCAST_MESSAGE, (msg, fn) => {
    console.log("got a socket bm msg /");
    fn({ message: "back from the moon" });

    io.emit(IOEventNames.BROADCAST_MESSAGE, `from server main: ${msg}`);
  });

  socket.emit(IOEventNames.HI, `hiyaaaa from server socket:`);

  // TODO: fetch all the sales.
  // socket.emit(IOEventNames.BROADCAST_MESSAGE, []);

  io.emit(IOEventNames.HI, `hiyaaaa from server io:`);

  if (socket.handshake.query.state_code) {
    db.Sale.findAll({
      /**
       * TODO:OSS This next line is a hot fix. Sales doesn't have state_code column, but it's included in the query.
       */
      attributes: { exclude: ["state_code"] },

      // This OR the nested where in include.
      // where: {
      //     "$CorpMember.state_code$": {
      //         [Op.substring]: socket.handshake.query.state_code.substring(0, 2),
      //     }
      // },
      order: [["created_at", "ASC"]],
      include: [
        {
          model: db.Media,
        },
        {
          model: db.CorpMember,
          attributes: ["state_code", "nickname", "first_name", "id"], // db.CorpMember.getPublicAttributes(),
          where: {
            state_code: {
              [Op.substring]: socket.handshake.query.state_code.substring(0, 2),
            },
          },
        },
      ],
    }).then(
      (_sales) => {
        io.emit(IOEventNames.BROADCAST_MESSAGE, {
          to: "be received by one",
          post: _sales,
        });
      },
      (err) => {
        console.log("ERRRR", err);
      }
    );
  }

  socket.on("ferret", (asf, name, fn) => {
    // this funtion will run in the client to show/acknowledge the server has gotten the message.
    // so we can like tell the client a message has been recorded, seen, or sent.
    fn("woot " + name + asf);
  });

  socket.emit("callback", {
    this: "is the call back",
  });

  socket.on("disconnect", () => {
    // TODO: maybe also emit total count of corp members online
    console.log("lost a socket connection /");
  });
});

// TODO: Depreciate after fully implementing / route
const ioCorpMember = io.of(IOEventRoutes.CORP_MEMBER);
ioCorpMember.on(IOEventNames.CONNECTION, (socket) => {
  // when a new user is in the TIMELINE
  console.log("New connection on /corp-member.");

  socket.on(IOEventNames.BROADCAST_MESSAGE, (data, fn) => {
    console.log(
      socket.client.id + " sent boardcast mesage on /corp-member to everyone."
    );

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

  socket.on(IOEventNames.HI, (msg) => {
    socket.emit(IOEventNames.HI, `from server: ${msg} /cm`);
  });
  socket.emit(IOEventNames.HI, `from server 453: /cm`);

  ioCorpMember.emit(IOEventNames.HI, `from server 000: /cm`);

  socket.on("disconnect", function () {
    console.log("lost a connection on /corp-member");
  });
});

const ioChat = io.of(IOEventRoutes.CHAT);
ioChat.on(IOEventNames.CONNECTION, function (socket) {
  console.log(chalk.yellow("New connection on /chat"), socket.handshake?.query);

  const everyRoomOnline = Array.from(ioChat.adapter.rooms.keys());

  // immediately join all the rooms presently online they are involved in, someone wants to chat with you
  console.log("everyRoomOnline:", everyRoomOnline);

  // Join every online Room they should be in.
  for (index = 0; index < everyRoomOnline.length; index++) {
    const onlineRoom = everyRoomOnline[index];

    if (onlineRoom.includes(socket.handshake.query.state_code)) {
      socket.join(onlineRoom);
    }
  }
  /**
   * this block of code gets offline rooms, that the corper was in, and join.
   */

  // https://stackoverflow.com/a/51114095 // maybe create an OS MR for this.
  db.ChatRoom.findAll({
    where: {
      [Op.or]: [
        { message_from: socket.handshake?.query?.id },
        { message_to: socket.handshake?.query?.id },
      ],
    },
    attributes: ["room"],
    // group: ["room"],
  })
    .then(
      (results) => {
        console.log("\t\t\n\n\nno of previous rooms:", results.length);

        // Join all rooms you were in before.
        results.forEach((result) => {
          console.log("joining room", result.room);
          socket.join(result.room);
        });
      },
      (reject) => {
        console.error(chalk.red("did not get all previous rooms:"), reject);
      }
    )
    .catch((reason) => {
      console.error(
        chalk.red("catching did not get all previous rooms:"),
        reason
      );
    });

  // SELECT DISTINCT room FROM chats WHERE room LIKE '%" + state_code + "%' AND message IS NOT NULL
  // query.GetStatecodeChatRooms(socket.handshake.query.state_code)

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

  socket.on(IOEventNames.HI, function (msg) {
    console.log("\nwhat we got:", msg);
  });

  socket.on(IOEventNames.CHAT_MESSAGE, async function (msg) {
    console.log(chalk.blue("\nchat we got:"), msg);

    /**
     * check if room exist for new chat, else create it.
     * TODO: needs to be depreciated. ~if no room in request, it's a new chat; then create a room.~
     */
    if (msg.room) {
      const [roomChat, created] = await db.ChatRoom.findOrCreate({
        where: {
          room: msg.room,
          // // msg.to = m.to & msg.from = m.from / or / msg.to = m.from or msg.from = m.to
          // [Op.or]: [{
          //   [Op.and]: {message_from: msg.message_from, message_to: msg.message_to}
          //  }, {
          //   [Op.and]: {message_from: msg.message_to, message_to: msg.message_from }
          //  }]
        },
        defaults: {
          room: msg.room, // room now coming from FE (crypto.randomBytes(20).toString('hex'))
          message_from: msg.message_from,
          message_to: msg.message_to,
        },
      });
    }

    // save to db, if message recipient is online, we send to them.
    db.Chat.create(
      {
        room: msg.room,
        message: msg.message,
        message_from: msg.message_from, // or socket.handshake.query.state_code
        message_to: msg.message_to,
      },
      {
        include: [
          {
            model: db.CorpMember,
            as: "FromCorpMember",
            attributes: db.CorpMember.getPublicAttributes(),
          },
          {
            model: db.CorpMember,
            as: "ToCorpMember",
            attributes: db.CorpMember.getPublicAttributes(),
          },
        ],
      }
    )
      .then((result) => result.reload()) // https://stackoverflow.com/a/68664023/9259701
      .then(
        (result) => {
          console.log("after saving chat", result);

          console.log("socket rooms", socket.rooms);
          /**
           * TODO: there's a logic flaw; the arrangement of room names...
           */
          // if this socket is not in a room with the recipient, create room n join.
          if (!socket.rooms.has(msg.room)) {
            // socket.rooms is a Set.
            // join room
            console.log(chalk.grey("sender gonna join the chat room"));
            socket.join(msg.room); // seems this doesn't matter.
          }

          // if recipient is online (and not in the room - join room), send the result to them.
          const recipientSocket = isCorpMemberOnline(msg.message_to, ioChat);
          if (recipientSocket) {
            console.log("Found recipient socket");
            if (!recipientSocket.rooms.has(msg.room)) {
              console.log(chalk.grey("recipient gonna join the chat room"));
              recipientSocket.join(msg.room);
            }
          }

          console.log("sending message to room"); // not just recipient
          // Then send the message to that room. (or just send to the recipient?? - faster this way)
          // TODO: maybe delete the id of the message
          // TODO: BUG: using ioChat sends twice to sender
          ioChat.to(msg.room).emit(IOEventNames.CHAT_MESSAGE, result);
        },
        (reject) => {
          // very bad
          console.log("what error?", reject);
          // emit failed response.
          socket.emit(IOEventNames.ERROR, msg);
        }
      )
      .catch((reason) => {
        console.log("why did you fail?", reason);
        // emit failed response.
        socket.emit(IOEventNames.ERROR, msg);
      });
  });

  socket.on("ferret", (asf, name, fn) => {
    // this function will run in the client to show/acknowledge the server has gotten the message.
    fn("from server: we got the message woot " + name + asf);
  });

  /**
   * this function checks if a corper is online, it takes the corper's corpMember's Id on a socket's query parameter and the socket namespace to check
   *
   * TODO: this needs to be like a cache or sth. We update cache on connect and disconnect.
   * */
  function isCorpMemberOnline(corpMemberId, namespace) {
    console.log("checking if someone is online", corpMemberId);
    let result = null; // initialize to null
    if (!corpMemberId) {
      return result;
    }
    for (const [key, value] of namespace.sockets.entries()) {
      console.log("checking...", value.handshake?.query?.id);
      if (parseInt(value.handshake?.query?.id) === parseInt(corpMemberId)) {
        // if they're online
        result = value; // return the socket
        console.log("they are online...");
        break;
      }
    }
    return result;
  }

  socket.on("message", async (msg, fn) => {
    console.log("got a message", msg);
    // declare the encapsulating object
    var m = {
      from: {},
      to: {},
    };

    if (
      socket.handshake.query.state_code != ("" || null) &&
      msg.to != ("" && socket.handshake.query.state_code && null)
    ) {
      // send message only to a particular room
      /* var m = {
                  'from': { 'state_code': socket.handshake.query.state_code },
                  'to': { 'state_code': msg.to },
                  'it': msg
                }; */

      // should make m.to the corper object
      /**
       * m.to is an object of CorpMember
       */
      m.to = await db.CorpMember.findOne({
        where: {
          state_code: msg.to,
        },
      });
      console.log("did we get to /?", m.to);
      console.log("did we get to /0000?", m.to.id);
      var everyRoomOnline = Object.keys(ioChat.adapter.rooms);
      // ON EVERY MESSAGE, WE CAN ITERATE THROUGH ALL THE CONNECTED ROOMS AND IF A ROOM CONTAINS BOTH THE .TO AND .FROM, WE SEND TO THAT ROOM BUT THIS METHOD IS INEFFICIENT, IF THE ROOM ISN'T ALREADY EXISTING, CREATE IT AND JOIN, ELSE JUST ONLY JOIN
      // console.log('\n\n\n\nevery online room', everyRoomOnline)

      //// in the IFs statements, check if the receipient sockets are online too before sending!!!

      const c_online = isCorpMemberOnline(msg.to, ioChat);
      //[TODO]// check if they are both in the room before sending to the room. [DONE]

      // THE TWO IF STATEMENTS HAVE THE SAME LOGIC BUT DIFFERENT IMPLMENTATION

      if (
        ioChat.adapter.rooms[
          socket.handshake.query.state_code + "-" + msg.to
        ] &&
        c_online
      ) {
        // In the array!
        var room = socket.handshake.query.state_code + "-" + msg.to;
        console.log(
          "is in room ?",
          ioChat.adapter.rooms[room].sockets[socket.id]
        );
        if (!ioChat.adapter.rooms[room].sockets[socket.id]) {
          // if the sending socket is NOT in the room
        }

        if (!ioChat.adapter.rooms[room].sockets[c_online]) {
          ioChat.sockets[c_online].join(room, () => {
            console.log(msg.to, "wasn't in", room, "just joined");
          });
        }
        socket.join(room, () => {
          // to do, add the socket the message is sent to to the room too
          socket.to(room).broadcast.emit("message", m); // broadcast to everyone in the room
          m.sent = true;
        });
        console.log("\n\ngot close to deliver ? 001", !m.sent);
      } else if (
        ioChat.adapter.rooms[
          msg.to + "-" + socket.handshake.query.state_code
        ] &&
        c_online
      ) {
        // In the array!
        console.log(socket.id, "what ??????", c_online); // ioChat.sockets[c_online].id
        var room = msg.to + "-" + socket.handshake.query.state_code;

        console.log(
          "are in room ? sender = ",
          ioChat.adapter.rooms[room].sockets[socket.id],
          "receipent =",
          ioChat.adapter.rooms[room].sockets[c_online]
        );
        if (
          ioChat.adapter.rooms[room].sockets[socket.id] &&
          ioChat.adapter.rooms[room].sockets[c_online]
        ) {
          // if they are both online and in the room
          socket.to(room).broadcast.emit("message", m);
        } else {
          ioChat.sockets[c_online].join(room, () => {
            socket.join(room, () => {
              socket.to(room).broadcast.emit("message", m);
              m.sent = true;
            });
          });
        }

        console.log("\n\ngot close to deliver ? 02", !m.sent); // something is wrong here. if new delete all messages. and a new corper open a new chat with another corper. if the initiating corper sends messages, the other corper receives, the other corpers sends messages, the initiating corper doens't receive it immeidately
      } else {
        // Not in the array
        // then add both sockets...from and to ...to thesame room [to get the .to, find the socket that the corper.state_code is msg.to]

        var room = socket.handshake.query.state_code + "_" + msg.to;

        if (c_online) {
          ioChat.sockets[c_online].join(room, () => {
            socket.join(room, () => {
              socket.to(room).broadcast.emit("message", m);
              m.sent = true;
            });
          });
        } else {
          // they must be offline
          console.log("\n\ndid not deliver", !m.sent);
          // emit an incremented number of unread message to other necessary pages, after inserting to database
          const socket_id = isCorpMemberOnline(msg.to, ioCorpMember);
          // console.log('akkkhhhh', ioCorpMember)
          if (socket_id) {
            console.log("\n\nfound socket", socket_id);
            ioCorpMember.to(socket_id).emit("totalunreadmsg", 1);
          }
          m.sent = false;
        }
      }

      // socket.emit('message', m); // only the socket (itself) sees it.
      fn(m); // run on client machine

      // save message to db
      db.Chat.create({
        room: room,
        message: msg.message,
        message_from: socket.handshake.query.state_code,
        message_to: msg.to,
        // media_id: , // add later
        time: msg.time,
        message_sent: m.sent,
      })
        // query.InsertRowInChatTable({
        //     room: room,
        //     message_from: socket.handshake.query.state_code,
        //     message_to: msg.to,
        //     time: msg.time,
        //     message: msg.message,
        //     message_sent: m.sent,
        //     post_time_by_to: msg.post_time_by_to,
        //     post_type_by_to: msg.post_type_by_to
        // })
        .then(
          (result) => {
            // good
          },
          (reject) => {
            // very bad
            console.log("what error?", reject);
          }
        )
        .catch((reason) => {
          console.log("why did you fail?", reason);
        });
    }
  });

  // Handle typing event
  socket.on("typing", function (data) {
    socket.broadcast.emit("typing", data);
  });

  socket.on("read", (chatInfo, fn) => {
    console.log("what is chatInfo", chatInfo);
    // UPDATE chats SET message_sent = true WHERE message IS NOT NULL AND message_from = '" + chatInfo.message_from + "' AND message_to = '" + chatInfo.message_to + "'"
    db.Chat.update(
      {
        time_read: new Date(),
        time_read: chatInfo.time_read,
      },
      {
        where: {
          message_from: chatInfo.message_from,
          message_to: chatInfo.message_to,
          time_read: null,
        },
      }
    )
      .then(
        (result) => {
          console.log("updated read receipts", result);
          fn(chatInfo);
        },
        (reject) => {
          console.log("could not update read receipts", reject);
        }
      )
      .catch((reason) => {
        console.log("we really did not update read receipts", reason);
      });
    // check number of changed roles affected

    // this funtion will run in the client to show/acknowledge the server has gotten the message.
    // emit an event to message_from to know that his/her message has been read
  });

  // io.sockets.in(room).emit('message', 'what is going on, party people?'); // room is something unique. sockets.room

  //everyone, including self, in /chat will get it
  ioChat.emit("hi!", {
    test: "from chat",
    "/chat": "will get, it ?",
  });
});

/**
 * We can use this to have a list of all the rooms online. (and probably sockets too)
 */
ioChat.adapter.on("create-room", (room, id) => {
  console.log(`socket ${id} has created room ${room}`);
});
ioChat.adapter.on("join-room", (room, id) => {
  console.log(`socket ${id} has joined room ${room}`);
});
ioChat.adapter.on("leave-room", (room, id) => {
  console.log(`socket ${id} has left room ${room}`);
});
ioChat.adapter.on("delete-room", (room, id) => {
  console.log(`socket ${id} has deleted room ${room}`);
});

const ioMap = io
  .of(IOEventRoutes.MAP)
  .on(IOEventNames.CONNECTION, function (socket) {
    // when a new user connects to the map

    socket.on("addplace", function (data) {
      console.log("got some info", data);
    });

    socket.on("gotposition", function (data) {});

    socket.on("tracking", (asf, fn) => {
      // asf is what we sent from client
      // this funtion will run in the client to show/acknowledge the server has gotten the message.
      // console.log('trk', asf);
      fn(asf); // takes only one argument
    });
  });

module.exports = { io, IOEventNames, IOEventRoutes };

// https://openclassrooms.com/en/courses/2504541-ultra-fast-applications-using-node-js/2505653-socket-io-let-s-go-to-real-time#/id/r-2505616
