const connectionPool = require('./db');
const moment = require('moment');
const helpers = require('../constants/helpers');
const ngstates = require('../constants/ngstates');
/**
 *
 * func to handle signup of corpers
 * @param signupData object CONTAINS email, firstname, middlename, password, lastname, statecode, batch, servicestate, stream.
 * servicestate and statecode are derived
 * @type function
*/
exports.CorpersSignUp = async (signupData) => {

    console.log('sign up data', signupData)

    let theservicestate = ngstates.states_long[ngstates.states_short.indexOf(signupData.statecode.trim().slice(0, 2).toUpperCase())];

    // we don't need stream, do we? can be inferred! same as batch!
    let thestream = signupData.statecode.trim().slice(5, 6).toUpperCase();

    function getstream(sb) {
        return sb == 'A' ? 1 : sb == 'B' ? 2 : sb == 'C' ? 3 : 4; // because we're sure it's gonna be 'D'... are we? ...sure?
    }

    // 'chuks'.replace(/^[a-z]/i, (s) => {return s.toUpperCase()} ) // makes 'chuks' => 'Chuks'
    signupData.lastname = signupData.lastname.trim().replace(/^[a-z]/i, (s) => { return s.toUpperCase() });
    signupData.middlename = signupData.middlename.trim().replace(/^[a-z]/i, (s) => { return s.toUpperCase() });
    signupData.firstname = signupData.firstname.trim().replace(/^[a-z]/i, (s) => { return s.toUpperCase() });

    signupData.servicestate = theservicestate;
    signupData.stream = getstream(thestream);
    signupData.statecode = signupData.statecode.trim().toUpperCase(); // convert statecode to uppercase, very important!
    // signupData.batch = signupData.statecode.slice(3, 6).toUpperCase(); // we don't need batch, can be inferred from statecode

    // var sqlquery = "INSERT INTO info(email, firstname, middlename, password, lastname, statecode, batch, servicestate, stream) VALUES ('" + signupData.email + "', '" + signupData.firstname + "', '" + signupData.middlename + "', '" + signupData.password + "', '" + signupData.lastname + "', '" + signupData.statecode.toUpperCase() + "', '" + signupData.statecode.slice(3, 6).toUpperCase() + "', '" + theservicestate + "' , '" + getstream(thestream) + "'  )";
    /**[re]sponse for this funtion CorpersSignUp() */
    let re = await new Promise((resolve, reject) => {
        /**[r]esponse */
        let r;

        /**statecode validation regex */
        const statecode_regex = /^(ab|ad|ak|an|ba|by|bn|bo|cr|dt|eb|ed|ek|en|fc|gm|im|jg|kd|kn|kt|kb|kg|kw|la|ns|ng|og|od|os|oy|pl|rv|so|tr|yb|zm)\/\d\d[abcACB]\/[0-9]{4}$/gi;
        /**check if statecode is valid */
        const valid_statecode = signupData.statecode.match(statecode_regex);

        if (valid_statecode === null) {
            reject({ message: 'invalid statecode' })
        }

        connectionPool.query('INSERT INTO info SET ?', signupData, function (error, results, fields) {
            console.log('inserted data result: ', results);
            if (error) {
                console.log('the error code:', error.code, error.sqlMessage)
                switch (error.code) { // do more here
                    case 'ER_DUP_ENTRY': // ER_DUP_ENTRY if a statecode or email exists already
                        if (error.sqlMessage.includes(signupData.statecode.toUpperCase())) { // Duplicate entry 'TR/19A/1234' for key 'PRIMARY'
                            // res.redirect('/signup?m=ds'); // [m]essage = [d]uplicate [s]tatecode
                            r = {
                                message: 'duplicate statecode'
                            };
                        } else if (error.sqlMessage.includes(signupData.email)) { // Duplicate entry 'uyu@yud.eww' for key 'email'
                            // res.redirect('/signup?m=de'); // [m]essage = [d]uplicate [e]mail
                            r = {
                                message: 'duplicate email'
                            };
                        }

                        break;
                    default:
                        r = {
                            message: `${error.code} ${error.sqlMessage}`
                        };
                        break;
                    // ER_BAD_FIELD_ERROR
                }
                // throw error; // ? // breaks server

                reject(r);
            }

            // "else if" is very important
            else if (results.affectedRows === 1) {

                // helpers.email(signupData.email, signupData.firstname, theservicestate).catch(console.error);
                r = {
                    message: true,
                    theservicestate: theservicestate
                };
                resolve(r);
            }

        });
    })

    return re;
}

exports.CorpersLogin = async (req_body) => {
    const loginData = [req_body.statecode.toUpperCase()]; // , req_body.password // .toUpperCase() is crucial
    let re = await new Promise((resolve, reject) => {
        let sqlquery = "SELECT password, name_of_ppa, lga, region_street, city_town, servicestate, statecode FROM info WHERE statecode = ?";
        connectionPool.query(sqlquery, loginData, function (error, result, fields) {
            console.log('can login result be empty', result);
            // console.log('selected data from db, logging In...', results1); // error sometimes, maybe when there's no db conn: ...
            if (error) {
                console.log('the error code:', error.code)
                switch (error.code) { // do more here
                    case 'ER_ACCESS_DENIED_ERROR':
                        break;
                    case 'ECONNREFUSED': // maybe send an email to myself or the delegated developer // try to connect again multiple times first
                        break;
                    case 'PROTOCOL_CONNECTION_LOST':
                        break;
                    default:
                        break;
                }
                // throw error;
                console.log('backend error', `${error.code} ${error.sqlMessage}`);

                reject({ message: 'backend error' })
            } else if (helpers.isEmpty(result)) {
                reject({ message: 'sign up' }) // tell them they need to sign up or password or statecode is wrong
            } else if (result.length === 1) {
                if (result[0].password === req_body.password) { // very crucial step!
                    resolve({ message: true, response: result })
                } else {
                    reject({ message: 'wrong password' }) // wrong password
                }
                
            }
        });
    })

    return re;
}

exports.LoginSession = async (loginData) => {
    let re = await new Promise((resolve, reject) => {
        // insert login time and session id into db for usage details
        connectionPool.query("INSERT INTO session_usage_details( statecode, session_id, user_agent) VALUES (?, ?, ?)", loginData, function (error2, results2, fields2) {

            if (error2) reject({ message: false });

            if (results2.affectedRows === 1) {

                resolve({ message: true })

            }

        });
    })
}

/**calculate the number of unread messages a corper has when they log in
 * @param corpersData array, contains statecode and false
 * @type funtion
 */
exports.UnreadMessages = async (corpersData) => {
    /**[re]sponse for this funtion UnreadMessages() */
    let re = await new Promise((resolve, reject) => {

        connectionPool.query("SELECT * FROM chats WHERE message_to = ? AND message IS NOT NULL AND message_sent = ?", corpersData, function (error, results, fields) {

            if (error) reject(error);

            const total_num_unread_msg = results.filter((value, index, array) => {
                return value.message_to == corpersData[0].toUpperCase() && value.message_sent == 0
            }).length;

            resolve(total_num_unread_msg);

        });
    })

    return re;
}

/**
 * get newer posts for the timeline based on the most current in corper's timeline
 */
exports.FetchPostsForTimeLine = async (timeLineInfo) => {
    let re = new Promise((resolve, reject) => {
        /**there's much work on this section maybe, just to make sure sql sees and calculates the value as they should (or NOT ????) */
        let getpostsquery = "SELECT * FROM posts WHERE statecode LIKE '%" + timeLineInfo.statecode_substr + "%'" + (timeLineInfo.last_post_time !== null ? ' AND post_time > "' + timeLineInfo.last_post_time + '" ORDER by posts.post_time ASC' : ' ORDER by posts.post_time ASC') +
            "; SELECT * FROM accommodations WHERE statecode LIKE '%" + timeLineInfo.statecode_substr + "%'" + (timeLineInfo.last_input_time !== null ? ' AND input_time > "' + timeLineInfo.last_input_time + '" ORDER by accommodations.input_time ASC' : ' ORDER BY accommodations.input_time ASC');

        /* console.log(getpostsquery)
        SELECT * FROM posts WHERE statecode LIKE '%DT%' AND post_time > "null" ORDER by posts.post_time ASC; SELECT * FROM accommodations WHERE statecode LIKE '%DT%' AND input_time > "null" ORDER by accommodations.input_time ASC
         */
        connectionPool.query(getpostsquery, function (error, results, fields) {
            if (error) reject(error);

            if (!helpers.isEmpty(results[0]) || !helpers.isEmpty(results[1])) {

                // FOR THE POSTS - sales just converting their post time value to a worded age & making the media value okay
                Object.entries(results[0]).forEach(
                    ([key, value]) => {

                        // fix the time here too by converting the retrieved post_time colume value to number because SQL converts the value to string when saving (because we are using type varchar to store the data-number value)
                        // value.age = moment(Number(value.post_time)).fromNow();
                        value.age = moment(Number(value.post_time))
                            .fromNow();

                        //if there is image(s) in the post we're sending to user from db then convert it to array.
                        if (value.media) {
                            // value.media = value.media.split('  '); // previously on how we handled media(images) when we stored them in base64

                            // console.log('? ', (value.media.substring(0, 23) === "https://api.mapbox.com/"),(value.media.substring(0, 23) === "https://api.mapbox.com/" ? value.media : value.media.split(',')) );

                            value.media = (value.media.substring(0, 23) === "https://api.mapbox.com/" ? value.media : value.media.split(',')); // make only the url be in the array && we can't use .split(',') because there's ','s in the url

                            // ---this logic is expensive and buggy
                            /* // if what we stored is a map link, ie. a url...
                            try {
                              value.media = new URL(value.media).toString();
                            } catch (error) { // if it isn't
                              value.media = value.media.split(',');
                            } */

                        }

                    }
                );


                // FOR THE ACCOMMODATIONS - accommodations -- just converting their post time value to a worded age
                Object.entries(results[1]).forEach(
                    ([key, value]) => {

                        //fix the time here too by converting the retrieved post_time colume value to number because SQL converts the value to string when saving (because we are using type varchar to store the data-number value)

                        // value.age = moment(new Date(value.input_time)).fromNow();
                        value.age = moment(value.post_time) // remove new Date(value.input_time) later
                            .fromNow();

                    }
                );

                var allposts = results[0].concat(results[1]);

                /**
                 * "It's also worth noting that unlike many other JavaScript array functions, 
                 * Array.sort actually changes, or mutates the array it sorts.
                 * To avoid this, you can create a new instance of the array to be sorted and modify that instead."
                 * This sorting function/algorithm and the comment above came from 
                 * https://www.sitepoint.com/sort-an-array-of-objects-in-javascript/ 
                 * 
                 * (read: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Description)
                 * */
                function compareFun_to_sort(a, b) {
                    /**sort according to post time */
                    return a.post_time - b.post_time;
                }

                allposts.sort(compareFun_to_sort);
                // FOR THE ACCOMMODATIONS - accommodations

                resolve(allposts);

            } else {
                reject(null);
            }
        });
    })

    return re;
}

/**
 * insert a data in media table
 */
exports.InsertRowInMediaTable = async (mediaData) => {
    let re = await new Promise((resolve, reject) => {
        connectionPool.query("INSERT INTO media SET ?", mediaData, function (error, result, fields) {
            if (error) reject(error)

            else if (result.affectedRows === 1) {
                resolve()
            }
        });
    })

    return re;
}

/**
 * insert data in post table
 */
exports.InsertRowInPostsTable = async (postData) => {
    console.log('we posting now')
    let re = await new Promise((resolve, reject) => {
        connectionPool.query("INSERT INTO posts SET ?", postData, function (error, result, fields) {
            if (error) reject(error)

            else if (result.affectedRows === 1) {
                resolve()
            }
        });
    })

    return re;
}

exports.GetFirstAndLastNameWithStatecode = async (data) => {
    let re = await new Promise((resolve, reject) => {
        connectionPool.query("SELECT firstname, lastname FROM info WHERE statecode = '" + socket.handshake.query.from + "'", function (error, results, fields) { // bring the results in ascending order

            if (error) reject(error)
            else if (!helpers.isEmpty(results)) {
                resolve(results[0])
            } else {
                reject()
            }

        });
    })

    return re;
}

exports.GetStatecodeChatRooms = async (statecode) => {
    let re = await new Promise((resolve, reject) => {
        connectionPool.query("SELECT DISTINCT room FROM chats WHERE room LIKE '%" + statecode + "%' AND message IS NOT NULL", function (error, results, fields) {

            if (error) reject(error);

            else if (!helpers.isEmpty(results)) { // an array of objects with the columns as keys
                console.info('got rooms from db successfully', results);
                resolve(results)

            } else if (helpers.isEmpty(results)) {
                // console.info('got empty rooms from db successfully', results);
                reject()
            }
        });
    });

    return re;
}

exports.InsertRowInChatTable = async (chatData) => {
    let re = await new Promise((resolve, reject) => {
        connectionPool.query("INSERT INTO chats SET ?", chatData, function (error, result, fields) {
            if (error) reject(error)

            else if (result.affectedRows === 1) {
                resolve()
            }
        });
    })

    return re;
}

exports.UpdateChatReadReceipts = async (chatInfo) => {
    let re = await new Promise((resolve, reject) => {
        var q = "UPDATE chats SET message_sent = true WHERE message IS NOT NULL AND message_from = '" + chatInfo.message_from + "' AND message_to = '" + chatInfo.message_to + "'";
        connectionPool.query(q, function (error, results, fields) {
            if (error) reject(error);
            // connected!
            if (results.changedRows > 0) { // when we've saved it, the corper can now join the room
                console.log('\n\nupdated messages delivered');
                resolve()
                // emit to the message_from if online to know that the message_to has read the message [so double tick on both ends]

            }
        });
    })
}

exports.InsertRowInAccommodationsTable = async (postData) => {
    let re = await new Promise((resolve, reject) => {
        connectionPool.query("INSERT INTO accommodations SET ?", postData, function (error, result, fields) {
            if (error) reject(error)

            else if (result.affectedRows === 1) {
                resolve()
            }
        });
    })

    return re;
}

/**
 * get data we use in map[s] page
 * we need to re-write the query we use to get data
 */
exports.GetMapData = async () => {
    let re = await new Promise((resolve, reject) => {
        // what about name of the ppa ? this way of selecting might prove inefficient when we have large data set from all the states meanwhile this corper just need data from within a particular state.
        // also select ppa_directions from info and it should be like a reveal, corpers would click 'read directions' and it'll show them
        connectionPool.query("SELECT ppa_address, ppa_geodata, type_of_ppa FROM info WHERE ppa_address != '' AND ppa_geodata != '' AND type_of_ppa != '' ; \
        SELECT ppa_geodata, name_of_ppa, ppa_address, lga, region_street, type_of_ppa, city_town FROM info WHERE ppa_geodata != '' ; \
        SELECT DISTINCT type_of_ppa FROM info WHERE type_of_ppa != '' ", function (error, results, fields) { // bring the results in ascending order
            // we shouldn't be rejecting with empty data
            // let's either put listoftypesofpas in front end
            // or reject with it, along with the error, and send to the front end
            if (error) reject(error)

            // console.log(results.length, 'map result =>', results)

            if (!helpers.isEmpty(results[1])) {
                // console.log('geo data for map', results);

                // for the results from places table
                for (let index = 0; index < results[1].length; index++) {
                    // re-arrange to GeoJSON Format
                    results[1][index].type = "Feature";

                    results[1][index].properties = {};
                    results[1][index].properties.geodata = JSON.parse(results[1][index].ppa_geodata); // we're always expecting a json here else err
                    results[1][index].properties.address = results[1][index].ppa_address;
                    results[1][index].properties.type = results[1][index].type_of_ppa;

                    // we can add lga, name, and maybe region

                    results[1][index].geometry = {};
                    results[1][index].geometry.type = "Point";
                    results[1][index].geometry.coordinates = [JSON.parse(results[1][index].ppa_geodata).longitude, JSON.parse(results[1][index].ppa_geodata).latitude];

                    console.log(JSON.parse(results[1][index].ppa_geodata).latlng, '/////', JSON.parse(results[1][index]['ppa_geodata']).longitude, JSON.parse(results[1][index]['ppa_geodata']).latitude);

                    delete results[1][index]['ppa_geodata'];
                    delete results[1][index]['type_of_ppa'];
                    delete results[1][index]['ppa_address'];

                    // delete redundate data like longitude, latitude, and latlng in ppa_geodata after reassigning values

                }
            } else {
                results[1] = []
            }

            if (!helpers.isEmpty(results[0])) {
                // for the results from info table
                // format to GeoJSON Format https://tools.ietf.org/html/rfc7946
                for (index = 0; index < results[0].length; index++) {

                    // re-arrange to GeoJSON Format
                    results[0][index].type = "Feature";

                    results[0][index].properties = {};
                    results[0][index].properties.geodata = JSON.parse(results[0][index].ppa_geodata);
                    results[0][index].properties.address = results[0][index].ppa_address;
                    results[0][index].properties.type = results[0][index].type_of_ppa;

                    results[0][index].geometry = {};
                    results[0][index].geometry.type = "Point";
                    results[0][index].geometry.coordinates = [JSON.parse(results[0][index].ppa_geodata).longitude, JSON.parse(results[0][index].ppa_geodata).latitude];

                    console.log(JSON.parse(results[0][index].ppa_geodata).latlng, '======++++++++====', JSON.parse(results[0][index]['ppa_geodata']).longitude, JSON.parse(results[0][index]['ppa_geodata']).latitude);

                    delete results[0][index]['ppa_geodata'];
                    delete results[0][index]['type_of_ppa'];
                    delete results[0][index]['ppa_address'];

                    // delete redundate data like longitude, latitude, and latlng in ppa_geodata after reassigning values
                }
            } else {
                results[0] = []
            }

            let listoftypesofppas = ["ATM", "Bank", "School", "Hospital", "Corporate office", "Industory", "Mosque", "Bus stop", "Shop", "Stadium", "Airport", "Market", "Church", "Hotel", "University"];

            if (!helpers.isEmpty(results[2])) {

                /**
                 * add ppas that weren't in listoftypesofppas but other corpers have added them, 
                 * over time, when some types of ppas become common, we add them to listoftypesofppas
                 * 
                 * we'd make this better so that 'school' and 'School' isn't in the array
                 */
                listoftypesofppas.concat(results[2])
            } else {
                results[2] = []
            }

            resolve({
                mapdata: JSON.stringify(results[0].concat(results[1])),
                types: [...new Set(listoftypesofppas)]
            })

        });
    })

    return re;
}

/**
 * fetch chat history
 */
exports.GetChatData = async (req_session, req_query) => {
    let re = await new Promise((resolve, reject) => {
        if (req_session.loggedin && req_query.posts) { // we need to be sure that they clicked from /account

            let query = '';
            // console.log('\n\n\n\n\n uhmmmm', req_query.posts.who, req_query.posts.when, req_query.posts.type, moment(new Date(parseInt(req_query.posts.when))).format('YYYY-MM-DD HH:mm:ss'));
            // console.log( new Date(parseInt(req_query.posts.when)).toISOString().slice(0, 19).replace('T', ' ') ); // typeof req_query.posts.when = string

            // ALSO SELECT OLDMESSAGES THAT ARE NOT SENT... THEN COUNT THEM... 
            if (req_query.posts.type == 'accommodation') {
                query = "SELECT * FROM accommodations WHERE statecode = '" + req_query.posts.who + "' AND input_time = '" + moment(new Date(parseInt(req_query.posts.when))).format('YYYY-MM-DD HH:mm:ss') + "' ; "
                    // + "SELECT * FROM chats WHERE room LIKE '%" + req_query.s + "%' AND message IS NOT NULL ;"
                    +
                    "SELECT chats.room, chats.message, chats.message_from, chats.message_to, chats.media, chats.time, chats.read_by_to, chats.time_read, chats._time, chats.message_sent, info.firstname AS sender_firstname, info.lastname AS sender_lastname FROM chats, info WHERE info.statecode = chats.message_from AND chats.room LIKE '%" + req_query.s + "%' AND chats.message IS NOT NULL ;"
                    // + "SELECT * FROM chats WHERE room LIKE '%" + req_query.s + "%' AND message IS NOT NULL AND message_sent = false ;";
                    +
                    "SELECT * FROM chats WHERE message_to = '" + req_query.s + "' AND message IS NOT NULL AND message_sent = false ;" +
                    "SELECT * FROM chats WHERE message_from = '" + req_query.s + "' AND message IS NOT NULL AND message_sent = false ;" +
                    "SELECT firstname, lastname FROM info WHERE statecode = '" + req_query.posts.who.toUpperCase() + "' ;";

            } else if (req_query.posts.type == 'sale') { // we will only do escrow payments for products sale
                query = "SELECT * FROM posts WHERE statecode = '" + req_query.posts.who + "' AND post_time = '" + req_query.posts.when + "' ;"
                    // + " SELECT * FROM chats WHERE room LIKE '%" + req_query.s + "%' AND message IS NOT NULL ;"
                    +
                    "SELECT chats.room, chats.message, chats.message_from, chats.message_to, chats.media, chats.time, chats.read_by_to, chats.time_read, chats._time, chats.message_sent, info.firstname AS sender_firstname, info.lastname AS sender_lastname FROM chats, info WHERE info.statecode = chats.message_from AND chats.room LIKE '%" + req_query.s + "%' AND chats.message IS NOT NULL ;"
                    // + " SELECT * FROM chats WHERE room LIKE '%" + req_query.s + "%' AND message IS NOT NULL AND message_sent = false ;";
                    +
                    "SELECT * FROM chats WHERE message_to = '" + req_query.s + "' AND message IS NOT NULL AND message_sent = false ;" +
                    "SELECT * FROM chats WHERE message_from = '" + req_query.s + "' AND message IS NOT NULL AND message_sent = false ;" +
                    "SELECT firstname, lastname FROM info WHERE statecode = '" + req_query.posts.who.toUpperCase() + "' ;";

            }
            /**SELECT chats.room, chats.message, chats.message_from, chats.message_to, chats.media, chats.time, chats.read_by_to, chats.time_read, chats._time, chats.message_sent, info.firstname AS sender_firstname, info.lastname AS sender_lastname FROM chats, info WHERE info.statecode = chats.message_from AND chats.room LIKE '%AB/17B/1234%' AND chats.message IS NOT NULL   */

            connectionPool.query(query, function (error, results, fields) {

                if (error) reject(error);

                // console.info('\nold chats', results[1], '\nfrom db successfully');
                // so if the newchat has chatted before, i.e. is in oldchats, then just make it highlighted
                // then send it to the chat page of the involved parties so they are remainded of what they want to buy
                resolve({
                    statecode: req_session.statecode.toUpperCase(),
                    statecode2: req_query.s,
                    servicestate: req_session.servicestate,
                    batch: req_session.batch,
                    name_of_ppa: req_session.name_of_ppa,
                    postdetails: (isEmpty(results[0]) ? null : results[0]), // tell user the post no longer exists, maybe it was bought or something, we should delete it if it was bought, we hope not to use this function
                    newchat: {
                        statecode: req_query.posts.who.toUpperCase(),
                        name: results[4][0]
                    },
                    posttime: req_query.posts.when,
                    posttype: req_query.posts.type,
                    oldchats: results[1], // leave it like this!!
                    oldunreadchats: results[2], // messages that was sent to this user but this user hasn't seen them
                    oldunsentchats: results[3], // messages this user sent but hasn't deliver, i.e. the receipent hasn't seen it
                    total_num_unread_msg: results[2].filter((value, index, array) => {
                        return value.message_to == req_query.s && value.message_sent == 0
                    }).length
                });


            });

        }

        else if (req_session.loggedin) {
            res.set('Content-Type', 'text/html');
            // res.sendFile(__dirname + '/account.html');
            // console.log('wanna chat', req_session.statecode, req_query.s);
            var query = // "SELECT * FROM chats WHERE room LIKE '%" + req_query.s + "%' AND message IS NOT NULL;"
                "SELECT chats.room, chats.message, chats.message_from, chats.message_to, chats.media, chats.time, chats.read_by_to, chats.time_read, chats._time, chats.message_sent, info.firstname AS sender_firstname, info.lastname AS sender_lastname FROM chats, info WHERE info.statecode = chats.message_from AND chats.room LIKE '%" + req_query.s + "%' AND chats.message IS NOT NULL ;" +
                "SELECT * FROM chats WHERE message_to = '" + req_query.s + "' AND message IS NOT NULL AND message_sent = false ;" +
                "SELECT * FROM chats WHERE message_from = '" + req_query.s + "' AND message IS NOT NULL AND message_sent = false ;";
            connectionPool.query(query, function (error, results, fields) {

                if (error) reject(error);

                // console.info('got unread chats from db successfully', results[1]);

                // then send it to the chat page of the involved parties so they are remainded of what they want to buy
                resolve({ // having it named account.2 returns error cannot find module '2'
                    statecode: req_session.statecode.toUpperCase(),
                    statecode2: req_query.s,
                    servicestate: req_session.servicestate,
                    batch: req_session.batch,
                    name_of_ppa: req_session.name_of_ppa,
                    oldchats: results[0], // leave it like this!!
                    newchat: null,
                    oldunreadchats: results[1], // (isEmpty(results[1]) ? null : results[1])
                    oldunsentchats: results[2],
                    total_num_unread_msg: results[1].filter((value, index, array) => {
                        return value.message_to == req_query.s && value.message_sent == 0
                    }).length
                })
            });

        }

        else {
            reject();
        }
    })

    return re;
}

exports.SubscribeToEmailUpdates = async (req_body) => {
    let re = await new Promise((resolve, reject) => {
        if (isEmpty(req_body.email)) {
            res.status(406).send('Not Acceptable');
        } else {
            // console.log('NOT empthy');
            connectionPool.query("INSERT INTO subscribers SET ?", { email: req_body.email }, function (error, results, fields) {
                if (error) reject(error)
                if (results.affectedRows === 1) {
                    resolve()
                }
            });

        }
    })

    return re;
}

exports.AllPPAs = async () => {
    let re = await new Promise((resolve, reject) => {
        connectionPool.query("SELECT type_of_ppa FROM info WHERE type_of_ppa != ''", function (error, results, fields) {

            if (error) reject(error);
            console.log('ppa types:', results)
            var listoftypesofppas = [];
            for (let index = 0; index < results.length; index++) {
                const element = results[index].type_of_ppa;
                listoftypesofppas.push(element);

            }
            /**
             *  [ RowDataPacket { type_of_ppa: 'Radio Station' },
                  RowDataPacket { type_of_ppa: 'School' },
                  RowDataPacket { type_of_ppa: 'rew qrqew' } ]
            */
            let jkl = JSON.parse(JSON.stringify(listoftypesofppas));
            // let's hope there's no err
            resolve(jkl);
        })

    })

    return re;
}

exports.AddPlace = async (req_body) => {
    let re = await new Promise((resolve, reject) => {

        connectionPool.query("INSERT INTO places SET ?", req_body, function (error, results, fields) {
            console.log('inserted data from: ', results);
            if (error) reject(error);
            if (results.affectedRows === 1) {
                resolve()
            } else {
                reject()
            }
        });
    })

    return re;
}

exports.UpdateProfile = async (data) => {
    let re = await new Promise((resolve, reject) => {
        connectionPool.query("INSERT INTO info SET ?", data.req_body, function (error, results, field) {
            
        })
    })

    return re;
}

exports.DistinctNotNullDataFromPPAs = async (data) => {
    const mustRunQuery = "SELECT DISTINCT name_of_ppa, type_of_ppa, ppa_address, ppa_geodata, ppa_directions \
    FROM info WHERE (name_of_ppa != '' OR null and type_of_ppa != '' OR null and ppa_address != '' OR null and ppa_geodata != '' OR null); \
    SELECT * FROM accommodations WHERE expire > UTC_DATE ; \
    SELECT geo_data, name, address, street, type_of_place FROM places WHERE lga = '' AND geo_data != '' ;";

    let re = await new Promise((resolve, reject) => {

        // if we know where the ppa is, get the geo data and show it on the map
  if (data.query.nop) {
    // should we only be getting data from info ? how about [ppas in] places table ?????????????
    // we have req.query.nop=name_of_ppa + req.query.pa=ppa_address + req.query.top=type_of_ppa // also select ppa closer to it and other relevant info we'll find later
    connectionPool.query(mustRunQuery + "SELECT name_of_ppa, ppa_address, type_of_ppa, ppa_geodata, ppa_directions FROM info WHERE name_of_ppa = '" + req.query.nop + "'", function (error, results, fields) { // bring the results in ascending order

      if (error) { // gracefully handle error e.g. ECONNRESET || ETIMEDOUT || PROTOCOL_CONNECTION_LOST, in this case re-execute the query or connect again, act approprately
        console.log(error);
        reject(error)
        // throw error;
      } else if (!helpers.isEmpty(results) /* && results[3].ppa_geodata != '' */) {
        // we're not adding the GeoJSON results to an array because it's only one result
        for (index = 0; index < results[3].length; index++) {
          /**
           * {
                  "type": "Feature",
                  "properties": {
                      "name": "Coors Field",
                      "amenity": "Hospital",
                      "popupContent": "The Amenity [Hospital], then the location/street name."
                  },
                  "geometry": {
                      "type": "Point",
                      "coordinates": [ 7.5098633766174325, 5.515524804961825 ]
                  }
              }
           */
          // unstringify the ppa_geodata entry
          // results[index]['ppa_geodata'] = JSON.parse(results[index].ppa_geodata);

          // re-arrange to GeoJSON Format
          results[3][index].type = "Feature";

          results[3][index].properties = {};
          results[3][index].properties.ppa_geodata = JSON.parse(results[3][index].ppa_geodata);
          results[3][index].properties.ppa_address = results[3][index].ppa_address;
          results[3][index].properties.type_of_ppa = results[3][index].type_of_ppa;
          results[3][index].properties.name_of_ppa = results[3][index].name_of_ppa;

          // shouldn't we add name of PPA and other details as well ?!?!?

          results[3][index].geometry = {};
          results[3][index].geometry.type = "Point";
          results[3][index].geometry.coordinates = [JSON.parse(results[3][index].ppa_geodata).longitude, JSON.parse(results[3][index].ppa_geodata).latitude];

          console.log(JSON.parse(results[3][index].ppa_geodata).latlng, '======++++++++====', JSON.parse(results[3][index]['ppa_geodata']).longitude, JSON.parse(results[3][index]['ppa_geodata']).latitude);

          // delete results[3][index]['ppa_geodata'];
          // delete results[3][index]['type_of_ppa'];
          // delete results[3][index]['ppa_address'];

          // delete redundate data like longitude, latitude, and latlng in ppa_geodata after reassigning values
        }
      }

      ppa_details = {
        user: {}
      };

      if (data.session.statecode) {
        ppa_details.user.statecode = data.session.statecode.toUpperCase();
      }
      if (data.session.servicestate) {
        ppa_details.user.servicestate = data.session.servicestate;
      }
      if (data.session.batch) {
        ppa_details.user.batch = data.session.batch;
      }
      if (data.session.name_of_ppa) {
        ppa_details.user.name_of_ppa = data.session.name_of_ppa;
      }
      ppa_details.theacc = []; // make it empty
      ppa_details.theppa = results[3]; // JSON.stringify(results);
      ppa_details.nop = results[3]; // this variable is ambigious, nop == name of place, or name of ppa ... but we need it for now, just rush work for now
      ppa_details.ppas = results[0];
      ppa_details.accommodations = results[1];
      ppa_details.places = results[2];

      console.log('let\'s see nop that was searched for', ppa_details.theppa);
      // having it named 'pages/account.2' returns error cannot find module '2'
      resolve(ppa_details);
      // res.render('pages/newsearch2', ppa_details);

    });
  } else if (data.query.rr) { // if it's an accomodation
  console.log('ghghghhghghghhg')
    // req.query.it=input_time + req.query.sn=item.streetname + req.query.sc=item.statecode
    connectionPool.query(mustRunQuery + "SELECT * FROM accommodations WHERE rentrange = '" + data.query.rr + "' AND input_time = '" + data.query.it + "'", function (error, results, fields) {

      if (error) { // gracefully handle error e.g. ECONNRESET || ETIMEDOUT || PROTOCOL_CONNECTION_LOST, in this case re-execute the query or connect again, act approprately
        console.log(error);
        reject(error);
      } else if (!helpers.isEmpty(results) /* && results[3].acc_geodata != '' */) {
        
        // we're not adding the GeoJSON results to an array because it's only one result
        for (index = 0; index < results[3].length; index++) {
          /**
           * {
                  "type": "Feature",
                  "properties": {
                      "name": "Coors Field",
                      "amenity": "Hospital",
                      "popupContent": "The Amenity [Hospital], then the location/street name."
                  },
                  "geometry": {
                      "type": "Point",
                      "coordinates": [ 7.5098633766174325, 5.515524804961825 ]
                  }
              }
           */
          // unstringify the acc_geodata entry
          // results[index]['acc_geodata'] = JSON.parse(results[index].acc_geodata);

          // re-arrange to GeoJSON Format
          // results[3][index].type = "Feature"; // we don't need this for acc, even for ppa

          results[3][index].properties = {};

          if (results[3][index].acc_geodata != '') {
            results[3][index].properties.acc_geodata = JSON.parse(results[3][index].acc_geodata);
            results[3][index].properties.acc_geodata.latlng = {
              "lat": results[3][index].properties.acc_geodata.geometry.coordinates[1],
              "lng": results[3][index].properties.acc_geodata.geometry.coordinates[0]
            }

            results[3][index].geometry = {};
            results[3][index].geometry.type = "Point";
            results[3][index].geometry.coordinates = [JSON.parse(results[3][index].acc_geodata).longitude, JSON.parse(results[3][index].acc_geodata).latitude];
          } else {
            // results[3][index].properties.acc_geodata = '';
          }

          results[3][index].properties.address = results[3][index].address;
          results[3][index].properties.type = results[3][index].type;
          results[3][index].properties.price = results[3][index].price;

          // shouldn't we add name of PPA and other details as well ?!?!?

          if (results[3][index].acc_geodata != '') {
            console.log(JSON.parse(results[3][index].acc_geodata).latlng, '======++++++++====', JSON.parse(results[3][index]['acc_geodata']).longitude, JSON.parse(results[3][index]['acc_geodata']).latitude);
          }
          // delete results[3][index]['acc_geodata'];
          // delete results[3][index]['type'];
          // delete results[3][index]['address'];

          // delete redundate data like longitude, latitude, and latlng in acc_geodata after reassigning values
        }
      }

      accommodation_details = {};
      accommodation_details.ppas = results[0];
      accommodation_details.accommodations = results[1];
      accommodation_details.places = results[2];
      accommodation_details.theacc = results[3];
      accommodation_details.nop = JSON.stringify(results[3]); // this variable is ambigious, nop == name of place, or name of ppa ... but we need it for now, just rush work for now
      accommodation_details.theppa = undefined;
      // accommodation_details.nop = '[]' // || undefined; // initialize to empty because the frontend is expecting nop to be somthing. // somehow it's an array when it get to the front end, not string!!!!
      resolve(accommodation_details)
      // res.render('pages/newsearch2', accommodation_details);
    })

  } else if (req.query.type == 'accommodations') { // if it's an accomodation
    // req.query.it=input_time + req.query.sn=item.streetname + req.query.sc=item.statecode
    // inputing time from js to sql causes ish
    connectionPool.query(mustRunQuery + "SELECT * FROM accommodations WHERE statecode = '" + req.query.sc + "' AND input_time = '" + moment(new Date(req.query.it)).format('YYYY-MM-DD HH:mm:ss') + "' AND streetname = '" + req.query.sn + "'", function (error, results, fields) {
      console.log('should be here', results[3])
      if (error) { // gracefully handle error e.g. ECONNRESET || ETIMEDOUT || PROTOCOL_CONNECTION_LOST, in this case re-execute the query or connect again, act approprately
        console.log(error);
        throw error;
      } else if (!helpers.isEmpty(results) /* && results[3].acc_geodata != '' */) {
        // we're not adding the GeoJSON results to an array because it's only one result
        for (index = 0; index < results[3].length; index++) {
          /**
           * {
                  "type": "Feature",
                  "properties": {
                      "name": "Coors Field",
                      "amenity": "Hospital",
                      "popupContent": "The Amenity [Hospital], then the location/street name."
                  },
                  "geometry": {
                      "type": "Point",
                      "coordinates": [ 7.5098633766174325, 5.515524804961825 ]
                  }
              }
           */
          // unstringify the acc_geodata entry
          // results[index]['acc_geodata'] = JSON.parse(results[index].acc_geodata);

          // re-arrange to GeoJSON Format
          // results[3][index].type = "Feature"; // we don't need this for acc, even for ppa
          // here needs work
          results[3][index].properties = {};

          if (results[3][index].acc_geodata != '') {
            results[3][index].properties.acc_geodata = JSON.parse(results[3][index].acc_geodata);
            results[3][index].properties.acc_geodata.latlng = {
              "lat": results[3][index].properties.acc_geodata.geometry.coordinates[1],
              "lng": results[3][index].properties.acc_geodata.geometry.coordinates[0]
            }

            results[3][index].geometry = {};
            results[3][index].geometry.type = "Point";
            results[3][index].geometry.coordinates = [JSON.parse(results[3][index].acc_geodata).longitude, JSON.parse(results[3][index].acc_geodata).latitude];
          } else {
            // results[3][index].properties.acc_geodata = '';
          }

          results[3][index].properties.address = results[3][index].address;
          results[3][index].properties.type = results[3][index].type;
          results[3][index].properties.price = results[3][index].price;

          // shouldn't we add name of PPA and other details as well ?!?!?

          if (results[3][index].acc_geodata != '') {
            console.log(JSON.parse(results[3][index].acc_geodata).latlng, '======++++++++====', JSON.parse(results[3][index]['acc_geodata']).longitude, JSON.parse(results[3][index]['acc_geodata']).latitude);
          }

          // delete results[3][index]['acc_geodata'];
          // delete results[3][index]['type'];
          // delete results[3][index]['address'];

          // delete redundate data like longitude, latitude, and latlng in acc_geodata after reassigning values
        }
      }

      accommodation_details = {};
      accommodation_details.ppas = results[0];
      accommodation_details.accommodations = results[1];
      accommodation_details.places = results[2];
      accommodation_details.theacc = results[3];
      accommodation_details.nop = JSON.stringify(results[3]); // this variable is ambigious, nop == name of place, or name of ppa ... but we need it for now, just rush work for now
      accommodation_details.theppa = undefined;
      // accommodation_details.nop = '[]' // || undefined; // initialize to empty because the frontend is expecting nop to be somthing. // somehow it's an array when it get to the front end, not string!!!!
      // console.log('what we shold see');
      resolve(accommodation_details)
      // res.render('pages/newsearch2', accommodation_details);
    })

  } else {
    // SELECT DISTINCT name_of_ppa, type_of_ppa, ppa_address,ppa_geodata FROM info WHERE (name_of_ppa != '' OR null and type_of_ppa != '' OR null and ppa_address != '' OR null and ppa_geodata != '' OR null)

    connectionPool.query("SELECT DISTINCT name_of_ppa, type_of_ppa, ppa_address, ppa_geodata, ppa_directions FROM info \
    WHERE (name_of_ppa != '' OR null and type_of_ppa != '' OR null and ppa_address != '' OR null and ppa_geodata != '' OR null);\
    SELECT * FROM accommodations WHERE expire > UTC_DATE ; SELECT geo_data, name, address, street, type_of_place FROM places \
    WHERE lga = '' AND geo_data != '' ;", function (error, results, fields) {

      if (error) { // gracefully handle error e.g. ECONNRESET || ETIMEDOUT || PROTOCOL_CONNECTION_LOST, in this case re-execute the query or connect again, act approprately
        console.log(error);
        throw error;
      }
      console.log('looking for ooo', results)
      _details = {};
      _details.ppas = results[0];
      _details.accommodations = results[1];
      _details.places = results[2];
      _details.theppa = []; // empty
      _details.theacc = []; // empty
      _details.nop = undefined; // initialize to empty because the frontend is expecting nop to be somthing. // somehow it's an array when it get to the front end, not string!!!!
      resolve(_details)
      // res.render('pages/newsearch2', _details);
    })
  }

    })

    return re;
}

exports.GetPosts = async (data) => {
    let re = await new Promise((resolve, reject) => {
          // get response
  // so we're selecting posts newer than the ones currently in the user's timeline. or the server closed the connection error

  // SELECT * FROM accommodations ORDER BY input_time DESC LIMIT 55; SELECT ppa_address, ppa_geodata, type_of_ppa FROM info WHERE ppa_address != '' AND ppa_geodata != '' AND type_of_ppa != ''
  // console.log('search query parameters', data.query)
  let q = '', thisisit = {};
  if (data.query.s) {
      console.log('are we here?');
    q = "SELECT streetname, type, input_time, statecode, price, rentrange FROM accommodations \
    WHERE statecode LIKE '" + data.query.s.substring(0, 2) + "%' \
    ORDER BY input_time DESC LIMIT 55; SELECT name_of_ppa, ppa_address, type_of_ppa, city_town \
    FROM info WHERE ppa_address != '' AND statecode LIKE '" + data.query.s.substring(0, 2) + "%'";
  } else {
    
    for (let index = 0; index < 36/* ngstates.states_short.length */; index++) {
      const element = ngstates.states_short[index];
      q += "SELECT streetname, type, input_time, statecode, price, rentrange FROM accommodations \
      WHERE statecode LIKE '" + element + "%' ORDER BY input_time DESC LIMIT 55; \
      SELECT name_of_ppa, ppa_address, type_of_ppa, city_town FROM info \
      WHERE ppa_address != '' AND statecode LIKE '" + element + "%' ;"; // the trailing ';' is very important
    }
    // let q = "SELECT streetname, type, input_time, statecode, price, rentrange FROM accommodations ORDER BY input_time DESC LIMIT 55; SELECT name_of_ppa, ppa_address, type_of_ppa, city_town FROM info WHERE ppa_address != ''";
  }

  // console.log('search sql query ', q)
  connectionPool.query(q, function (error, results, fields) { // bring the results in ascending order

    if (error) { // gracefully handle error e.g. ECONNRESET || ETIMEDOUT || PROTOCOL_CONNECTION_LOST, in this case re-execute the query or connect again, act approprately
      console.log(error);
      reject(error)
      // throw error;
    } else if (!helpers.isEmpty(results)) {
        console.log('AGAIN we should be here?');
      // res.json({er: 'er'}); // auto sets content-type header with the correct content-type
      // res.send({ user: 'tobi' });

      // console.log('\n[=', results.length, results)

      // res.status(200).send({ data: {ppas: ppa, accommodations: acc} }); // {a: acc, p: ppa}

      if (data.query.s) {
        thisisit = {
          data: {
            ppas: results[1],
            accommodations: results[0]
          }
        };
      } else {
        thisisit = {
          data: {}
        };
        for (let index = 0, k = 0; index < results.length; index += 2, k++) {
          // never increment index like ++index or index++ or -- because you'd be changing the value of index in the next iteration
          // const element = results[index];

          // the first query // and subsequent even numbered index values of the results from the query will be in results[index]
          /* for (let i = 0; index < results[index].length; index++) {
            if (results[index][i].input_time) {
              results[index][i].age = moment(new Date(results[index][i].input_time)).fromNow()
            }
            
          } */
          console.log('\n', index, k)
          thisisit.data[ngstates.states_long[k]] = results[index].concat(results[index + 1])
          // thisisit.data[ngstates.states_long[index+1]] = results[index+1]
          // the last result of thisisit is undefined because states_long[37 + 1] is above the last index of results
        }
      }
      console.log('>>>>>>>>>>>>', thisisit)
      resolve(thisisit)
      // res.status(200).send(thisisit); // {a: acc, p: ppa}
    }
  });
    })

    return re;
}