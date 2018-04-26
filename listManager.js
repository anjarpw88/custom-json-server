var path = require('path'),
    callsite = require('callsite')


var listManager = function(filePath){
  var stack = callsite()
  var callerDirectory = path.dirname(stack[1].getFileName())
  var normalizedFilePath = path.join(callerDirectory, filePath)

  
  var rwTool = null
  var identifyingFunc = (item) => item.id.toString() + ''
  var assigningFunc = (item, id) => item.id = parseInt(id) 
  var generatingNextIdFunc = (list, newItem) => {
    if(list){
      var max = list.reduce((max, item) => item.id > max? item.id: max, 0)
      newItem.id = max + 1  
    }
  }
  var get = function (id) {
    return rwTool.read().filter((item)=>identifyingFunc(item) == id)[0]
  }
  var getMany = function () {
    return rwTool.read()
  }
  var add = function (item) {
    var list = rwTool.read()
    generatingNextIdFunc(list,item)    
    list.push(item)
    rwTool.write(list)
    return item
  }
  var modify = function (toBeUpdatedItem) {
    var list = rwTool.read()  
    var item = list.filter((item)=>identifyingFunc(item) == identifyingFunc(toBeUpdatedItem))[0]
    if(!item) {
      return null
    }
    var index = list.indexOf(item)
    list.splice(index, 1, toBeUpdatedItem)
    rwTool.write(list)
    return toBeUpdatedItem
  }

  var remove = function (id) {
    var list = rwTool.read()  
    var item = list.filter((item)=>identifyingFunc(item) == id)[0]
    if(!item) {
      return null
    }
    var index = list.indexOf(item)
    list.splice(index, 1)
    rwTool.write(list)
    return item
  }

  var setRwTool = function (tool) {
    rwTool = tool
  }
  var getRwTool = function () {
    return rwTool
  }
  return {
    identifiedBy: function (func) {
      identifyingFunc = func
      return this
    },
    idGeneratedBy: function (func) {
      generatingNextIdFunc = func
      return this
    },
    assignedBy: function (func) {
      assigningFunc = func
      return this
    },
    generate: function () {
      return {
        filePath,
        identifyingFunc,
        assigningFunc,
        generatingNextIdFunc,
        setRwTool,
        getRwTool,
        get,
        getMany,
        add,
        modify,
        remove,  
      }
    }   
  }
}

module.exports = listManager