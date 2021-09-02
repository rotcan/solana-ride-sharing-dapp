import axios from 'axios';
import React,{useEffect, useState} from 'react';
import { useForm } from 'react-hook-form'; 
import profileService from '../solana/profile';
import { locations,distances, GetDistanceBetweenLocations } from '../utils/data';
import { Ride } from '../utils/util';

const NewRideView = ({saveRide}:{saveRide:any})=>{
    const {register,handleSubmit} = useForm( );
    const [location,setLocation]=useState<any>(locations);
    const [selectedLocation,setSelectedLocation]=useState<any>();
    const [newRide,setNewRide] = useState<Ride|undefined>();
    const [from,setFrom]=useState<string|undefined>("Location1");
    const [to,setTo]=useState<string|undefined>("Location2");
    const [distance,setDistance]=useState<string|undefined>();
    // const getLocations=async()=>{
    //     axios({
    //         url: 'http://localhost:3002/locations',
    //         method: 'get',
    //       }).then(response => {
    //         console.log("getallcustomerrides response", response.data);
    //         //setLocation(response.data);
    //       })
    //       .catch(error => {
    //         console.log(error)
    //       })
    // }

    const changeFrom=(event:any)=>{
        console.log("from",event.target.value);
        setFrom(event.target.value);
        updateDistance(event.target.value,to!);
    }

    const changeTo=(event:any)=>{
        console.log("to",event.target.value);
        setTo(event.target.value);
        updateDistance(from!,event.target.value);
    }

    const updateDistance=(f:string,t:string)=>{
        console.log("from",f);
        console.log("to",t);
        if(f && t){
            const dist=GetDistanceBetweenLocations(f,t);
            setDistance(dist);
        }

    }
    useEffect(()=>{
        updateDistance(from!,to!);
    },[]);

    
    const onSubmit=(d:any)=>{
        d.create_time=profileService.getCreatedOn();
        if(from && to && from!==to){
            d.fromLat=location[from].lat;
            d.fromLong=location[from].lng;
            d.toLat=location[to].lat;
            d.toLong=location[to].lng;
            d.distance=distance;
            console.log(d);
            saveRide(d);
        }else{
            alert("Please select correct from-to locations");
        }
        
    }
    return (
        
        <form onSubmit={handleSubmit(onSubmit)} className="new-ride">
            <h3>Add New Ride</h3>
            <div className="row-item">
            <label>From</label>
            <select {...register("locationFrom")} defaultValue="Location1" name="locationFrom" onChange={changeFrom} >
            {location && Object.keys(location).map(key => (
            <option key={key} value={key}>
                {key}
            </option>
            ))}
            </select>
            </div>
            <div className="row-item">
            <label>To</label>
            <select {...register("locationTo")} name="locationTo"  defaultValue="Location2" onChange={changeTo} >
            {location && Object.keys(location).map(key => (
            <option key={key} value={key}>
                {key}
            </option>
            ))}
            </select>
            </div>
            {/* <input {...register("fromLat")} placeholder="From Lat" type="text" name="fromLat"/>
            <input {...register("fromLong")} placeholder="From Long" type="text" name="fromLong"/>
            <input {...register("toLat")} placeholder="To Lat" type="text" name="toLat"/>
            <input {...register("toLong")} placeholder="To Long" type="text" name="toLong"/> 
            <input {...register("distance")} value={distance} placeholder="Distance (kms)" type="text" name="distance" readOnly/>*/}
            <div className="row-item right"><label>Distance:{distance || "0"} kms</label></div>
            <div className="right"><input type="submit" value="Save New Ride" className="btn"/></div>
        </form>
           
           
    )
}

export default NewRideView;