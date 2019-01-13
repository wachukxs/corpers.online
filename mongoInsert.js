var MongoClient = require('mongodb').MongoClient;

var url = 'mongodb://localhost:27017/';

MongoClient.connect(url, {useNewUrlParser: true}, function (err, db) {
    let database = db.db('corpersonline');
    var collection = database.collection('places');
    // uncomment all the req.params in production code
    console.log('req.params');
    var doc2 = {
      nameOfPlace: 'req.params.nameOfPlace',
      street: 'req.params.street',
      category: 'req.params.category',
      district: 'req.params.district',
      lga: 'req.params.lga'
    }
    //collection.insert(doc2, {w:1}, function(err, result) {});
    collection.insertOne(doc2);
    console.log('one in!');
    db.close();
  });