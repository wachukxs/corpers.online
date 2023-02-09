const db = require('../models');
const path = require('path');
const _FILENAME = path.basename(__filename);


/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @returns 
 * needs body parser of busboy to parse html input forms
 */
exports.create = (req, res) => {
  const _FUNCTIONNAME = 'updateProfilePhoto'
  console.log('hitting', _FILENAME, _FUNCTIONNAME);

  console.log('test cntrl --', req.body)
  return db.Test
    .create({
      title: req.body.title,
      day: req.body.day
    })
    .then(_test => res.status(201).send(_test))
    .catch(error => res.status(400).send(error));
}

exports.all = (req, res) => {
  const _FUNCTIONNAME = 'updateProfilePhoto'
  console.log('hitting', _FILENAME, _FUNCTIONNAME);

  return db.Test
    .findAll()
    .then(_tests => res.status(200).send(_tests))
    .catch(error => res.status(400).send(error));
}

exports.getTest = (req, res) => {
  const _FUNCTIONNAME = 'updateProfilePhoto'
  console.log('hitting', _FILENAME, _FUNCTIONNAME);
  
  return db.Test.findAll({
    where: {
      id: req.params.id
    }
  })
    .then(_tests => res.status(200).send(_tests))
    .catch(error => res.status(400).send(error));
}
