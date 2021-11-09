//this is the graphql generator that creates things using
//templates in the templates directory
//it's hard to keep this stuff organized so your eyes don't flip out
const inflector = require("inflected");
const ejs = require("ejs");
const path = require("path");
const _ = require("lodash");


const getType = ({key, val}) => {
  let type = `String`;

  if(_.isFunction(val)) val = val();

  if (key === "_id") type = `ID`;
  //else if (_.isDate(val)) type = `Date`; //the graphql-iso-date module is not compatible with graphql 15

  else if (_.isBoolean(val)) type = `Boolean`;
  
  else if (Number.isInteger(val)) type = `Int`;
  else if (Number.isFinite(val)) type = `Float`;
  else if (_.isArray(val)) type = `JSON`;
  // uhhhh errrr
  else if (_.isObject(val)) type = `JSON`;

  return type;
  
};

exports.queries = async function(parsed){
  const out = [];
  const template = path.resolve(__dirname, "./templates/queries.ejs");
  for(let collection of parsed.collections){
    const capitalized = _.startCase(inflector.singularize(collection));
    const typeName = inflector.singularize(capitalized);
    const rendered = await ejs.renderFile(template, {name: capitalized, typeName: typeName});
    out.push(rendered)
  }
  return out;
}
exports.resolvers = async function(parsed){
  const out = {
    queries: [],
    mutations: []
  };
  const resolverTemplate = path.resolve(__dirname, "./templates/query_resolvers.ejs");
  const mutationTemplate = path.resolve(__dirname, "./templates/mutation_resolvers.ejs");
  for(let collection of parsed.collections){
    const capitalized = _.startCase(inflector.singularize(collection));
    let rendered = await ejs.renderFile(resolverTemplate, {name: capitalized, collection: collection});
    out.queries.push(rendered);
    rendered = await ejs.renderFile(mutationTemplate, {name: capitalized, collection: collection});
    out.mutations.push(rendered)
  }
  return out;
}

exports.mutations = async function(parsed){
  const out = [];
  const template = path.resolve(__dirname, "./templates/mutations.ejs");
  for(let collection of parsed.collections){
    const capitalized = _.startCase(collection);
    const typeName = inflector.singularize(capitalized);
    const rendered = await ejs.renderFile(template, {name: typeName});
    out.push(rendered)
  }
  return out;
}

exports.types = async function(parsed){
  const out = [];
  const template = path.resolve(__dirname, "./templates/types.ejs");
  //this builds the type generation for each collection
  //there are filter types and input types
  for(let collection of parsed.collections){
    const singular = inflector.singularize(collection);
    const filterType = _.startCase(singular);
    const inputType = _.startCase(singular) + "Input";
    const schema = parsed.schema[collection];
    delete(schema._fakes)
    const fields = Object.keys(schema);
    const payload = {
      type: "type",
      name: filterType,
      fields: []
    }
    //always have to have an ID
    payload.fields.push({name: "_id", type: "ID"})
    for(let field of fields){
      const val = schema[field];
      const type = getType({key: field, val: val});
      payload.fields.push({name: field, type: type})
    }
    //the filter types
    let rendered = await ejs.renderFile(template, payload);
    out.push(rendered);
    //the input types
    payload.type = "input";
    payload.name = inputType;
    //do it again but now with separate types
    rendered = await ejs.renderFile(template, payload);
    out.push(rendered);
  }
  return out.join("\n");
}