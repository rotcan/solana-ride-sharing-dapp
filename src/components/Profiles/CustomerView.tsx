import React, { Component  }  from 'react';
import { PublicKey } from "@solana/web3.js";
import { CustomerProfile,SaveProfileFuncton,ProfileData } from '../../utils/util';
import { useForm } from 'react-hook-form';

const CustomerView=({address,saveProfile,predefinedData}:{address:PublicKey|undefined,saveProfile:SaveProfileFuncton,predefinedData: CustomerProfile|undefined})=>{
    
    
    const {register,handleSubmit}=useForm({defaultValues:predefinedData})
    
    const onSubmit= (data:any)=>{
        //console.log(data);
        saveProfile(data);
    }

    return(
        <div className="profile-form">
            <h3>User Details</h3>
            <label className="float-right">Solana Account Key: {address?.toBase58()} </label> 
            <form onSubmit={handleSubmit(onSubmit)} >
                {/* <input {...register("name")} placeholder="Customer Name" type="text" name="name" />
                <input {...register("phone")} placeholder="Customer Phone" type="text" name="phone" />
                */}
                <input {...register("name")} placeholder="Customer name" type="text" name="name" defaultValue={predefinedData?.name}/>
                <input {...register("phone")} placeholder="Customer phone" type="text" name="phone"  defaultValue={predefinedData?.phone}/>
                <div className="right"><input type="submit" value="Save" className="btn "/></div>
                
            </form>
            <br/>
        </div>
        
        // <div>
        //     <div>Wallet Address</div>
        //     <div>{address && address.toBase58()}</div>
        //     <div>Customer Name</div>
        //     <input />
        //     <div>Customer Phone</div>
        //     <input />
        //     <button className="btn">Save</button>
        // </div>
    )
}

export default CustomerView;