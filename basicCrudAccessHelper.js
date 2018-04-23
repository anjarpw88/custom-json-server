var path = require('path'),
    callsite = require('callsite')

var {
  readJson,
  writeJson,
  writeAndReload
}  = require('./fileReaderWriter')


var RequestType = {
  GET: 'GET',
  POST: 'POST',
  PATCH: 'PATCH',
  DELETE:  'DELETE',
  PUT: 'PUT'
}

function autoIncrementIdGenerator(initialValue) {
  initialValue = initialValue || 0
  return {
    generate() {
      initialValue++
      return initialValue
    }
  }
}

function basicCrudAccess(filePath) {
  var stack = callsite()
  var callerDirectory = path.dirname(stack[1].getFileName())
  var normalizedFilePath = path.join(callerDirectory, filePath)

  var list = []
  try{
    list = readJson(normalizedFilePath)
  }catch(e){
  }
  var idGenerator = autoIncrementIdGenerator(list.length)
  var identifyingFunc = (item) => item.id
  var assigningIdFunc = (item, id) => item.id = id
  var persistentProcessorFunc = (unsavedList) => [...unsavedList]
  var customApiHandlers = []
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
  var assigningIdBy = function (func) {
    assigningIdFunc = func
    return obj
  }
  var withIdGenerator = function (generator) {
    idGenerator = generator
    return obj
  }
  var identifiedBy = function (func) {
    identifyingFunc = func
    return obj
  }
  var withCustomRequest = function (type, path, func) {
    customApiHandlers.push((app, prefixPath) => {
      var wrappedFunc = async (req,res) => {
        var returnedInfo  = await func(req, [...list])
        if(returnedInfo.list){
          list = persistentProcessorFunc(returnedInfo.list)          
        }
        if(returnedInfo.responseAction) {
          returnedInfo.responseAction(res)
        }
      }
      createApiHandler(app, prefixPath, type, path, wrappedFunc)
    })
    return obj
  }
  var setPersistenceProcessor = function (func){
    persistentProcessorFunc = func
  }
  var generate = function (app, prefixPath) {
    createApiHandler(app, prefixPath, RequestType.GET, '/:id', (req, res) => {
      var id = req.params.id
      var returnedList = list.filter((item) => identifyingFunc(item) == id)[0]
      if(!returnedList){
        res.status(404).send({})
        return        
      }
      res.json(returnedList)
    })
    createApiHandler(app, prefixPath, RequestType.GET, '', (req, res) => {
      res.json({
        count: list.length,
        data: list
      })
    })
    createApiHandler(app, prefixPath, RequestType.POST, '', (req, res) => {
      var newId = idGenerator.generate()
      var newItem = req.body
      assigningIdFunc(newItem, newId)
      list.push(newItem)
      list = persistentProcessorFunc(list)
      res.json(newItem)
    })

    createApiHandler(app, prefixPath, RequestType.PATCH, '/:id', (req, res) => {
      var id = req.params.id
      var newItem = req.body
      var item = list.filter((item) => identifyingFunc(item) == id)[0]
      if (!item) {
        res.status(404).send({})
        return
      }
      var index = list.indexOf(item)
      list.splice(index, 1, newItem)
      list = persistentProcessorFunc(list)
      res.json(newItem)

    })
    createApiHandler(app, prefixPath, RequestType.DELETE, '/:id', (req, res) => {
      var id = req.params.id
      var item = list.filter((item) => identifyingFunc(item) == id)[0]
      if (!item) {
        res.status(404).send({})
        return
      }
      var index = list.indexOf(item)
      list.splice(index, 1)
      list = persistentProcessorFunc(list)
      res.json({})
    })
    customApiHandlers.forEach(func => {
      func(app, prefixPath)
    })
    return obj
  }
  var obj = {
    generate,
    normalizedFilePath,
    setPersistenceProcessor,
    createApiHandler,
    assigningIdBy,
    withCustomRequest,
    withIdGenerator,
    identifiedBy
  }
  return obj
}

module.exports = {
  basicCrudAccess,
  autoIncrementIdGenerator,
  RequestType
}
