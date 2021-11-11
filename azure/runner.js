const {exec} = require("child_process");

exports.run = function(cmd){

  return new Promise((resolve, reject) => {

    exec(cmd, function(err, stdout){
      if(err) return reject(err)
      return resolve(stdout);
    });
    
  }) 
}
