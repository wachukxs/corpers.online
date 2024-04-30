const db = require('../models')
const helpers = require('../utilities/helpers')
const Busboy = require('busboy');
const ggle = require('../helpers/uploadgdrive');
const ngplaces = require('../utilities/ngstates')
inspect = require('util').inspect;
const auth = require('../helpers/auth')
const { Op } = require("sequelize");
const path = require('path');
const _FILENAME = path.basename(__filename);

const webpush = require('web-push');

const vapidKeys = {
  publicKey: process.env.WEB_PUSH_SERVER_PUBLIC_KEY,
  privateKey: process.env.WEB_PUSH_SERVER_PRIVATE_KEY
};

// webpush.setGCMAPIKey('<Your GCM API Key Here>'); // what's this ?
webpush.setVapidDetails(
  `mailto:${process.env.THE_EMAIL}`,
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// will never send response
exports.checkAccommodation = async (req, res) => {

  const _FUNCTIONNAME = 'checkAccommodation'
  console.log('hitting', _FILENAME, _FUNCTIONNAME);
  try {

    let _accommodation_to_find = req._accommodation_to_save.toJSON(); // might be unneccessary re-assigning

    console.log('== =>', _accommodation_to_find);

    let _found_alerts = await db.Alert.findAll({ // is an array
      where: {

        ... (_accommodation_to_find.rent && {
          max_price: {
            [Op.gte]: _accommodation_to_find.rent,
          }
        }),
        ... (_accommodation_to_find.roommateRent && {
          max_price: {
            [Op.gte]: _accommodation_to_find.roommateRent,
          }
        }),
        ... (_accommodation_to_find.rent && {
          minimum_price: {
            [Op.lte]: _accommodation_to_find.rent,
          }
        }),
        ... (_accommodation_to_find.roommateRent && {
          minimum_price: {
            [Op.lte]: _accommodation_to_find.roommateRent,
          }
        }),
        ...(_accommodation_to_find.availableRooms && {
          rooms: { // [Op.regexp] (MySQL/PG only)
            [Op.regexp]: _accommodation_to_find.availableRooms.toString().replace(/,/g, '|')
          }
        }),
      },
      include: [{
        model: db.CorpMember,
        // as: 'alertByCorper'
      }]
    })
    // Executing (default): 
    // SELECT "id", "type", "item_name", "state_code", "minimum_price", 
    // "accommodation_type", "max_price", "note", "created_at", 
    // "updated_at", "rooms", "locationId" 
    // FROM "Alerts" AS "Alert" WHERE "Alert"."max_price" <= 5780 
    // AND "Alert"."minimum_price" >= 5780 
    // AND "Alert"."rooms" ~ '^[Dining room]';

    console.log("Found these alerts:\n\n\n", _found_alerts); // .toJSON() is not a function

    if (_found_alerts && _found_alerts.length > 0) {
      for (let index = 0; index < _found_alerts.length; index++) {
        const _alert = _found_alerts[index].dataValues;

        // TODO: this will break; we no longer use alertByCorper!
        if (_alert.alertByCorper.push_subscription_stringified) {
          webpush.sendNotification(
            _alert.alertByCorper.push_subscription_stringified,
            `${_accommodation_to_find.type} at ₦${(_accommodation_to_find.roommateRent ? Intl.NumberFormat().format(_accommodation_to_find.roommateRent) + ' with a roommate.' : Intl.NumberFormat().format(_accommodation_to_find.rent))}`,
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

  } catch (error) {
    console.log('Error in', _FILENAME, _FUNCTIONNAME);
    console.error(error)
  }

}

exports.checkSale = async (req, res) => {
  const _FUNCTIONNAME = 'checkSale'
  console.log('hitting', _FILENAME, _FUNCTIONNAME);

  try {
    let _sale_to_find = req._sale_to_save.toJSON(); // might be unneccessary re-assigning

    console.log('sale to find== =>', _sale_to_find);

    console.log("\n\n\ndid reg ex work?", new RegExp(_sale_to_find.item_name
      .padEnd(_sale_to_find.item_name.length + 3, ')?)')
      .padStart(_sale_to_find.item_name.length + 3 + 2, '((')));

    let _found_alerts = await db.Alert.findAll({ // is an array
      where: {
        max_price: {
          [Op.gte]: _sale_to_find.price,
        },
        minimum_price: {
          [Op.lte]: _sale_to_find.price,
        },
        [Op.or]: [
          { item_name: _sale_to_find.item_name }, // hmmm needs more work ...what if it's mis-spelt or sth
          // doing this just because
          {
            item_name: {
              [Op.regexp]: _sale_to_find.item_name.replace(/\s/g, '|')
            }
          }
        ]
      },
      include: [{
        model: db.CorpMember,
      }]
    })

    console.log("Found these alerts:\n\n\n", _found_alerts); // .toJSON() is not a function

    if (_found_alerts && _found_alerts.length > 0) {
      for (let index = 0; index < _found_alerts.length; index++) {
        const _alert = _found_alerts[index].dataValues;

        // TODO: this would crash, we no longer use alertByCorper
        if (_alert.alertByCorper.push_subscription_stringified) {
          webpush.sendNotification(
            _alert.alertByCorper.push_subscription_stringified,
            `${_sale_to_find.item_name} selling at ₦${Intl.NumberFormat().format(_sale_to_find.price)}`,
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
  } catch (error) {
    console.log('Error in', _FILENAME, _FUNCTIONNAME);
    console.error(error)
  }
}