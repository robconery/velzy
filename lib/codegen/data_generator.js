//this function will take in the parsed bits and spit out a bunch of JSON
const faker = require("faker");
const shortid = require("shortid");
const _ = require("lodash");

exports.generate = function(parsed){

  const out = {};
  //so ... three nested loops are kind of a bit much, but
  //I can refactor this later I suppose
  for(let collection of parsed.collections){
    out[collection] = [];
    const schema = parsed.schema[collection];
    //we should now have the proper schema
    const fields = Object.keys(schema);
    const count = schema._fakes || 10;
    for(let i = 0; i < count ; i++){
      let fakeObject={
        _id: shortid.generate()
      };
      for(let field of fields){
        if(field != "_fakes"){
          const templateValue = schema[field];
          if(_.isString(templateValue) && templateValue.indexOf("{{") > -1){
            fakeObject[field] = faker.fake(templateValue);
          }else{
            fakeObject[field] = templateValue;
          }
        }

      }
      out[collection].push(fakeObject);
    }

  }

  return out;
}