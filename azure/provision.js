const Runner = require("./runner");
const settings = require("../package.json");

const dbName = `${settings.azure.resourceGroup}-db`;
const rg = settings.azure.resourceGroup;
const location = settings.azure.location;

const go = async function(){
  console.log("Guessing your IP");


  let cmd = `curl -s ipinfo.io/ip`;
  const ip = await Runner.run(cmd);

  cmd = `az group create --name ${rg} --location ${location}`
  await Runner.run(cmd);

  cmd = `az cosmosdb create -n ${dbName} \\
        --enable-free-tier true \\
        --ip-range-filter 0.0.0.0, ${ip} -g ${rg} \\
        --kind MongoDB`;

  cmd = `az cosmosdb keys list -n ${dbName} -g ${rg} --output table`;
  
  console.log("done");

}();