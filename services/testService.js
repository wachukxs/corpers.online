const Test = require('../models').Test;

module.exports = {
    /**
     * 
     * @param {*} req 
     * @param {*} res 
     * @returns 
     * needs body parser of busboy to parse html input forms
     */
  create(req, res) {
    console.log('test cntrl --', req.body)
    return Test
      .create({
        title: req.body.title,
        day: req.body.day
      })
      .then(_test => res.status(201).send(_test))
      .catch(error => res.status(400).send(error));
  },
  all(req, res) {
    return Test
      .findAll()
      .then(_tests => res.status(200).send(_tests))
      .catch(error => res.status(400).send(error));
  },
  getTest(req, res) {
    return Test.findAll({
      where: {
        id: req.params.id
      }
    })
    .then(_tests => res.status(200).send(_tests))
    .catch(error => res.status(400).send(error));
  }
};