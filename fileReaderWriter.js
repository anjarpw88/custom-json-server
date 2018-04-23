var fs = require('fs')



var readJson = function(filePath) {
  var data = fs.readFileSync(filePath,'utf8')
  return JSON.parse(data)    
}  
var writeJson = function(filePath, data) {
  var content = JSON.stringify(data,null, 2)
  fs.writeFileSync(filePath, content, 'utf8')
}
var writeAndReload = function(filePath, data){
  writeJson(filePath, data)
  return readJson(filePath)
}

module.exports = {
  readJson,
  writeJson,
  writeAndReload
}