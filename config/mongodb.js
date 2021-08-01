const { MongoClient } = require("mongodb");
const uri = "mongodb+srv://admin:admin@musiccloud.4ncxm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect((err) => {
  if (err) {
    console.log(err.errmsg);
    client.close();
  }
  console.log("Connect MongoDB Done !");
});

module.exports = { db: client.db("MusicCloud") };
