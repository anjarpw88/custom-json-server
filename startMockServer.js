var express = require('express');
var bodyParser = require('body-parser');
var {
  readJson,
  writeJson,
  writeAndReload
}  = require('./fileReaderWriter')


function setupExpress(){
  const app = express()
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, access-token, refresh-token");
    next();
  })
  app.use(bodyParser.urlencoded({extended:true}));
  app.use(bodyParser.json());  
  return app;
}

function runServer(app,config){
  const port = process.env.PORT || config.port;
  app.listen(port, function (){
    console.log('server is up at localhost:'+port);
  });
}

async function startMockServer(config) {
  var app = setupExpress();
  Object.keys(config.objects).forEach((key)=>{
    var prefix = '/'+key
    var crudAccess = config.objects[key] 
    crudAccess.generate(app, prefix)
    if(config.persistent){
      crudAccess.setPersistenceProcessor((list) => {
        return writeAndReload(crudAccess.normalizedFilePath,list)
      })
    }
  })
  runServer(app,config);
}

module.exports =  startMockServer