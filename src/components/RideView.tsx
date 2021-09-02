import React,{useState} from 'react';
import { CustomerAccount, GetRideStateStr, Ride } from "../utils/util"; 
import { useEffect } from 'react';
import axios from 'axios';
import { GetLocationNameFromLatLong } from '../utils/data';
 
 

const RideView= ({ride,selectAndSaveRide,payDriver,customerAccount}:{ride: Ride,selectAndSaveRide:any,payDriver:any,customerAccount:CustomerAccount})=>{
 
   
    const selectRide=(address:string)=>{
        selectAndSaveRide(address);
    }

    const payRideAmount=(amount: any):void=>{
        const amountValue:number=1*amount;
        let d:any={};
        d.cost=amountValue;
        payDriver(d);
    }

    const getMinCost=(driverAddress: string):number|undefined=>{
        if(customerAccount){
            if(customerAccount.driver_address_1===driverAddress)
                return +customerAccount.cost_1;
                if(customerAccount.driver_address_2===driverAddress)
                return +customerAccount.cost_2;
                if(customerAccount.driver_address_3===driverAddress)
                return +customerAccount.cost_3;
                if(customerAccount.driver_address_4===driverAddress)
                return +customerAccount.cost_4;
        }
    }
    

    const getMaxCost=(driverAddress: string):number|undefined=>{
        if(customerAccount){
            if(customerAccount.driver_address_1===driverAddress)
                return +customerAccount.cost_1_max;
                if(customerAccount.driver_address_2===driverAddress)
                return +customerAccount.cost_2_max;
                if(customerAccount.driver_address_3===driverAddress)
                return +customerAccount.cost_3_max;
                if(customerAccount.driver_address_4===driverAddress)
                return +customerAccount.cost_4_max;
        }
    }
    
    
    useEffect(()=>{
        
    },[]);
    
     
    
    return (
        <div className="ride-view">
            
            {ride.state==="4" && 
            (
                <div className="current-ride" >
                    <h4>Completed Ride</h4>
                    
                      {/* <div>Created At: {ride.create_time}</div> */}
                        <div className="ride-details align-left">
                            <div className="map-location">
                        <span>Source:</span><h3>{GetLocationNameFromLatLong(ride.fromLat,ride.fromLong)}({+ride.fromLat},{+ride.fromLong})</h3>
                        </div>
                        
                        <div className="map-location">
                        <span>Destination:</span><h3>{GetLocationNameFromLatLong(ride.toLat,ride.toLong)}({+ride.toLat},{+ride.toLong})</h3>
                        </div>
                        
                        <div className="right padding10"><h4>Distance:{ride.distance && +ride.distance}km</h4></div>
                        <div className="padding10 margin10"><b>Final Cost:{+ride.final_cost} (SOL)</b>  <b>Paid</b></div>
                        <div className="padding10 margin10">
                        <label>Driver :<b>{ride.driverSelected}</b></label>
                       
                        </div>
                </div>
                </div>
            )
            }
           {ride.state!=="4" && 
            (
                <div>
            <div className="current-ride">
            <div className="align-left padding10"><h2>Current Ride</h2></div>
            
            <div className="ride-details align-left">
                <div className="map-location">
            <span>Source:</span><h3>{GetLocationNameFromLatLong(ride.fromLat,ride.fromLong)}({+ride.fromLat},{+ride.fromLong})</h3>
            </div>
             
            <div className="map-location">
            <span>Destination:</span><h3>{GetLocationNameFromLatLong(ride.toLat,ride.toLong)}({+ride.toLat},{+ride.toLong})</h3>
            </div>
            
            <div className="right padding10"><h4>Distance:{ride.distance && +ride.distance}km</h4></div>
            </div>
            </div>
            </div>)
            }
            {(ride.state==="2" || ride.state==="3") &&   <div className="right padding10 margin10"><b>Final Cost:{+ride.final_cost}</b></div>}
            
            
            <div className="ride-drivers align-left">
                {ride.drivers && (ride.state==="0" || ride.state==="1") &&
                    <h4>Drivers Available : {ride.drivers  &&  ride.drivers.length}</h4> }
                
                {ride.drivers && (ride.state==="0" || ride.state==="1")  && ride.drivers.map((driver)=>(
                    <div key={driver.driverAddress} className="driver-line-item">
                        <label className="w100 label">Driver:</label><label> <b>{driver.driverAddress}</b></label>
                        <br/>
                        <label className="w100 label">Cost:</label><label><b>{getMinCost(driver.driverAddress)} </b>to <b>{getMaxCost(driver.driverAddress)}</b> SOL</label>
                        <br/>
                        {
                        (ride.driverSelected!==undefined && ride.driverSelected!=="" && driver.driverAddress===ride.driverSelected && (<div className="right"><label>Waiting For Driver to confirm</label></div>))
                        ||
                        ((ride.driverSelected===undefined || ride.driverSelected==="") && <div className="right"> <button className="btn " onClick={()=>selectRide(driver.driverAddress)}>Select Driver</button></div>)
                        }
                    </div>
                ))
                }
                
            </div>
            
            {
                ride.state==="2"
                && (
                    <div className="align-left ">
                         <h4>Ongoing ride</h4> 
                        <label>Driver :<b>{ride.driverSelected}</b></label>
                        
                    </div>
                )
            }
            {/* <div>{GetRideStateStr(ride.state)}</div> */}
            {ride.state==="3" && 
            (
                <div >
                    <b className="float-left line3">Payment :</b>
                    <div className="right">
                    <b>To Pay:{+ride.final_cost} Sol</b>
                    <button className="btn" onClick={()=>payRideAmount(ride.final_cost)}>Pay Driver</button>
                    </div>
                </div>
            )}
             
        </div>
    )
}
 

export default RideView;

 