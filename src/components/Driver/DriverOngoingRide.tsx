import profileService from "../../solana/profile";
import React from 'react';
import { DriverAccount } from "../../utils/util";
import { GetLocationNameFromLatLong } from "../../utils/data";

const DriverOngoingRide=({driverData,customerAddress,index,ridesData,rideFinish}:{driverData:DriverAccount,customerAddress:string,index:number,ridesData:any,rideFinish:any})=>{

    const finishOngoingRide=(customer_address:string, index:number)=>{
        rideFinish(customer_address,index);
    }

    return (
        <div>
    {
        (!profileService.isAllZero(customerAddress)
        && (<div  className="driver-ongoing-ride-item align-left" >
            <label>Customer : {customerAddress}</label>
            
            <div className="customer-ride-coordinates">
                    <div>
                    
                <span className="location-label">From:</span> <span className="location-name">{GetLocationNameFromLatLong(ridesData[customerAddress].fromLat,ridesData[customerAddress].fromLong)}({+ridesData[customerAddress].fromLat},{+ridesData[customerAddress].fromLong})</span>
                <span  className="location-label">To:</span><span className="location-name">{GetLocationNameFromLatLong(ridesData[customerAddress].toLat,ridesData[customerAddress].toLong)} ({+ridesData[customerAddress].toLat},{+ridesData[customerAddress].toLong})</span>
                </div>
                <div className="left">
                <span className="location-label">Distance</span>
                <span className="location-name">{+ridesData[customerAddress].distance} km</span>
                </div>
            </div>
             
            {(
            driverData.customer_rides_to_finish[index-1]==='1'
            && <div className="right"> <button className="btn" onClick={()=>finishOngoingRide(customerAddress,index)}>Ride Finish</button></div>
            )
            ||
            (
                driverData.customer_rides_paid[index-1]==='0'
                && <div className="right"> <label><b>Awaiting Payment</b></label></div>
            )
            ||
            (
                driverData.customer_rides_paid[index-1]==='1'
                &&  <div className="right"> <label><b>Payment Done</b></label></div>
            )}
        </div>
            
            )
        
        )
    }
    {/* {
       
        !profileService.isAllZero(customerAddress) && 
        ( 
            (
            driverData.customer_rides_to_finish[1]==='1'
            && <div className="right"> <button className="btn" onClick={()=>finishOngoingRide(customerAddress,index)}>Ride Finish</button></div>
            )
            ||
            (
                driverData.customer_rides_paid[1]==='0'
                && <div className="right"> <label>Awaiting Payment</label></div>
            )
            ||
            (
                driverData.customer_rides_paid[1]==='1'
                &&  <div className="right"> <label>Payment Done</label></div>
            )
            
        )
         
    } */}
    </div>
    )

}


export default DriverOngoingRide;