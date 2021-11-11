const Runner = require("./runner");
const settings = require("../package.json");
const go = async function(){

  let cmd = `func azure functionapp publish ${settings.azure.resourceGroup}-api`;
  await Runner.run(cmd);

  console.log("done");

}();
