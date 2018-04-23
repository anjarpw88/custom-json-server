var startMockServer = require('./startMockServer')
var BasicCrudAccessHelper = require('./basicCrudAccessHelper')
var fs = require('fs')

var readJson = function(path) {
  var data = fs.readFileSync(path,'utf8')
  return JSON.parse(data)    
}

module.exports = {
  startMockServer,
  readJson,
  BasicCrudAccessHelper,
}
