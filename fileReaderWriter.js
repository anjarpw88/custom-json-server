var fs = require('fs')



var read = function(filePath) {
  var data = fs.readFileSync(filePath,'utf8')
  return JSON.parse(data)    
}  
var write = function(filePath, data) {
  var content = JSON.stringify(data,null, 2)
  fs.writeFileSync(filePath, content, 'utf8')
}
var writeAndReload = function(filePath, data){
  write(filePath, data)
  return read(filePath)
}
var manageFile = function(filePath) {
  return {
    read: () => read(filePath),
    write: (list) => write(filePath, list)  
  }
}
module.exports = {
  read,
  write,
  writeAndReload,
  manageFile
}