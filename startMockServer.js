var express = require('express');
var bodyParser = require('body-parser');

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
    config.objects[key].generate(app, prefix)
  })
  runServer(app,config);
}

module.exports =  startMockServer