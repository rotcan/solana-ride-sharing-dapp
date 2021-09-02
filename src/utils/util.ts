import * as borsh from 'borsh';
import {format} from "date-fns";
import { programId } from '../solana/program';

export const Admin_Account_Seed="Admin";
export const Customer_Account_Seed="Customer";
export const Driver_Account_Seed="Driver";


export enum AccountTypes{
    Customer="Customer13",
    Driver="Driver5",
    Admin="Admin"
}


export function GetSeed(atype: AccountTypes,counter: number):string{
    let seed : string=atype;
    if(counter>1)
        seed=seed+counter;
    return seed;
}

export const MAX_ALLOWED_RIDES:number=3;

export const DUMMY_TX_ID = "0000000000000000000000000000000000000000000";
export const DUMMY_CREATED_ON = "0000000000000000";
export const DUMMY_LATLONG="00000000";
export const DUMMY_COST="000000000000";
export const DUMMY_ADDRESS = "00000000000000000000000000000000000000000000";
export const DUMMY_DISTANCE= "0000";
export const DUMMY_CUSTOMER_CONFIRMED_RIDES= "0000";
export const FULL_INSTRUCTION = "0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

export class ProfileData{
    profile_hash:string= DUMMY_TX_ID;
    rides_hash:string = DUMMY_TX_ID;
    update_time:string=DUMMY_CREATED_ON;
    constructor(fields:{profile_hash:string,rides_hash:string, update_time:string} | undefined =undefined){
        if(fields){
            this.profile_hash=fields.profile_hash;
            this.update_time=fields.update_time;
            this.rides_hash=fields.rides_hash;
        }
    }
}
export const sampleData=new ProfileData()
sampleData.profile_hash= DUMMY_TX_ID;
sampleData.update_time= DUMMY_CREATED_ON;

export const ProfileDataSchema=new Map(
[
    [ProfileData,{kind:'struct',fields:[['profile_hash','String'],
    ['rides_hash','String'],
    ['update_time','String']]}]
]
);

export const ProfileDataSize=borsh.serialize(
    ProfileDataSchema,
    sampleData,
).length;


//Arweave
interface ICustomerProfile{
    name: string;
    phone: string;
}
export class CustomerProfile{
    public name: string;
    public phone: string;

    constructor();
    constructor(obj: ICustomerProfile);
    constructor(obj?:any)
    {
        this.name=obj && (obj.name || "");
        this.phone= obj && (obj.phone || "");
    }
     
}

interface IRide{
    fromLat: string;
    fromLong: string;
    toLat: string;
    toLong: string;
    create_time: string;
}

interface IRides{
    rides: IRide[];
}

export class RideDriver{
    public driverAddress:string;
    public driverCost: string;
    public driverCostMax: string;
    constructor();
    constructor(obj?: any){
        this.driverAddress=obj && (obj.driverAddress || "");
        this.driverCost=obj && (obj.driverCost || "");
        this.driverCostMax=obj && (obj.driverCostMax || "");
    }

    toJSON(){
        return {
            driverAddress:this.driverAddress,
            driverCost:this.driverCost,
            driverCostMax:this.driverCostMax
        };
    }
}

export class Ride{
    public fromLat: string;
    public fromLong: string;
    public toLat: string;
    public toLong: string;
    public create_time: string;
    public distance:string;
    public state: string;
    public key: string;
    public drivers: RideDriver[];
    public driverSelected: string;
    public final_cost:string;
   

    constructor();
    constructor(obj: IRide);
    constructor(obj?: any){
        this.fromLat=obj && (obj.fromLat || "");
        this.fromLong=obj && (obj.fromLong || "");
        this.toLat=obj && (obj.toLat || "");
        this.toLong=obj && (obj.toLong || "");
        this.create_time=obj && (obj.create_time || "");
        this.state=obj && (obj.state || "0");
        this.distance=obj && (obj.distance || "0");
        this.key=obj && (obj.key || "0");
        this.drivers=obj && (obj.drivers || []);
        this.driverSelected=obj && (obj.driverSelected || "");
        this.final_cost=obj && (obj.final_cost || "");
       
    }

    toJSON(){
        let obj:any= {
            fromLat: this.fromLat,
            fromLong: this.fromLong,
            toLat:this.toLat,
            toLong:this.toLong,
            distance:this.distance,
            key:this.key,
            driverSelected:this.driverSelected,
            final_cost:this.final_cost,
            program_id:programId.toBase58()
            
        };
        obj.drivers=[];
        for(let i=0;i<this.drivers.length;i++)
            obj.drivers.push(this.drivers[i].toJSON());
        return obj;
    }
}

export class CustomerRides{
    public rides: Ride[];

    constructor();
    constructor(obj: IRides);
    constructor(obj? : any){
        this.rides=obj && (obj.rides || []);
    }

    AddRide(ride: Ride):void{
        this.rides.push(ride);
    }
}

export const ParseDateFromSolana=(dt: string):string|null=>{
    let finalCreatedOn = "";
    for (let i = 0; i < dt.length; i++) {
      if (Number(dt[i]) > 0 || Number(finalCreatedOn) > 0) {
        finalCreatedOn += dt[i];
      }
    }
    if (!finalCreatedOn || finalCreatedOn.length <= 2) return null;

    console.log("finalCreatedOn", finalCreatedOn);
    //console.log("date", new Date(Number(finalCreatedOn)).toUTCString());
    const createdOnDate = format(
      new Date(Number(finalCreatedOn)),
      "MM/dd/yy hh:mm:ss"
    );

    return createdOnDate;
}
 
export type SaveProfileFuncton = (p: any)=>any;

export class SingleInstruction{
    public full_instruction: string=FULL_INSTRUCTION;

    constructor(fields:{full_instruction:string}| undefined =undefined){
        if(fields){
            this.full_instruction=fields.full_instruction;
        }
    }
}

export const SingleInstructionSchema=new Map(
    [
        [SingleInstruction,{kind:'struct',fields:[
            ['full_instruction','String'],
           
    ]}]
    ]
)

export const SingleInstructionSize=borsh.serialize(
    SingleInstructionSchema,
    new SingleInstruction(),
).length;

 
//console.log("InstructionRecordSize",InstructionRecordSize);

export class CustomerAccount{
    public profile_hash: string=DUMMY_TX_ID;
    public updated_on: string=DUMMY_CREATED_ON;
    public from_lat: string=DUMMY_LATLONG;
    public to_lat:string=DUMMY_LATLONG;
    public from_long: string=DUMMY_LATLONG;
    public to_long:string=DUMMY_LATLONG;
    public distance:string=DUMMY_DISTANCE;
    public final_cost: string=DUMMY_COST;
    public driver_address_1: string=DUMMY_ADDRESS;
    public cost_1: string=DUMMY_COST;
    public driver_address_2: string=DUMMY_ADDRESS;
    public cost_2: string=DUMMY_COST;
    public driver_address_3: string=DUMMY_ADDRESS;
    public cost_3: string=DUMMY_COST;
    public driver_address_4: string=DUMMY_ADDRESS;
    public cost_4: string=DUMMY_COST;
    public cost_1_max: string=DUMMY_COST;
    public cost_2_max: string=DUMMY_COST;
    public cost_3_max: string=DUMMY_COST;
    public cost_4_max: string=DUMMY_COST;
    public driver_select: string="0";
    public driver_confirm: string="0";
    public to_pay:string=DUMMY_COST;
    public ride_state:string="0"
    public driver_pub_key:string=DUMMY_ADDRESS;
    
     
    constructor(fields:{profile_hash:string, from_lat:string,
        to_lat:string,from_long:string,to_long:string,distance:string,
        final_cost:string,driver_address_1:string,
        driver_address_2:string,driver_address_3:string,driver_address_4:string,
    cost_1:string,cost_2:string,cost_3:string,cost_4:string,
    cost_1_max:string,cost_2_max:string,cost_3_max:string,cost_4_max:string,
    driver_select:string,driver_confirm:string,to_pay:string,ride_state:string,driver_pub_key:string} | undefined =undefined){
            if(fields){
                this.profile_hash=fields.profile_hash;
                this.from_lat=fields.from_lat;
                this.to_lat=fields.to_lat;
                this.from_long=fields.from_long;
                this.to_long=fields.to_long;
                this.distance=fields.distance;
                this.final_cost=fields.final_cost;
                this.driver_address_1=fields.driver_address_1;
                this.driver_address_2=fields.driver_address_2;
                this.driver_address_3=fields.driver_address_3;
                this.driver_address_4=fields.driver_address_4;
                this.cost_1=fields.cost_1;
                this.cost_2=fields.cost_2;
                this.cost_3=fields.cost_3;
                this.cost_4=fields.cost_4;
                this.cost_1_max= fields.cost_1_max;
                this.cost_2_max= fields.cost_2_max;
                this.cost_3_max= fields.cost_3_max;
                this.cost_4_max= fields.cost_4_max;

                this.driver_select=fields.driver_select;
                this.driver_confirm=fields.driver_confirm;
                this.to_pay=fields.to_pay;
                this.ride_state=fields.ride_state;
                this.driver_pub_key=fields.driver_pub_key;
                
            }
       
    }

}
export const sampleCustomerAccount: CustomerAccount=new CustomerAccount();
 
//sampleData.update_time= DUMMY_CREATED_ON;

export const CustomerAccountSchema=new Map(
[
    [CustomerAccount,{kind:'struct',fields:[['profile_hash','String'],
    ['updated_on','String'],
    ['from_lat','String'],
    ['to_lat','String'],
    ['from_long','String'],
    ['to_long','String'],
    ['distance','String'],
    ['final_cost','String'],
    ['driver_address_1','String'],
    ['cost_1','String'],
    ['driver_address_2','String'],
    ['cost_2','String'],
    ['driver_address_3','String'],
    ['cost_3','String'],
    ['driver_address_4','String'],
    ['cost_4','String'],
    ['cost_1_max','String'],
    ['cost_2_max','String'],
    ['cost_3_max','String'],
    ['cost_4_max','String'],
    ['driver_select','String'],
    ['driver_confirm','String'],
    ['to_pay','String'],
    ['ride_state','String'],
    ['driver_pub_key','String']
]}]
]
);

export const CustomerAccountSize=borsh.serialize(
    CustomerAccountSchema,
    sampleCustomerAccount,
).length;




export class DriverAccount{
    public profile_hash: string=DUMMY_TX_ID;
    public updated_on: string=DUMMY_CREATED_ON;
    public from_lat: string=DUMMY_LATLONG;
    public to_lat:string=DUMMY_LATLONG;
    public from_long: string=DUMMY_LATLONG;
    public to_long:string=DUMMY_LATLONG;
    public dist:string=DUMMY_DISTANCE;
    public cost: string=DUMMY_COST;
    public customer_1: string=DUMMY_ADDRESS;
    public customer_1_confirm: string="0";
    public customer_2: string=DUMMY_ADDRESS;
    public customer_2_confirm: string="0";
    public customer_3: string=DUMMY_ADDRESS;
    public customer_3_confirm: string="0";
  //  public customer_confirmed_rides: string="0000";
    public customer_rides_to_finish: string="0000";
    public customer_rides_paid: string="0000";
    public ride_state:string = "0";
    
     
    constructor(fields:{profile_hash:string, updated_on:string, from_lat:string,
        to_lat:string,from_long:string,to_long:string,dist:string,
        cost:string,
        customer_1:string,customer_1_confirm:string,
        customer_2:string,customer_2_confirm:string,
        customer_3:string,customer_3_confirm:string,
        //customer_confirmed_rides:string,
        customer_rides_to_finish:string,customer_rides_paid:string,
        ride_state:string} | undefined =undefined){
            if(fields){
                this.profile_hash=fields.profile_hash;
                this.updated_on=fields.updated_on;
                this.from_lat=fields.from_lat;
                this.to_lat=fields.to_lat;
                this.from_long=fields.from_long;
                this.to_long=fields.to_long;
                this.dist=fields.dist;
                this.cost=fields.cost;
                this.customer_1=fields.customer_1;
                this.customer_1_confirm=fields.customer_1_confirm;
                this.customer_2=fields.customer_2;
                this.customer_2_confirm=fields.customer_2_confirm;
                this.customer_3=fields.customer_3;
                this.customer_3_confirm=fields.customer_3_confirm;
             //   this.customer_confirmed_rides=fields.customer_confirmed_rides;
                this.customer_rides_to_finish=fields.customer_rides_to_finish;
                this.customer_rides_paid=fields.customer_rides_paid;
                this.ride_state=fields.ride_state;
            }
       
    }

}
export const sampleDriverAccount: DriverAccount=new DriverAccount();
 
//sampleData.update_time= DUMMY_CREATED_ON;

export const DriverAccountSchema=new Map(
[
    [DriverAccount,{kind:'struct',fields:[
        ['profile_hash','String'],
    ['updated_on','String'],
    ['from_lat','String'],
    ['to_lat','String'],
    ['from_long','String'],
    ['to_long','String'],
    ['dist','String'],
    ['cost','String'],
    ['customer_1','String'],
    ['customer_1_confirm','String'],
    ['customer_2','String'],
    ['customer_2_confirm','String'],
    ['customer_3','String'],
    ['customer_3_confirm','String'],
  //  ['customer_confirmed_rides','String'],
    ['customer_rides_to_finish','String'],
    ['customer_rides_paid','String'],
    ['ride_state','String']
]}]
]
);

export const DriverAccountSize=borsh.serialize(
    DriverAccountSchema,
    sampleDriverAccount,
).length;


export const replaceAt=(input: string, index: number, replacement: string):string=>{
    return input.substr(0, index) + replacement + input.substr(index + replacement.length);
}
 
export const GetRideStateStr=(rideState: string):string=>{
    //0 not started , 1 as pending , 2 as started, 3 as end, 4 as paid
    switch(rideState){
        case "0": 
        default:
            return "RideCreated";
        case "1":
            return "Waiting confirmation from Driver";
        case "2":
            return "RideStarted";
        case "3":
            return "Ride Finished. Driver Awaiting Payment";
        case "4":
            return "Payment Completed";

    }
    
}