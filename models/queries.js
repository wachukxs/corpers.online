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

    var theservicestate = ngstates.states_long[ngstates.states_short.indexOf(signupData.statecode.slice(0, 2).toUpperCase())];

    var thestream = signupData.statecode.slice(5, 6).toUpperCase();

    function getstream(sb) {
        return sb == 'A' ? 1 : sb == 'B' ? 2 : sb == 'C' ? 3 : 4; // because we're sure it's gonna be 'D'
    }

    signupData.servicestate = theservicestate;
    signupData.stream = getstream(thestream);
    signupData.statecode.slice(3, 6).toUpperCase();

    // var sqlquery = "INSERT INTO info(email, firstname, middlename, password, lastname, statecode, batch, servicestate, stream) VALUES ('" + signupData.email + "', '" + signupData.firstname + "', '" + signupData.middlename + "', '" + signupData.password + "', '" + signupData.lastname + "', '" + signupData.statecode.toUpperCase() + "', '" + signupData.statecode.slice(3, 6).toUpperCase() + "', '" + theservicestate + "' , '" + getstream(thestream) + "'  )";
    /**[re]sponse for this funtion CorpersSignUp() */
    let re = await new Promise((resolve, reject) => {
        let r;
        connectionPool.query('INSERT INTO info SET ?', signupData, function (error, results, fields) {
            console.log('inserted data from: ', results);
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

exports.CorpersLogin = async (loginData) => {
    let re = await new Promise((resolve, reject) => {
        let sqlquery = "SELECT password, name_of_ppa, lga, region_street, city_town, batch, servicestate, statecode FROM info WHERE statecode = ?";
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

                reject({ message: false, result: error.code })
            } else if (helpers.isEmpty(result)) {
                reject({ message: 'sign up' }) // tell them they need to sign up
            } else if (result.length === 1) {

                resolve({ message: true, response: result })

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
 * get post for the timeline
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