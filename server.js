//const Auth = require("@robconery/velzy-auth");
const DB = require("./lib/mongo");
const { ApolloServer } = require("apollo-server");
const fs = require("fs");
const path = require("path");
const Codegen = require("./lib/codegen");
const devDir = path.resolve("./dev");

const getDbFile = async function(){
  const dbFilePath = path.resolve(devDir,"db.js");
  if(!fs.existsSync(dbFilePath)){
    fs.writeFileSync(dbFilePath, await Codegen.dbjs())
  }
  const dbFile = require("./dev/db");
  return dbFile;
}

//generate the schema
const generateSchema = async function(){
  const db = await getDbFile();
  const schema = await Codegen.schema({db: db,rules: {}});
  //drop this into the dev folder
  const schemaPath = path.resolve(devDir,"schema.js");
  fs.writeFileSync(schemaPath, schema);
}

//load the fake data
const generateFakes = async function(){
  const db = await getDbFile();
  const fakes = await Codegen.fakes({db: db});
  const fakesPath = path.resolve(devDir,"fakes.json");
  fs.writeFileSync(fakesPath, JSON.stringify(fakes, null, 2));
}

//this is the dev starting point
const run = async function(){
  let db;
  try{
    db = await DB.init();
  }catch(err){
    console.error("Mongo can't be reached. Is your service running?");
    return;
  }
  
  //generate schema
  await generateSchema();

  //seed data
  await generateFakes();

  //load the generated bits
  const schema = require("./dev/schema");
  
  //build the schema by passing in the db to the resolvers
  const { typeDefs, resolvers } = schema.build(db);
  

  //load the faked up data
  const seeds = require("./dev/fakes.json");
  const collections = Object.keys(seeds);
  console.log("Loading up fakes...");
  for(let coll of collections){
    console.log(coll);
    try{
      await db.dropCollection(coll)
    }catch(err){
      //console.error(err) - it's OK we can swallow this
    }
    for(let doc of seeds[coll]){
      await db.collection(coll).insertOne(doc);
    }
  }

  //start up the server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({req}) => {
      
      // Get the user token from the headers.
      //const token = req.headers.authorization || '';
      //let user = null;
      // Try to retrieve a user with the token
      //if(token) user = await Auth.findByToken(token);
      //return {user}
    },
  });
  server.listen().then(({ url }) => {
    console.log(`🚀 Apollo Server ready at ${url}`);
  });
}();