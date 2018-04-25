var express = require('express');
var bodyParser = require('body-parser');
var fileReaderWriter  = require('./fileReaderWriter')


function setupExpress(){
  const app = express()
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "*");
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
    var listManager = crudAccess.getListManager()
    if(listManager){
      if(config.persistent){
        listManager.setRwTool({
          read: () => fileReaderWriter.read(listManager.filePath),
          write: (list) => fileReaderWriter.write(listManager.filePath, list)
        })
      }else {
        crudAccess.listManager.rwTool = {
          list: fileReaderWriter.read(listManager.filePath),
          read: () => list,
          write: function (list) {
            this.list
          }
        }         
      }  
    }
    crudAccess.generate(app, prefix)
  })
  runServer(app,config);
}

module.exports =  startMockServer