import profileService from "../solana/profile";
import { DUMMY_DISTANCE } from "./util";

interface ILocations {
  [key:string]:{lat:string,lng:string}
}

interface ILocDistance{
  [key:string]:string
}
interface IDistance{
  [key:string]:ILocDistance
}

export interface ICustomerData{
  [key:string]:any
}

export interface IFromTo{
  from:string,to:string
}
export const locations:ILocations={
  "Location1":{lat:"17.2324",lng:"78.9846"},
  "Location2":{lat:"17.2124",lng:"78.7685"},
  "Location3":{lat:"17.1024",lng:"78.5469"},
  "Location4":{lat:"17.2293",lng:"78.7865"},
  "Location5":{lat:"17.2103",lng:"78.3345"},
  "Location6":{lat:"17.2906",lng:"78.1235"},
  "Location7":{lat:"17.2081",lng:"78.0974"},
  "Location8":{lat:"17.1879",lng:"78.9356"}
};

export const distances:IDistance={
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
};
 

export function GetLocationNameFromLatLong(lat:string,lng:string):string|undefined{
  const unpadedLat=(+lat).toString();
  const unpadedLong=(+lng).toString();
  
for (let key in locations) {
    let value = locations[key];
   
    if(value.lat===unpadedLat && value.lng===unpadedLong){
    
        return key;
    }
      // Use `key` and `value`
  }
  return undefined;
  
}

export function GetDistanceBetweenLocations(from:string,to:string):string|undefined{
  const dist=distances[from][to];
  return dist;
}

export function getDriverDistance(totalDis:number, customerCount:number):number{
  let totalDistance:number = totalDis;
  let ratio: number=1.2;
  if (customerCount===2)
    ratio=0.85;
  if (customerCount===3)
    ratio=0.7;

  totalDistance=totalDistance*ratio;
  return totalDistance;
}
 
export function GetRandomDriverDistance(customerLocs:string[]):string{
  let totalDistance=0;
  for(let i=0;i<customerLocs.length;i+=2){
      const start:string=customerLocs[i];
      const to:string =customerLocs[i+1];
      
      const dist=distances[start][to];
      const distF:number=+dist;
      totalDistance+=distF;
  }
   
  totalDistance=getDriverDistance(totalDistance,customerLocs.length/2);
  const totalDistanceStr: string=(Math.round((totalDistance!) * 10) / 10).toString();
  return profileService.padZeroNumeric(totalDistanceStr,DUMMY_DISTANCE);
}

export function GetMinMax(currentCustomer:any,allCustomers:any,ridesData:any):any[]{
  
  let customerTotal=+ridesData[currentCustomer].distance;
  //all three 
  let total=0
  let c1total=0;
  let r1total=0;
  let c2total=0;
  let r2total=0;
  let c3total=0;
  let r3total=0;
  for(let i=0;i<allCustomers.length;i++){
    let df:number=+ridesData[allCustomers[i]].distance;
    total=total+df;
  }
  let dtotal=getDriverDistance(total,allCustomers.length);
  let c1cost=dtotal*customerTotal/total;
  // console.log("total",total);
  // console.log("dtotal",dtotal);
  // console.log("customerTotal",customerTotal);
  r1total=total;
  c1total=dtotal;
  //other two 
  total=0
  let c2cost=0;
  let c3cost=0;
  if(allCustomers.length===3){
    let selIndex=-1;
    for(let i=0;i<allCustomers.length;i++){
      if (allCustomers[i]!==currentCustomer && selIndex===-1){
        selIndex=i;
        let df:number=+ridesData[allCustomers[i]].distance;
        total=total+df;
      }
      if(allCustomers[i]===currentCustomer ){
        let df:number=+ridesData[allCustomers[i]].distance;
        total=total+df;
      }
    }
    dtotal=getDriverDistance(total,allCustomers.length-1);
    c2cost=dtotal*customerTotal/total;
    c2total=dtotal;
    r2total=total;

    let sel2index=-1;
    for(let i=0;i<allCustomers.length;i++){
      if (allCustomers[i]!==currentCustomer && sel2index===-1 && i!==selIndex){
        sel2index=i;
        let df:number=+ridesData[allCustomers[i]].distance;
        total=total+df;
      }
      if(allCustomers[i]===currentCustomer ){
        let df:number=+ridesData[allCustomers[i]].distance;
        total=total+df;
      }
    }
    dtotal=getDriverDistance(total,allCustomers.length-1);
    c3cost=dtotal*customerTotal/total;
    c3total=dtotal;
    r3total=total;
    
  }
  if(allCustomers.length===2){
    total=customerTotal;
    dtotal=getDriverDistance(total,allCustomers.length-1);
    c2cost=dtotal*customerTotal/total;
    c2total=dtotal;
    r2total=total;
    
  }
  let min =[];
  let max=[];
  if(c3cost===0)
  {
    if(c1cost>c2cost)
    {
      min.push(r2total);
      min.push(c2total);
      max.push(c1cost);
      max.push(c1total); 
    }else{
      min.push(r1total);
      min.push(c1total);
      max.push(c2cost);
      max.push(c2total); 
    }
  }else{
    if(c1cost>c3cost){

        if(c1cost>c2cost)
        {
          max.push(r1total);
          max.push(c1total); 
        }else{
          max.push(r2total);
          max.push(c2total); 
        }
    }else{
      if(c3cost>c2cost)
        {
          max.push(r3total);
          max.push(c3total); 
        }else{
          max.push(r2total);
          max.push(c2total); 
        }
    }

    if(c1cost<c3cost){

        if(c1cost<c2cost)
        {
          min.push(r1total);
          min.push(c1total); 
        }else{
          min.push(r2total);
          min.push(c2total); 
        }
    }else{
      if(c3cost<c2cost)
        {
          min.push(r3total);
          min.push(c3total); 
        }else{
          min.push(r2total);
          min.push(c2total); 
        }
    }
  }
  let final=[];
  final.push([profileService.padZeroNumeric((Math.round((min[0]) * 10) / 10).toString(),DUMMY_DISTANCE),
  profileService.padZeroNumeric((Math.round((min[1]) * 10) / 10).toString(),DUMMY_DISTANCE)]);
  final.push([profileService.padZeroNumeric((Math.round((max[0]) * 10) / 10).toString(),DUMMY_DISTANCE),
  profileService.padZeroNumeric((Math.round((max[1]) * 10) / 10).toString(),DUMMY_DISTANCE)]);
  console.log("final",final);
  
  return final;
}