//generated Fri Nov 12 2021 09:20:41 GMT-1000 (Hawaii-Aleutian Standard Time)

const { gql } = require('apollo-server-azure-functions');
const { GraphQLJSON } = require("graphql-type-json");
const assert = require("assert");

const typeDefs = gql`
  scalar JSON
  

  type User { 
    _id: ID
    email: String
    name: String
    address: String
    bio: String
    signInCount: String
    region: String 
  }

  input UserInput { 
    _id: ID
    email: String
    name: String
    address: String
    bio: String
    signInCount: String
    region: String 
  }

  type Query {
    User(filter: UserInput, sort: JSON, limit: Int = 500, skip: Int = 0): [User]
    UserAggregate(match: String!, group: String!): [User]
    UserFind(expression: String!, sort: JSON, limit: Int = 500, skip: Int = 0): [User]
    UserFindOne(user: UserInput!): User 
  }

  type Mutation {
    UserInsertOne(user: UserInput!): User
    UserReplaceOne(id: ID!, user: UserInput): User
    UserUpdateOne(id: ID!, update: JSON): User
    UserUpdateMany(filter: JSON!, update: JSON): [User]
    UserDeleteOne(id: ID!): JSON
    UserDeleteMany(filter: JSON!): JSON
  }

`;

const buildResolvers = (db) => {
  return {
    JSON: GraphQLJSON,

    Query: {
  
      User: (_, args, context, info) => {
        return db.collection("users")
          .find(args.query)
          .skip(args.skip)
          .sort(args.sort)
          .limit(args.limit)
          .toArray();
      },

      UserFind: (_, args, context, info) => {
        try{
          const parsed = JSON.parse(args.expression);
          return db.collection("users").find(parsed).skip(args.skip).sort(args.sort).limit(args.limit).toArray();
        }catch(err){
          //JSON parsing error - return something that's helpful
          return [{error: "Can't parse the expression. Make sure that all keys are escaped using double quotes and \\. Example: { \"age\": { \"$gt\": 4 } }"}]
        }      
      },

      UserFindOne: (_, args, context, info) => {
        return db.collection("users").findOne(args.query);
      },
    },

    Mutation: {
  
      UserInsertOne: async (_, args, context) => {
        const res = await db.collection("users").insertOne(args);
        return res.ops ? res.ops[0] : null;
      },

      UserReplaceOne: async (_, args, context) => {
        const res = await db.collection("users").replaceOne(args.filter, args.document);
        return {modified: res.modifiedCount};
      },

      UserUpdateOne: async (_, args, context) => {
        const setter = { $set: args.update}
        const res = await db.collection("users").updateOne(args.filter, setter);
        return {modified: res.modifiedCount};
      },

      UserUpdateMany: async (_, args, context) => {
        const setter = { $set: args.update}
        const res = await db.collection("users").updateMany(args.filter, setter);

        return {modified: res.modifiedCount};
      },

      UserDeleteOne: async (_, args, context) => {
        const res = await db.collection("users").deleteOne(args.filter);
        return {deleted: res.deletedCount};
      },

      UserDeleteMany: async (_, args, context) => {
        const res = await db.collection("users").deleteMany(args.filter);
        return {deleted: res.deletedCount};
      },
    },
  }
};

exports.build = function(db){
  const resolvers = buildResolvers(db);
  return {typeDefs: typeDefs, resolvers: resolvers}
};