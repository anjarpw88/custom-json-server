var path = require('path'),
    callsite = require('callsite'),
    RequestType = require('./requestType')


function basicCrudAccess() {
  var listManager = null
  var customApiHandlers = []
  var config = {
    withGet:true,
    withGetMany: true,
    withPost: true,
    withPatch: true,
    withDelete: true
  }
  var obj = {

  }

  var createApiHandler = function (app, prefix, type, path, func) {
    console.log(type,'\t', prefix + path)
    switch (type) {
      case RequestType.GET:
        app.get(prefix + path, func)
        break
      case RequestType.POST:
        app.post(prefix + path, func)
        break
      case RequestType.PATCH:
        app.patch(prefix + path, func)
        break
      case RequestType.DELETE:
        app.delete(prefix + path, func)
        break
    }
  }
  var listManagedBy = function (manager) {
    listManager = manager
    return obj
  }
  
  var withCustomRequest = function (type, path, func, rwTool) {
    customApiHandlers.push((app, prefixPath) => {
      var wrappedFunc = async (req,res) => {
        rwTool = rwTool || listManager.getRwTool()
        var returnedInfo  = await func(req, res, rwTool)
      }
      createApiHandler(app, prefixPath, type, path, wrappedFunc)
    })
    return obj
  }
  var configure =  (newConfig) => {
    config = Object.assign(config, newConfig)
    return obj
  }
  var generate = function (app, prefixPath) {
    if (!listManager) {
      return
    }
    if(config.withGet){
      createApiHandler(app, prefixPath, RequestType.GET, '/:id', (req, res) => {
        var id = req.params.id
        var item = listManager.get(id)
        if(!item){
          res.status(404).send({})
          return        
        }
        res.json(item)
      })  
    }
    if(config.withGetMany){
      createApiHandler(app, prefixPath, RequestType.GET, '', (req, res) => {
        var list = listManager.getMany()
        res.json({
          count: list.length,
          data: list
        })
      })  
    }
    if(config.withPost){
      createApiHandler(app, prefixPath, RequestType.POST, '', (req, res) => {
        var newItem = req.body
        var savedItem = listManager.add(newItem)
        res.json(savedItem)
      })  
    }
    if(config.withPatch){
      createApiHandler(app, prefixPath, RequestType.PATCH, '/:id', (req, res) => {
        var id = req.params.id
        var item = req.body
        listManager.assigningFunc(item, id)
        var savedItem = listManager.modify(item)
        if (!savedItem) {
          res.status(404).send({})
          return
        }
        res.json(savedItem)
      })  
    }

    if(config.withDelete){
      createApiHandler(app, prefixPath, RequestType.DELETE, '/:id', (req, res) => {
        var id = req.params.id        
        var deletedItem = listManager.remove(id)
        if (!deletedItem) {
          res.status(404).send({})
          return
        }
        res.json({})
      })
  
    }
    customApiHandlers.forEach(func => {
      func(app, prefixPath)
    })
  }

  var getListManager = function (){
    return listManager
  }

  Object.assign(obj, {
    withCustomRequest,
    listManagedBy,
    getListManager,
    configure,
    generate
  })

  return obj
}

module.exports = basicCrudAccess

