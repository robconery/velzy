const GraphQL = require("./graphql");
const Parser = require("./parser");
const ejs = require("ejs");
const path = require("path");
const DataGenerator = require("./data_generator");
const templateDir = path.resolve(__dirname,"templates");



exports.dbjs = async function(){
  const template = path.resolve(templateDir, "db.ejs")
  return ejs.renderFile(template);
}

exports.fakes = function({db}){
  const parsed = Parser.parse(db);
  return DataGenerator.generate(parsed);
}

exports.schema = async function({db, rules}){
  const payload = {};
  const parsed = Parser.parse(db);

  payload.types = await GraphQL.types(parsed);
  payload.queryTypes = await GraphQL.queries(parsed)
  payload.mutationTypes = await GraphQL.mutations(parsed);
  
  const resolvers = await GraphQL.resolvers(parsed);
  payload.mutationResolvers = resolvers.mutations;
  payload.queryResolvers = resolvers.queries;

  const template = path.resolve(__dirname,"./templates/schema.ejs");
  const rendered = await ejs.renderFile(template, payload);
  return rendered;

}