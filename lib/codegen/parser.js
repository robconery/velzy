exports.parse = function(file){

  const result = {
    collections: [],
    schema: {},
    rules: {}
  }

  const keys = Object.keys(file)
  for(let key of keys){
    result.collections.push(key);
    result.schema[key]={}
  }

  //now loop over each collection
  for(let coll of keys){
    const thisCollection = file[coll];
    const fields = Object.keys(file[coll]);
    
    //pull the keys from the file for this collection
    for(let field of fields){
      
      if(field != "_rules") {
        result.schema[coll][field]=thisCollection[field]
      }
    }
  }
  return result;
}