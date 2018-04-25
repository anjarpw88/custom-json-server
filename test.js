var {startMockServer,basicCrudAccess,RequestType, listManager } =  require('./index')
var config = {
 port: 8888,
 persistent: true,
 objects: {
   users:basicCrudAccess().listManagedBy(listManager('./json/users.json').generate())
    .withCustomRequest(RequestType.GET,'/gender/:gender',(req, res, tool)=>{
      var list = tool.read()
      var gender = req.params.gender
      var genderList = list.filter((item)=>item.gender == gender)
      res.json({
        count:genderList.length,
        data: genderList
      })
    })
    .withCustomRequest(RequestType.DELETE,'/byName/:name',(req, res, tool)=>{
      var list = tool.read()
      var name = req.params.name
      var deletedPersons = list.filter((item)=>item.name == name)
      list = list.filter((item)=>item.name != name)
      if(deletedPersons){
        tool.write(list)
        res.json(deletedPersons)
      }else{
        res.status(404).send({})
      }
    })
    
 }
}
startMockServer(config)