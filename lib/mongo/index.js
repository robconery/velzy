const Mongo = require("mongodb").MongoClient;
let client=null;

const dbUrl = process.env.DATABASE_URL || "mongodb://127.0.0.1:27017/"; //default to local
const dbName = process.env.DATABASE_NAME || "velzy";

exports.init = async function(){


  console.log("Connecting to", dbUrl);
  
  client = await Mongo.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  return client.db(dbName);
}

exports.db = client ? client.db(dbName) : null;

exports.close = async function(){
  if(client) await client.close(false)
}