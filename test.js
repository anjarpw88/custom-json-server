var {startMockServer,BasicCrudAccessHelper } =  require('./index')
var config = {
 port: 8888,
 persistent: true,
 objects: {
   users:BasicCrudAccessHelper.basicCrudAccess('./json/users.json')
     .withCustomRequest(BasicCrudAccessHelper.RequestType.GET,'/gender/:gender',(req, list)=>{
       var gender = req.params.gender
       var genderList = list.filter((item)=>item.gender == gender)
       return {
         list,
         responseAction : (res) => res.json({
           count:genderList.length,
           data: genderList
         }) 
       }
     })
     .withCustomRequest(BasicCrudAccessHelper.RequestType.DELETE,'/byName/:name',(req, list)=>{
      var name = req.params.name
      var deletedPerson = list.filter((item)=>item.name == name)[0]
      list = list.filter((item)=>item.name != name)
      return {
        list,
        responseAction : (res) => {
          if(deletedPerson){
            res.json(deletedPerson)
          }else{
            res.status(404).send({})
          }
        } 
      }
    })
    
 }
}
startMockServer(config)