import { PublicKey } from '@solana/web3.js';
import axios from 'axios';
import React, { useEffect } from 'react';
import { useState } from 'react';
import profileService from '../../solana/profile';
import { programId } from '../../solana/program';
import { getDriverDistance, GetLocationNameFromLatLong, GetMinMax, GetRandomDriverDistance, ICustomerData, IFromTo } from '../../utils/data';
import { DriverAccount, DUMMY_DISTANCE, MAX_ALLOWED_RIDES, replaceAt } from '../../utils/util';
import { useInterval } from '../UseInterval';
import DriverOngoingRide from './DriverOngoingRide';

const REFRESH_INTERVAL=5000;

const DriverView = ({address,selectRides,driverData,startRide,endRide}:{address: PublicKey|undefined,selectRides:any
    ,driverData:DriverAccount|undefined,startRide:any,endRide:any} )=>{
    
    
    const [ridesData,setRidesData]=useState<any | undefined>();
    const [driverPresent,setDriverPresent]=useState<any|undefined>();
    const [totalDistance,setTotalDistance]=useState<number|0>();
    const [customersConfirmed,setCustomersConfirmed]=useState<any|undefined>();
    const [customerSelected,setCustomersSelected]=useState<any|undefined>();
    // const [ridesToFinish, setRidesToFinish]=useState<any|undefined>();


    useEffect(()=>{
        
        getAllCustomerRides();
        //console.log("ridesData",ridesData);
        //fetchRides();

    },[]);

    useInterval(async ()=>{
        getAllCustomerRides();
    },REFRESH_INTERVAL
    );

    const getCustomerSelected=():string[]=>{
        let customers:string[]=[];

        if(!profileService.isAllZero(driverData!.customer_1))
            customers.push(driverData!.customer_1);
        if(!profileService.isAllZero(driverData!.customer_2))
            customers.push(driverData!.customer_2);
        if(!profileService.isAllZero(driverData!.customer_3))
            customers.push(driverData!.customer_3);
        return customers;
    }

    
    const getCustomersConfirmed=():{}=>{
        let confirmed:any={};
        let toFinish:any={}
        if(!profileService.isAllZero(driverData!.customer_1)){
            confirmed[driverData!.customer_1]=driverData!.customer_1_confirm;
            
        }
        if(!profileService.isAllZero(driverData!.customer_2)){
        confirmed[driverData!.customer_2]=driverData!.customer_2_confirm;
        }
        if(!profileService.isAllZero(driverData!.customer_3)){
        confirmed[driverData!.customer_3]=driverData!.customer_3_confirm;
        }
        return confirmed;
    }
    const getAllCustomerRides=():void=>{
        axios({
            url: 'http://localhost:3002/getCustomerRides/?program_id='+programId,
            method: 'get',
          }).then(response => {
            console.log("getallcustomerrides response", response.data);
            let checks:any={}

            let previousSaves=driverPresent;
            if(previousSaves===undefined)
                previousSaves={};
            const alreadySelected: string[]=getCustomerSelected();
            setCustomersSelected(alreadySelected);

            const cc:any = getCustomersConfirmed(); 
            setCustomersConfirmed(cc);

            for(let i =0 ;i<alreadySelected.length;i++)
                previousSaves[alreadySelected[i]]=true;
            for(let key in cc)
                previousSaves[key]=true;

            console.log("cc",cc);
            console.log("cc filter",Object.keys(cc).filter((key:any)=>{return cc[key]==="1"}).length);
            let customersData:ICustomerData={};
            for(var key in response.data){
                var element = response.data[key];
                if (element.program_id===programId.toBase58() && GetLocationNameFromLatLong(response.data[key].fromLat,response.data[key].fromLong))
                {
                    customersData[element.key]=response.data[key];
                    checks[response.data[key].key]=previousSaves[response.data[key].key];
                }
            }
           
            setDriverPresent(checks);
            setRidesData(customersData);
            console.log(checks);
          })
          .catch(error => {
            console.log(error)
          })
    }

   
    //select and save customer rides
    const saveRides=(e: React.MouseEvent<HTMLButtonElement,MouseEvent>)=>{
        e.preventDefault();
        let d:any={};
        let ridesDistance:number=0;
        d["customers"]=[]
        d["minmax"]=[];
        console.log(driverPresent);
        const keys:any= Object.keys(driverPresent)
        for(let i=0;i<keys.length;i++){
            if(driverPresent[keys[i]]===true){
                d["customers"].push(keys[i]);
               
            }
        }
        if(ridesData){
            // console.log(ridesData);
            for (let i=0;i<d["customers"].length;i++){
                let current=d["customers"][i];
                let minmax:any[]=GetMinMax(current,d["customers"],ridesData);
                // console.log(minmax);
                d["minmax"].push(minmax);
            }

            for(let i=0;i<keys.length;i++){
                if(driverPresent[keys[i]]===true){
                    ridesDistance=ridesDistance + 1*ridesData[keys[i]].distance;
                }
            }
            let dist:string=(Math.round((totalDistance!) * 10) / 10).toString();
            d["ridesDistance"]=profileService.padZeroNumeric((Math.round((ridesDistance) * 10) / 10).toString(),DUMMY_DISTANCE);
            d["distance"]=profileService.padZeroNumeric(dist,DUMMY_DISTANCE);
            //get max and min cost
            selectRides(d);
        }
    }



    const getSelectedCustomers=(drvPresent:any):string[]=>{
        let cls:string[]=[];
        const keys:any= Object.keys(drvPresent)
        for(let i=0;i<keys.length;i++){
            if(drvPresent[keys[i]]===true){
                const from: string|undefined=GetLocationNameFromLatLong(ridesData[keys[i]].fromLat, ridesData[keys[i]].fromLong);
                const to : string|undefined=GetLocationNameFromLatLong(ridesData[keys[i]].toLat, ridesData[keys[i]].toLong);
                if(from && to){
                    cls.push(from);
                    cls.push(to);
                }
            }
        }
        return cls
    }
    const setChecked=(key:string):void=>{
        let dpresent:any =driverPresent;
        
        dpresent[key]=!dpresent[key];
        let selCount=0;
        const keys:any= Object.keys(dpresent)
        for(let i=0;i<keys.length;i++){
            if(dpresent[keys[i]]===true)
                selCount+=1;
        }
        if(selCount>MAX_ALLOWED_RIDES)
        {
            dpresent[key]=!dpresent[key];
            alert("Only 3 rides allowed per driver for now!");    
        }
        console.log(dpresent);
      
        const selCustomers:string[]=getSelectedCustomers(dpresent);
        const driverDistance:string=GetRandomDriverDistance(selCustomers);
        setTotalDistance(+driverDistance);
        setDriverPresent(dpresent);
    }

    const setInputChange=async(e: any)=>{
        e.preventDefault();
        setTotalDistance(e.currentTarget.value);
    }

    const startRideClick=():void=>{
        let d: any={}
        let confirmedRidesStr:string="0000";
        //d.ridesDistance=
        d["customers"]=[];
        let ridesDistance:number=0;
        let customerCount: number=0;
        if(!profileService.isAllZero(driverData!.customer_1)){
            confirmedRidesStr=replaceAt(confirmedRidesStr,0,driverData!.customer_1_confirm)
            if(driverData!.customer_1_confirm === "1"){
                ridesDistance=ridesDistance+1*ridesData[driverData!.customer_1].distance;
                customerCount=customerCount+1;
            }
            d["customers"].push(driverData!.customer_1);
        }
        if(!profileService.isAllZero(driverData!.customer_2)){
            confirmedRidesStr=replaceAt(confirmedRidesStr,1,driverData!.customer_2_confirm)
            if(driverData!.customer_2_confirm === "1"){
                ridesDistance=ridesDistance+1*ridesData[driverData!.customer_2].distance;
                customerCount=customerCount+1;
            }
            d["customers"].push(driverData!.customer_2);
        }
        if(!profileService.isAllZero(driverData!.customer_3)){
            confirmedRidesStr=replaceAt(confirmedRidesStr,2,driverData!.customer_3_confirm)
            if(driverData!.customer_3_confirm === "1"){
                ridesDistance=ridesDistance+1*ridesData[driverData!.customer_3].distance;
                customerCount=customerCount+1;
            }
            d["customers"].push(driverData!.customer_3);
        }
        d["confirmedRides"]=confirmedRidesStr;
        //new distance for confirmed customers only
        let newDistance: number=getDriverDistance(ridesDistance,customerCount)
        let dist:string=(Math.round((newDistance) * 10) / 10).toString();
        d["ridesDistance"]=profileService.padZeroNumeric((Math.round((ridesDistance) * 10) / 10).toString(),DUMMY_DISTANCE);
        d["distance"]=profileService.padZeroNumeric(dist,DUMMY_DISTANCE);
        //console.log(d);
        startRide(d);
    }   

    const rideFinish=(customerAddress: string, index:number):void=>{
        // console.log("customerAddress",customerAddress);
        // console.log("index",index);
        if(driverData!==undefined){
            let ridesToFinish:string=driverData.customer_rides_to_finish;
            ridesToFinish=replaceAt(ridesToFinish,(index-1),"0");
            const d:any={customerAddress:customerAddress,ridesToFinish:ridesToFinish};
            console.log(d);
            endRide(d);
        }
    }

    return(
        <div className="driver-rides">

            {driverData!==undefined && (driverData!.ride_state==="0" || driverData!.ride_state==="1") &&
             ridesData &&  Object.keys(ridesData).map((k:any,index:number)=>(
                
                <div key={ridesData[k].key} className="customer-ride">
                    <div className="customer-name">
                        <label>({index+1}) Customer : </label> 
                        <h4>{ridesData[k].key}</h4>
                    </div>
                    <div className="customer-ride-coordinates">
                         <div>
                         
                        <span className="location-label">From:</span> <span className="location-name">{GetLocationNameFromLatLong(ridesData[k].fromLat,ridesData[k].fromLong)}({+ridesData[k].fromLat},{+ridesData[k].fromLong})</span>
                        <span  className="location-label">To:</span><span className="location-name">{GetLocationNameFromLatLong(ridesData[k].toLat,ridesData[k].toLong)} ({+ridesData[k].toLat},{+ridesData[k].toLong})</span>
                        </div>
                        <div className="left">
                        <span className="location-label">Distance</span>
                        <span className="location-name">{+ridesData[k].distance} km</span>
                        </div>
                    </div>
                     {/*
                    <div>{ridesData[k].fromLat}</div>
                    <div>{ridesData[k].toLat}</div>
                    <div>{ridesData[k].fromLong}</div>
                    <div>{ridesData[k].toLong}</div>
                    <div>{ridesData[k].distance}</div> */}
                     
                    {/* {ridesData[k].drivers.filter((element:any, index:any, array:any)=>{return element.driverAddress===address!.toBase58()}).map((driver:any)=>(
                        <div>
                            <label>Driver</label>
                            <div>{driver.driverAddress}</div>
                            <div>{driver.driverCost}</div>
                            <input type="checkbox" 
                            onChange={()=>setChecked(ridesData[k].key)}
                            defaultChecked={driver.driverAddress===address!.toBase58()} 
                            disabled={driver.driverAddress===address!.toBase58()}/>
                        </div>
                    ))}
                     */
                    <div className="customer-ride-status align-right">
                        <div>
                    <label>Select Customer</label>
                    <input type="checkbox" 
                    onChange={()=>setChecked(ridesData[k].key)}
                    defaultChecked={driverPresent[ridesData[k].key]} 
                    {...(ridesData[k].key in driverPresent && customerSelected.indexOf(ridesData[k].key)>-1 && {disabled: true})}
                        
                    />
                    </div>
                    <label>{(ridesData[k].key in customersConfirmed && "Not Selected") &&( (customersConfirmed[ridesData[k].key] === "1" && "*Confirmed*") || (customersConfirmed[ridesData[k].key] === "0" && "*Pending Confirmation*"))}</label>
                    </div>
                     }
                </div>
            ))
            
            }
            {
            (customersConfirmed && Object.keys(customersConfirmed).length>0 && Object.keys(customersConfirmed).filter((key:any)=>{return customersConfirmed[key]==="1"}).length>=2 && driverData!.ride_state==="1" &&
            (
                <div className="right">
                    <label>TotalDistance (Randomly calculated)= {totalDistance && (+totalDistance || 0)} km</label>
                    <button onClick={startRideClick} className="btn">Start Ride</button>
                </div>
            )
            )||
            (
                driverData!.ride_state==="1" &&
                customerSelected && customerSelected.length>=2 && 
                (
                    <div className="right">
                    <label>Wait For Customer Confirmations</label>
                    </div>
                    
                )
                && customerSelected.length<=2 && 
                (
                    <div className="right">
                    <label>TotalDistance (Randomly calculated)= {totalDistance && (+totalDistance || 0)} km</label>
                    <button onClick={saveRides} className="btn">Save Rides</button>
                    </div>    
                )
            )
            || (
                driverData!.ride_state==="0" && (
                <div className="right">
                <label>TotalDistance (Randomly calculated)= {totalDistance && (+totalDistance || 0)} km</label>
                <button onClick={saveRides} className="btn">Save Rides</button>
                </div>
                )
            )
            }
            {
                ridesData && driverData && driverData.ride_state==="2" && (
                    <div className="driver-ongoing-rides">
                        <h4>Ongoing Rides</h4>
                        <DriverOngoingRide driverData={driverData} customerAddress={driverData.customer_1} index={1}
                        ridesData={ridesData} rideFinish={rideFinish} />
                        <DriverOngoingRide driverData={driverData} customerAddress={driverData.customer_2} index={2}
                        ridesData={ridesData} rideFinish={rideFinish} />
                        <DriverOngoingRide driverData={driverData} customerAddress={driverData.customer_3} index={3}
                        ridesData={ridesData} rideFinish={rideFinish} />
                    </div>
                    // <div>
                    //     <div>Total Driver Distance : {driverData.dist}</div>
                    //     <div>Total Driver Cost : {driverData.cost}</div>
                    //     <div> Ride On Going</div>
                    //     {
                    //         (!profileService.isAllZero(driverData!.customer_1)
                    //             && (<div >
                    //             <label>Customer 1 : {driverData.customer_1}</label>
                    //             <div>
                    //                 <div>{ridesData[driverData.customer_1].fromLat}</div>
                    //                 <div>{ridesData[driverData.customer_1].toLat}</div>
                    //                 <div>{ridesData[driverData.customer_1].fromLong}</div>
                    //                 <div>{ridesData[driverData.customer_1].toLong}</div>
                    //                 <div>{ridesData[driverData.customer_1].distance}</div>
                    //             </div>
                                
                    //         </div>)
                                
                    //         )
                            
                    //     }
                    //     {
                             
                    //          !profileService.isAllZero(driverData!.customer_1) && (
                    //         driverData.customer_rides_to_finish[0]==='1'
                    //         && <button onClick={()=>rideFinish(driverData!.customer_1,1)}>Ride Finish</button>
                    //         )
                    //         ||
                    //         (
                    //             driverData.customer_rides_paid[0]==='0'
                    //             && <div>Awaiting Payment</div>
                    //         )
                    //         ||
                    //         (
                    //             driverData.customer_rides_paid[0]==='1'
                    //             && <div>Payment Done</div>
                    //         )
                            

                    //     }
                    //     {
                    //         (!profileService.isAllZero(driverData!.customer_2)
                    //         && (<div >
                    //             <label>Customer 2 : {driverData.customer_2}</label>
                    //             <div>
                    //                 <div>{ridesData[driverData.customer_2].fromLat}</div>
                    //                 <div>{ridesData[driverData.customer_2].toLat}</div>
                    //                 <div>{ridesData[driverData.customer_2].fromLong}</div>
                    //                 <div>{ridesData[driverData.customer_2].toLong}</div>
                    //                 <div>{ridesData[driverData.customer_2].distance}</div>
                    //             </div>
                                
                    //         </div>)
                            
                    //         )
                    //     }
                    //     {
                             
                    //         !profileService.isAllZero(driverData!.customer_2) && 
                    //         (
                    //             (
                    //             driverData.customer_rides_to_finish[1]==='1'
                    //             && <button onClick={()=>rideFinish(driverData!.customer_2,2)}>Ride Finish</button>
                    //             )
                    //             ||
                    //             (
                    //                 driverData.customer_rides_paid[1]==='0'
                    //                 && <div>Awaiting Payment</div>
                    //             )
                    //             ||
                    //             (
                    //                 driverData.customer_rides_paid[1]==='1'
                    //                 && <div>Payment Done</div>
                    //             )
                    //         )
                             
                    //     }
                    //     {
                    //         (!profileService.isAllZero(driverData!.customer_3)
                    //         && (<div >
                    //             <label>Customer 3 : {driverData.customer_3}</label>
                    //             <div>
                    //                 <div>{ridesData[driverData.customer_3].fromLat}</div>
                    //                 <div>{ridesData[driverData.customer_3].toLat}</div>
                    //                 <div>{ridesData[driverData.customer_3].fromLong}</div>
                    //                 <div>{ridesData[driverData.customer_3].toLong}</div>
                    //                 <div>{ridesData[driverData.customer_3].distance}</div>
                    //             </div>
                                 
                    //         </div>)
                            
                    //         )
                    //     }
                    //     {
                    //         !profileService.isAllZero(driverData!.customer_3) && 
                    //         (
                             
                    //         (
                    //         driverData.customer_rides_to_finish[2]==='1'
                    //         && <button onClick={()=>rideFinish(driverData!.customer_3,3)}>Ride Finish</button>
                    //         )
                    //         ||
                    //         (
                    //             driverData.customer_rides_paid[2]==='0'
                    //             && <div>Awaiting Payment</div>
                    //         )
                    //         ||
                    //         (
                    //             driverData.customer_rides_paid[2]==='1'
                    //             && <div>Payment Done</div>
                    //         )
                    //         )
                             
                    //     }
                    // </div>
                )
            }
            {
                driverData && driverData.ride_state==="3" && (
                    <div>
                        <label>All Rides Finished</label>
                        </div>
                )
            }
        </div>

    );
}

export default DriverView;