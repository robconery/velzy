const faker = require("faker")
module.exports = {
  users: {
    email: "{{internet.email}}",
    name: "{{name.firstName}} {{name.lastName}}",
    address: "",
    bio: "",
    signInCount: faker.datatype.integer,

    //default rules are that admins can do anything
    //users can't. Override those rules with these constructs
    // _rules: {
    //   findOne({criteria,context}){

    //   },      
    //   findMany({filter,context}){

    //   },
    //   insertOne({doc, context}){
  
    //   },
    //   insertMany({docs, context}){
  
    //   },
    //   updateOne({doc,context}){
  
    //   },      
    //   updateMany({docs,context}){
  
    //   },
    //   deleteOne({criteria,context}){
  
    //   },
    //   deleteMany({filter,context}){
  
    //   }
    // } 

  }
}