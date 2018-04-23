var {startMockServer,basicCrudAccess,RequestType } =  require('./index')
var config = {
 port: 8888,
 persistent: true,
 objects: {
   users:basicCrudAccess('./json/users.json')
    .withCustomRequest(RequestType.GET,'/gender/:gender',(req, list)=>{
      var list = tool.getList()
      var gender = req.params.gender
      var genderList = list.filter((item)=>item.gender == gender)
      tool.setList(genderList)
      res.json({
        count:genderList.length,
        data: genderList
      })
    })
    .withCustomRequest(RequestType.DELETE,'/byName/:name',(req, res, tool)=>{
      var list = tool.getList()
      var name = req.params.name
      var deletedPerson = list.filter((item)=>item.name == name)[0]
      list = list.filter((item)=>item.name != name)
      if(deletedPerson){
        tool.setList(list)
        res.json(deletedPerson)
      }else{
        res.status(404).send({})
      }
    })
    
 }
}
startMockServer(config)