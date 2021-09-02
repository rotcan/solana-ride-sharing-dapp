
const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors')


const PORT = process.env.PORT || 3002;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
//app.use(express.bodyParser());

let data={customers:{},drivers:{},admin:{}
,locations:{
  "Location1":{lat:"17.2324",lng:"78.9846"},
  "Location2":{lat:"17.2124",lng:"78.7685"},
  "Location3":{lat:"17.1024",lng:"78.5469"},
  "Location4":{lat:"17.2293",lng:"78.7865"},
  "Location5":{lat:"17.2103",lng:"78.3345"},
  "Location6":{lat:"17.2906",lng:"78.1235"},
  "Location7":{lat:"17.2081",lng:"78.0974"},
  "Location8":{lat:"17.1879",lng:"78.9356"}
},
distance:{
  "Location1":{
    "Location2":"8.5" ,
    "Location3":"7" ,
    "Location4":"10.5" ,
    "Location5":"12.5" ,
    "Location6":"9.5" ,
    "Location7":"7.5" ,
    "Location8":"10.5" 
  },
  "Location2":{
    "Location1":"8.5" ,
    "Location3":"10.8" ,
    "Location4":"4.5" ,
    "Location5":"16.5" ,
    "Location6":"9.9" ,
    "Location7":"8.6" ,
    "Location8":"13.5" 
  },
  "Location3":{
    "Location1":"8.5" ,
    "Location2":"8.8" ,
    "Location4":"10.5" ,
    "Location5":"12.5" ,
    "Location6":"10.9" ,
    "Location7":"12.6" ,
    "Location8":"6.5" 
  },
  "Location4":{
    "Location1":"17.5" ,
    "Location2":"8.2" ,
    "Location3":"7.59" ,
    "Location5":"8.90" ,
    "Location6":"6.9" ,
    "Location7":"13.6" ,
    "Location8":"9.5" 
  }
  ,"Location5":{
    "Location1":"16.5" ,
    "Location2":"6.2" ,
    "Location3":"19.59" ,
    "Location4":"7.60" ,
    "Location6":"3.9" ,
    "Location7":"10.6" ,
    "Location8":"15.5" 
  }
  ,"Location6":{
    "Location1":"12.5" ,
    "Location2":"8.2" ,
    "Location3":"6.59" ,
    "Location4":"6.60" ,
    "Location5":"5.9" ,
    "Location7":"19.6" ,
    "Location8":"12.5" 
  }
  ,"Location7":{
    "Location1":"11.5" ,
    "Location2":"8.2" ,
    "Location3":"12.59" ,
    "Location4":"4.60" ,
    "Location5":"8.9" ,
    "Location6":"11.6" ,
    "Location8":"18.5" 
  }
  ,"Location8":{
    "Location1":"10.5" ,
    "Location2":"5.2" ,
    "Location3":"10.59" ,
    "Location4":"9.60" ,
    "Location5":"5.9" ,
    "Location6":"16.6" ,
    "Location7":"12.5" 
  }
}

};


app.get("/api", (req, res) => {
    res.json({ message: "Hello from server!" });
    });

app.post("/saveCustomerRide",(req,res)=>{
   console.log(req.body);
   //console.log(req.data);
   let inputJson=  req.body;
   //console.log(JSON.parse(inputJson));
   data.customers[inputJson.key]=inputJson;
   //console.log(data.customers);
   res.header('Access-Control-Allow-Origin', '*');
   res.send(data.customers);
});

app.get("/locations",(req,res)=>{
  
  res.send(data.locations);
});

app.post("/distance",(req,res)=>{
  let inputJson= req.body.json;

  res.send(data.distance[inputJson.location1][inputJson.location2]);
});


app.get("/getCustomerRides",(req,res)=>{
  //let inputJson=req.body;
  let program_id=req.query.program_id;
  let programCustomers={};
  for (var key of Object.keys(data.customers)) {
    if (data.customers[key].program_id===program_id)
      programCustomers[key]=data.customers[key];
  }
    res.header('Access-Control-Allow-Origin', '*');
   res.send(data.customers);
});

app.post("/saveDriverLocation",(req,res)=>{
  let inputJson= req.body.json;
  data.drivers.push(inputJson);
});


app.post("/saveAdmin",(req,res)=>{
  let inputJson= req.body.json;
  data.admin=inputJson
});
    

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});


