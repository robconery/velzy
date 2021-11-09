
//the function starting point - has to have an export called "run"
exports.run = async (context, request) => {

  const { ApolloServer } = require("apollo-server-azure-functions");
  
  //connect to our db - this assumes it's been initialized from CLI
  const DB = require("../lib/mongo");
  
  //this will be Cosmos DB in production
  const db = await DB.init();

  //this is a copy from dev/ - it's never generated so as not to overwrite
  //your work. You can copy this using npm run print
  const schema = require("./schema");
  //build the schema by passing in the db to the resolvers
  const { typeDefs, resolvers } = schema.build(db);

  //create the Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: context
  });

  //Apollo Server provides its own handler specifically for Azure functions, which is neat and all
  //but we need to return a promise because booting MongoDB is async. That means we can't
  //just call "server.createHandler" and expect everything to work. We need to create a handler
  //which we'll wrap in a promise down below and return
  const handler = server.createHandler({
    cors: { credentials: true, origin: true },
  });

  //This is kind of convoluted but it's what we need to do. Our response simply wraps the handler
  //in a promise so that Azure Functions has what it needs to run. Boom bang nothing's easy.
  const response = new Promise((resolve, reject) => {
    const callback = (error, body) => (error ? reject(error) : resolve(body));
    handler(context, request, callback);
  });

  return response;
};
