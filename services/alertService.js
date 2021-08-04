const Sale = require('../models').Sale
const Chat = require('../models').Chat
const Media = require('../models').Media
const CorpMember = require('../models').CorpMember
const Accommodation = require('../models').Accommodation
const Alert = require('../models').Alert
const helpers = require('../utilities/helpers')
const Busboy = require('busboy');
const ggle = require('../helpers/uploadgdrive');
const socket = require('../sockets/routes')
const ngplaces = require('../utilities/ngstates')
inspect = require('util').inspect;
const auth = require('../helpers/auth')
const { Op } = require("sequelize");

const webpush = require('web-push');

const vapidKeys = {
  publicKey: process.env.WEB_PUSH_SERVER_PUBLIC_KEY,
  privateKey: process.env.WEB_PUSH_SERVER_PRIVATE_KEY
};

// webpush.setGCMAPIKey('<Your GCM API Key Here>'); // what's this ?
webpush.setVapidDetails(
  'mailto:admin@corpers.online',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// will never send response
module.exports = {
    async checkAccommodation(req, res) {
        

        let _accommodation_to_find = req._accommodation_to_save.toJSON(); // might be unneccessary re-assigning
        
        console.log('== =>', _accommodation_to_find);

        console.log("\n\n\ndid reg ex work?", new RegExp(_accommodation_to_find.availableRooms.join("|")
        .padEnd(_accommodation_to_find.availableRooms.join("|").length + 1, ']')
        .padStart(_accommodation_to_find.availableRooms.join("|").length + 3, '^[')).test('Dining room') );

        let _found_alerts = await Alert.findAll({ // is an array
            where: {
                
                ... (_accommodation_to_find.rent && {
                    maxPrice: {
                        [Op.gte]: _accommodation_to_find.rent,
                }}),
                ... (_accommodation_to_find.roommateRent && {
                    maxPrice: {
                        [Op.gte]: _accommodation_to_find.roommateRent,
                }}),
                ... (_accommodation_to_find.rent && {
                    minPrice: {
                        [Op.lte]: _accommodation_to_find.rent,
                }}),
                ... (_accommodation_to_find.roommateRent && {
                    minPrice: {
                        [Op.lte]: _accommodation_to_find.roommateRent,
                }}),

                rooms: { // [Op.regexp] (MySQL/PG only)
                    [Op.regexp]: _accommodation_to_find.availableRooms.join("|")
                        .padEnd(_accommodation_to_find.availableRooms.join("|").length + 1, ']')
                        .padStart(_accommodation_to_find.availableRooms.join("|").length + 3, '^[')
                },
            },
            include: [{
              model: CorpMember,
              as: 'alertByCorper'
            }]
        })
        // Executing (default): 
        // SELECT "id", "type", "itemname", "statecode", "minPrice", 
        // "accommodationType", "maxPrice", "note", "createdAt", 
        // "updatedAt", "rooms", "locationId" 
        // FROM "Alerts" AS "Alert" WHERE "Alert"."maxPrice" <= 5780 
        // AND "Alert"."minPrice" >= 5780 
        // AND "Alert"."rooms" ~ '^[Dining room]';

        console.log("Found these alerts:\n\n\n", _found_alerts); // .toJSON() is not a function

        if (_found_alerts && _found_alerts.length > 0) {
          for (let index = 0; index < _found_alerts.length; index++) {
            const _alert = _found_alerts[index].dataValues;

            if (_alert.alertByCorper.pushSubscriptionStringified) {
              webpush.sendNotification(
                _alert.alertByCorper.pushSubscriptionStringified,
                `${_accommodation_to_find.type} at ₦${(_accommodation_to_find.roommateRent ? _accommodation_to_find.roommateRent + ' with a roommate.' : _accommodation_to_find.rent)}`,
                // {}
              ).then((_done) => {
                console.log("sent push msg", _done);
                if (_done.statusCode == 201) { // we good
                  
                }
              })
              .catch((_err) => {
                console.error("caught this error tryna send push", _err);
              });
            } else {
              console.log("whattt ?? why no accommodation alert sent:", _alert.alertByCorper);
            }
            
            
          }
        }
        /*** 
         * sample req._accommodation_to_save.toJSON()
         * 
         * == => 
          {
            availableRooms: [ 'Sitting room', 'Bathroom', 'Dining room' ],
            type: 'accommodation',
            age: 'a few seconds ago',
            id: 4,
            statecode: 'AB/20A/1233',
            accommodationType: 'Self contain',
            tenure: 'Sublease',
            rentExpireDate: 2021-08-28T00:00:00.000Z,
            rentRange: 'yearly',
            rent: 435224,
            accommodationMedia: {
              urls: [
                'https://drive.google.com/uc?id=160b5hxRXfalRBdZgmGPiiXs8v32Uuk0x',
                'https://drive.google.com/uc?id=16VgkCTI8-a4oxj_Bxl13biurSEf_yU_z'
              ],
              id: 39,
              updatedAt: 2021-07-29T10:22:19.301Z,
              createdAt: 2021-07-29T10:22:19.301Z,
              altText: null
            },
            updatedAt: 2021-07-29T10:22:20.098Z,
            createdAt: 2021-07-29T10:22:19.300Z,
            mediaId: 39,
            roommateRent: null,
            idealRoommate: null,
            occupantDescription: null,
            locationId: 4,
            accommodationByCorper: {
              timeWithUs: 'a day ago',
              servicestate: 'ABIA',
              _location: 'ABIA',
              pushSubscriptionStringified: null,
              id: 1,
              travel_from_city: null,
              travel_from_state: null,
              accommodation_location: null,
              region_street: null,
              city_town: null,
              email: 'a.random@email.com',
              lga: null,
              stream: null,
              createdAt: 2021-07-28T12:02:29.943Z,
              batch: null,
              statecode: 'AB/20A/1233',
              updatedAt: 2021-07-28T12:02:29.943Z,
              mediaId: null,
              ppaId: null,
              password: 'pass',
              middlename: '',
              firstname: 'Udauk',
              lastname: 'Ossai',
              wantspaornot: null,
              accommodationornot: null,
              public_profile: null,
              bio: null
            },
            Location: {
              id: 4,
              mediaId: null,
              ppaId: null,
              accommodationId: 4,
              createdAt: 2021-07-29T10:22:19.834Z,
              updatedAt: 2021-07-29T10:22:19.834Z,
              directions: 'Hellooo ...this is a reflection of yourself.',
              address: '2B, Westron, Ajaokuta, Kogi State, Nigeria.',
              CorpMemberId: 1
            }
          }
        **/
  
          // maybe later, move the sending notification functionality else where so this method can be used for filtering matched alerts
  
        /* webpush.sendNotification(pushSubscription, 'Chair available for sale at ₦423.') // can payload be an object ?
        .catch((err) => {
          if (err.statusCode === 404 || err.statusCode === 410) { // 404 => "Not Found", 410 => "Gone"
            console.error('Subscription has expired or is no longer valid: ', err); // get subscription again from user
            // deleteSubscriptionFromDatabase(subscription._id);
          } else {
            throw err;
          }
        }); */
      
      
      
    },

    async checkSale(req, res) {
        let _sale_to_find = req._sale_to_save.toJSON(); // might be unneccessary re-assigning
          
        console.log('sale to find== =>', _sale_to_find);

        console.log("\n\n\ndid reg ex work?", new RegExp( _sale_to_find.itemname
          .padEnd(_sale_to_find.itemname.length + 3, ')?)')
          .padStart(_sale_to_find.itemname.length + 3 + 2, '((') ) );

        let _found_alerts = await Alert.findAll({ // is an array
            where: {
                maxPrice: {
                  [Op.gte]: _sale_to_find.price,
                },
                minPrice: {
                  [Op.lte]: _sale_to_find.price,
                },
                [Op.or]: [
                  { itemname: _sale_to_find.itemname }, // hmmm needs more work ...what if it's mis-spelt or sth
                  // doing this just because
                  {
                    itemname: {
                      [Op.regexp]: _sale_to_find.itemname
                        .padEnd(_sale_to_find.itemname.length + 3, ')?)')
                        .padStart(_sale_to_find.itemname.length + 3 + 2, '((')
                    }
                  }
                ]
            },
            include: [{
              model: CorpMember,
              as: 'alertByCorper'
            }]
        })
        // Executing (default): 
        // SELECT "id", "type", "itemname", "statecode", "minPrice", 
        // "accommodationType", "maxPrice", "note", "createdAt", 
        // "updatedAt", "rooms", "locationId" 
        // FROM "Alerts" AS "Alert" WHERE "Alert"."maxPrice" <= 5780 
        // AND "Alert"."minPrice" >= 5780 
        // AND "Alert"."rooms" ~ '^[Dining room]';

        console.log("Found these alerts:\n\n\n", _found_alerts); // .toJSON() is not a function

        if (_found_alerts && _found_alerts.length > 0) {
          for (let index = 0; index < _found_alerts.length; index++) {
            const _alert = _found_alerts[index].dataValues;

            if (_alert.alertByCorper.pushSubscriptionStringified) {
              webpush.sendNotification(
                _alert.alertByCorper.pushSubscriptionStringified,
                `${_sale_to_find.itemname} selling at ₦${_sale_to_find.price}`,
                // {}
              ).then((_done) => {
                console.log("sent push msg", _done);
                if (_done.statusCode == 201) { // we good
                  
                }
              })
              .catch((_err) => {
                console.error("caught this error tryna send push", _err);
              });
            } else {
              console.log("whattt ?? why no sale alert sent:", _alert.alertByCorper);
            }
            
            
          }
        }
    },
}