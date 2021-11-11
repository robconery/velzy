# A GraphQL Function Starter Kit for Cosmos DB

This is a starter kit for rapid development of a GraphQL API using the Mongo driver for Cosmos DB. You create a simple JavaScript file in your function root called `db.js` and, using that, a GraphQL API is created that you can modify as needed.
The project is inspired by \[JSON Server\](https://github.com/typicode/json-server) and follows in its footsteps - but instead of a REST-y API you get radical GraphQL.

## Installation

The first thing to do is to clone this repo:

```sh
git clone https://github.com/robconery/velzy
```

This is an Azure function project and has all the files you’ll need to get your API up and running on Azure quickly using MongoDB locally, Cosmos DB remotely.
Before you can get started, however, you need to make sure you have a `DATABASE_URL` set up locally:

```sh
DATABASE_URL="mongodb://127.0.0.1:27017/"
```

If you don’t have Mongo DB installed and you’re on a Mac you can get [MongoDB.app](https://gcollazo.github.io/mongodbapp/), which runs Mongo as a service.

If Mongo is running just pop into the directory and create a `db.js` file inside of the `mongo` directory.

## The Seed File: db.js

Velzy works by consuming a local `db.js` file which is for development purposes only. This is what this file looks like:

```js
const faker = require("faker");
exports.rules = {
  authors:{
    fakes: 10
  },
  books: {
    fakes: 10
  }
}
exports.data = {
  authors : [
    {
      name: "{{name.firstName}} {{name.lastName}}",
    }
  ],
  books : [
    {
      title: '{{commerce.productName}}',
      price: faker.datatype.float,
      onHand: 1,
      published: faker.date.future
    }
  ]
}
```

As of now, there are two main exports: `data` and `rules` . For now, the only thing `rules` does is tell the generator how many documents to seed locally during development. Eventually there will be authentication rules in place.
The `data` export does two things:

1. Describes your database documents and
2. Describes the [Faker](https://github.com/marak/Faker.js/) templates for each input.

Faker, if you didn’t know, is a fake data generator that’s very easy to work with. You specify what kind of fake data you want and it takes care of the rest. Here you can see I’m using the library in two ways: directly with a declaration like `faker.date.future` and using templating which is built into Faker: `{{commerce.productName}}`.
When you start things up the `db.js` file is pulled in, parsed, and then the database is built from that. Let’s take a look.

## The GraphQL Bits

Once you have your `./mongo/db.js` file created you’re ready to go:

```sh
npm run dev
```

This will fire up an Apollo GraphQL server:

![](https://paper-attachments.dropbox.com/s_E6FE45BAB4D61FD932F1B2FC0409DCCBA350D57F32B3BBDC42919897BF28319D_1632256850595_pip_1234.jpg)

We can then head over to localhost:4000 and see our API:

![](https://paper-attachments.dropbox.com/s_E6FE45BAB4D61FD932F1B2FC0409DCCBA350D57F32B3BBDC42919897BF28319D_1632257301705_pip_1236.jpg)

That’s it! If you want to change anything, just update your `db.js` file and the server will automatically restart.

## The API

The generated bits are created for you every time the server starts up, which happens every time you change the `db.js` file. You can see the generated file by opening up `schema.js`, which is created for you:

![](https://paper-attachments.dropbox.com/s_E6FE45BAB4D61FD932F1B2FC0409DCCBA350D57F32B3BBDC42919897BF28319D_1632257459109_pip_1238.jpg)

The idea here is that you auto-generate as much as possible and, when you’re ready, you turn off the generation bits and build on top of what’s been generated. The easiest way to do this is to create your own schema file and consume *it* on server start rather than the generated one.
To change that, just head to `dev.js` (which fires up your local dev server) and change this line:

![](https://paper-attachments.dropbox.com/s_E6FE45BAB4D61FD932F1B2FC0409DCCBA350D57F32B3BBDC42919897BF28319D_1632257671780_pip_1239.jpg)

## Running in Production

This API uses Azure functions as a simple, easy and extremely cost-effective way to have a public API and you can see the bootup process in `./mongo/index.js`. It’s roughly the same as the local development experience, but nothing is generated for obvious reasons.
**Note: if you renamed your schema file you’ll need to be sure it’s updated in** `**index.js**` as well.

### Setting Up Cosmos DB

If you take a look in the `./mongo/scripts` directory you’ll see two files: `cosmos.sh` and `function.sh`. These are Azure CLI scripts for creating the Azure resources you’re going to need. Here’s the Cosmos DB generator:

```sh
#change as you need
RG=velzy
LOCATION=westus
DBNAME=$RG-db
echo "Guessing your external IP address from ipinfo.io"
IP=$(curl -s ipinfo.io/ip)
az group create --name $RG --location $LOCATION
#This might fail if you're not eligible for free tier
#if it does, remove the --enable-free-tier flag
az cosmosdb create -n $DBNAME 
  --enable-free-tier true \
  --ip-range-filter 0.0.0.0,$IP -g $RG \
  --kind MongoDB \
#This command will grab your database keys, which you'll need for your
#Connection string
echo "Pulling your keys from Azure..."
az cosmosdb keys list -n $DBNAME -g $RG --output table
```

### Setting Up Functions

You can deploy your function right from VS Code or you can run the function script:

```sh
RG=velzy
LOCATION=westus
DBNAME=$RG-db
COSMOS_KEY="find me by running the cosmos script"
COSMOS_URL="mongodb://$DBNAME:$COSMOS_KEY@$DBNAME.mongo.cosmos.azure.com:10255/?ssl=true&retrywrites=false&maxIdleTimeMS=120000&appName=$DBNAME@" ## Get this from the other script
az group create --name $RG --location $LOCATION
az storage account create \
    --name $RG-store \
    --location $LOCATION \
    --resource-group $RG \
    --sku Standard_LRS

az functionapp create \
    --resource-group $RG \
    --name $RG-api \
    --consumption-plan-location $LOCATION \
    --runtime node \
    --storage-account $RG-store
az functionapp config appsettings set 
    --name $RG-API \
    --resource-group $RG \
    --settings "DATABASE_URL=$COSMOS_URL"
```

Replace the placeholders as you need.

## To Do

In no particular order:

 - Setup simple authentication using Passport, OAuth and JWT
 - Implement authorization based on rules
 - Create a "Deploy to Azure" button


