var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/corpersonline";

//----------create db
MongoClient.connect(url, {useNewUrlParser: true } , function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  db.close();
});



//-----------
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("corpersonline");
  dbo.createCollection("posts", function(err, res) {
    if (err) throw err;
    console.log("posts Collection created!");
    db.close();
  });

  dbo.createCollection("corpers", function(err, res) {
    if (err) throw err;
    console.log("corpers Collection created!");
    db.close();
  });

  dbo.createCollection("places", function(err, res) {
    if (err) throw err;
    console.log("places Collection created!");
    db.close();
  });
});