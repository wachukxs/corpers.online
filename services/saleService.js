const Sale = require('../models').Sale

module.exports = {
    deleteSale(req, res) {
        
      return Sale.destory({
        where: {
          post_time: req.body.post_time,
          statecode: req.session.corper.statecode.toUpperCase() 
        }
      })
      .then(_result => res.status(200).send(_result))
      .catch(error => res.status(400).send(error));
    }
}