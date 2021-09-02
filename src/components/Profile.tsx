import React, {  useState,useEffect }  from 'react';
import CustomerView from './Profiles/CustomerView';
import { AccountTypes, CustomerAccount, CustomerProfile, DriverAccount, DUMMY_DISTANCE, DUMMY_LATLONG, replaceAt, Ride, RideDriver, SingleInstruction} from '../utils/util';
import { Connection, PublicKey } from '@solana/web3.js';
import profileService from '../solana/profile';
import { WalletAdapter } from '../solana/wallet';
 
import RideView from './RideView';
import NewRideView from './NewRideView';
import axios from 'axios';
import DriverView from './Driver/DriverView';
import { setAccountUpdateCallback } from '../solana/accounts';

const Profile = ({accountType,walletAddress,connection,wallet,pubKey}:{accountType: AccountTypes|undefined,
    walletAddress: PublicKey|undefined,connection: Connection|undefined,wallet: WalletAdapter,pubKey:PublicKey|undefined})=>{
    const [data,setData]=useState<CustomerProfile | undefined>();
    // const [rides,setRides] = useState<CustomerRides | undefined>();
    //const [profileData,setProfileData] = useState<ProfileData | undefined>();
    const [customerAccountData,setCustomerAccountData] = useState <CustomerAccount | undefined>();
    const [currentRide,setCurrentRide]=useState<Ride|undefined>();
    const [driverAccountData,setDriverAccountData]=useState<DriverAccount | undefined>();
    const [selectedDriver,setSelectedDriver]=useState<string|undefined>();
    const [balance,setBalance] = useState<number>(0);

    const onAccountChangeCallback=async()=>{
        await fetchProfile();
    }   

    const saveProfile = async(p: any)=>{
        //console.log(p);
        const customerProfile : CustomerProfile = new CustomerProfile(p);
        console.log("customerProfile",customerProfile);
        if(connection!==undefined && walletAddress!==undefined ) 
        {
            const hash:string=await profileService.saveCustomerProfileData(customerProfile);
            //profileData!.profile_hash=hash;
            //const instr: RecordInstruction = new RecordInstruction();
            const instr: SingleInstruction = new SingleInstruction();
            //instr.record_type="1";
            //instr.profile_hash=hash;
            let instr_type="1";
            if (accountType===AccountTypes.Driver)
                instr_type="3";
            instr.full_instruction=replaceAt(instr.full_instruction,0,instr_type);
            instr.full_instruction=replaceAt(instr.full_instruction,2,hash);
            await profileService.saveSingleAccountDataInstruction(connection,walletAddress?.toBase58(),instr,wallet);
        }
    };

    const fetchProfile=async()=>{
        if(walletAddress!==undefined && connection!==undefined){
            console.log(walletAddress?.toBase58());
            //const profileData: ProfileData = await profileService.getProfileData(connection,walletAddress.toBase58())  ;
            if(accountType===AccountTypes.Customer){
                const customerAccountData:CustomerAccount = await profileService.getNewProfileCustomerData(connection,walletAddress.toBase58())  ;
                console.log("customerAccountData after load", customerAccountData);
                
                const customerProfileData: CustomerProfile = await profileService.getCustomerProfileDataFromProfileNew(customerAccountData) ;
                //const customerProfileData: CustomerProfile =new CustomerProfile();
                //profileData.profile_hash="asdasdasda";
                //profileData.update_time="assdasddsds";
                //setProfileData(profileData);
                //setCustomerAccountData(customerAccountData);
                setCustomerAccountData(customerAccountData);
                setData(customerProfileData);
                //console.log(customerProfileData);
                //console.log(customerAccountData);
                fetchCurrentRide(customerAccountData);
            }else if(accountType===AccountTypes.Driver){
                const driverAccountData:DriverAccount = await profileService.getNewDriverProfileData(connection,walletAddress.toBase58())  ;
                console.log("driverAccountData after load", driverAccountData);
                
                const customerProfileData: CustomerProfile = await profileService.getCustomerProfileDataFromProfileNewDriver(driverAccountData) ;
                setDriverAccountData(driverAccountData);
                //const customerProfileData: CustomerProfile =new CustomerProfile();
                //profileData.profile_hash="asdasdasda";
                //profileData.update_time="assdasddsds";
                //setProfileData(profileData);
                setData(customerProfileData);
                // selectCustomerForRideByDriver({});
            }
            try{
                const b:number=await profileService.getAccountBalance(connection,walletAddress);
                console.log("balance = ",b);
                setBalance(b/1000000);
            }catch(error){
                console.log(error);
            }
        }
        
    }

    const fetchCurrentRide=(customerAccountData: CustomerAccount)=>{
        console.log(customerAccountData);
        if(customerAccountData!==undefined){
            let r:Ride=profileService.getNewRideData(customerAccountData);
            
             
            //
            callServerAndSaveRide(r,customerAccountData);
            const selDriver: string|undefined= getSelectedDriver(customerAccountData);
            setSelectedDriver(selDriver);
            r.driverSelected=selDriver!;
            console.log("fetchCurrentRide",r);
            setCurrentRide(r);
            
        }
    }

    const getSelectedDriver=(customerAccountData: CustomerAccount):string|undefined=>{
        const selectedDriverIndex:string= customerAccountData!.driver_select;
        if (selectedDriverIndex==="1")
            return customerAccountData!.driver_address_1;
        if (selectedDriverIndex==="2")
            return customerAccountData!.driver_address_2;
        if (selectedDriverIndex==="3")
            return customerAccountData!.driver_address_3;
        else if (selectedDriverIndex==="4")
            return customerAccountData!.driver_address_4;
        return undefined;
    }
    const selectAndSaveDriver=async (driverAddress:string)=>{
        console.log(driverAddress);
        const instr: SingleInstruction= new SingleInstruction();
        instr.full_instruction=replaceAt(instr.full_instruction,0,"5");
        //driver
        instr.full_instruction = replaceAt(instr.full_instruction,98,driverAddress);
        //customer
        instr.full_instruction = replaceAt(instr.full_instruction,142,walletAddress!.toBase58());
        console.log('instr.full_instruction',instr.full_instruction.length);
        const keys: string[] = [walletAddress!.toBase58(),driverAddress];
        await profileService.saveDualAccountDataInstruction(connection!,keys,instr,wallet);
        await fetchProfile();
    }

    const callServerAndSaveRide=(r:Ride,customerAccountData:CustomerAccount):void=>{
        console.log(customerAccountData);
        r.key=walletAddress!.toBase58();
        r.drivers=[];
         
        if (!profileService.isAllZero(customerAccountData!.driver_address_1)){ 
            let rd: RideDriver =new RideDriver();
            rd.driverAddress=customerAccountData!.driver_address_1;
            rd.driverCost=customerAccountData!.cost_1;
            r.drivers.push(rd);
        }
        if (!profileService.isAllZero(customerAccountData!.driver_address_2)){ 
            let rd: RideDriver =new RideDriver();
            rd.driverAddress=customerAccountData!.driver_address_2;
            rd.driverCost=customerAccountData!.cost_2;
            r.drivers.push(rd);
        }
        if (!profileService.isAllZero(customerAccountData!.driver_address_3)){ 
            let rd: RideDriver =new RideDriver();
            rd.driverAddress=customerAccountData!.driver_address_3;
            rd.driverCost=customerAccountData!.cost_3;
            r.drivers.push(rd);
        }
        if (!profileService.isAllZero(customerAccountData!.driver_address_4)){ 
            let rd: RideDriver =new RideDriver();
            rd.driverAddress=customerAccountData!.driver_address_4;
            rd.driverCost=customerAccountData!.cost_4;
            r.drivers.push(rd);
        }
        console.log("callServerAndSaveRide",r);
        
        axios({
            url: 'http://localhost:3002/saveCustomerRide',
            method: 'post',
            data:  r.toJSON()
          }).then(response => {
            console.log(response);
          })
          .catch(error => {
            console.log(error)
          })
    }

    const saveCurrentRide=async(d:any)=>{
        console.log(d);
        const newRide: Ride=new Ride(d);
        //const instr: RecordInstruction = new RecordInstruction();
        const instr:SingleInstruction = new SingleInstruction();
        instr.full_instruction=replaceAt(instr.full_instruction,0,"2");
        console.log("newRide",newRide);
        const pfromLat=profileService.padZeroNumeric(newRide.fromLat,DUMMY_LATLONG);
        const ptoLat=profileService.padZeroNumeric(newRide.toLat,DUMMY_LATLONG);
        const pfromLong=profileService.padZeroNumeric(newRide.fromLong,DUMMY_LATLONG);
        const ptoLong=profileService.padZeroNumeric(newRide.toLong,DUMMY_LATLONG);
        const pdistance=profileService.padZeroNumeric(newRide.distance,DUMMY_DISTANCE);
        //instr.full_instruction=replaceAt(instr.full_instruction,2,hash);
        instr.full_instruction=replaceAt(instr.full_instruction,45,pfromLat);
        instr.full_instruction=replaceAt(instr.full_instruction,53,ptoLat);
        instr.full_instruction=replaceAt(instr.full_instruction,61,pfromLong);
        instr.full_instruction=replaceAt(instr.full_instruction,69,ptoLong);
        instr.full_instruction=replaceAt(instr.full_instruction,77,pdistance);
        //instr.record_type="2";
        // instr.from_lat=newRide.fromLat;
        // instr.to_lat=newRide.toLat;
        // instr.from_long=newRide.fromLong;
        // instr.to_long=newRide.toLong;
        //instr.distance="5.40";
        await profileService.saveSingleAccountDataInstruction(connection!,walletAddress!.toBase58(),instr,wallet);
        await fetchProfile();
    }

     
    //step 4 (driver selects for rides)
    const selectRidesForDriver=async (d:any)=>{
        console.log(d);
        let instructions: SingleInstruction[] = [];
        let keys:any[] =[];
        for(let i=0;i<d.customers.length;i++){
            const minmax:any[]=d.minmax[i];
            const instr: SingleInstruction= new SingleInstruction();
            instr.full_instruction=replaceAt(instr.full_instruction,0,"4");
            //for min option
            // instr.full_instruction = replaceAt(instr.full_instruction,77,d.distance);
            // instr.full_instruction = replaceAt(instr.full_instruction,186,d.ridesDistance);
            console.log("minmax",minmax );
            console.log("01",minmax[0][1]);
            console.log("00",minmax[0][0]);
            console.log("11",minmax[1][1]);
            console.log("10",minmax[1][0]);
            instr.full_instruction = replaceAt(instr.full_instruction,77,minmax[0][1]);
            instr.full_instruction = replaceAt(instr.full_instruction,186,minmax[0][0]);
            
            //for max option
            //instr.full_instruction = replaceAt(instr.full_instruction,190,d.distance);
            //instr.full_instruction = replaceAt(instr.full_instruction,194,d.ridesDistance);
            instr.full_instruction = replaceAt(instr.full_instruction,190,minmax[1][1]);
            instr.full_instruction = replaceAt(instr.full_instruction,194,minmax[1][0]);
            

            instr.full_instruction = replaceAt(instr.full_instruction,98,walletAddress!.toBase58());
            instr.full_instruction = replaceAt(instr.full_instruction,142,d.customers[i]);
            console.log('instr.full_instruction',instr.full_instruction.length);
            keys.push([walletAddress!.toBase58(),d.customers[i]]);
            instructions.push(instr);
           
        }
        console.log(keys);
        console.log(instructions);
        await profileService.saveDualAccountDataInstructionMultiple(connection!,keys,instructions,wallet);
        await fetchProfile();
        
    }

    //step 6 & 7 (after customer confirmations , driver confirms the customers that he is starting)
    const startDriverRide=async(d:any)=>{
        //d will have customer address in order of selected string 
        const confirmedRides:string[] = [...d.confirmedRides];
        
        console.log(d);
        let instructions: SingleInstruction[] = [];
        let keys:any[] =[];
        let maxCount:number=3;
        if (d.customers.length<maxCount)
            maxCount=d.customers.length;
        for(let i=0;i<maxCount;i++){
            const instr:SingleInstruction= new SingleInstruction();
            instr.full_instruction=replaceAt(instr.full_instruction,0,"6");
            //confirmed ride string
            instr.full_instruction = replaceAt(instr.full_instruction,190,confirmedRides[i]);
            //
            instr.full_instruction = replaceAt(instr.full_instruction,194,""+(i+1));
            //driver account address
            instr.full_instruction = replaceAt(instr.full_instruction,98,walletAddress!.toBase58());
            //customer account address
            instr.full_instruction = replaceAt(instr.full_instruction,142,d.customers[i]);
            //distance of customer rides added
            instr.full_instruction = replaceAt(instr.full_instruction,186,d.ridesDistance);
            //driver distance covered
            instr.full_instruction = replaceAt(instr.full_instruction,77,d.distance);
            //public key to pay later
            instr.full_instruction = replaceAt(instr.full_instruction,198,wallet!.publicKey!.toBase58());
            keys.push([walletAddress!.toBase58(),d.customers[i]]);
            instructions.push(instr);
        }
        console.log(instructions);
        await profileService.saveDualAccountDataInstructionMultiple(connection!,keys,instructions,wallet);
        //step 7
        const instr:SingleInstruction= new SingleInstruction();
        instr.full_instruction=replaceAt(instr.full_instruction,0,"7");
        instr.full_instruction = replaceAt(instr.full_instruction,190,d.confirmedRides);
        console.log(instr);
        // keys.push([walletAddress!.toBase58()]);
        //instructions.push(instr);
        await profileService.saveSingleAccountDataInstruction(connection!,walletAddress!.toBase58(),instr,wallet);
        await fetchProfile();
    }

    //step 8
    const rideFinish=async(d:any)=>{
        console.log(d);
        const instr:SingleInstruction = new SingleInstruction();
        instr.full_instruction=replaceAt(instr.full_instruction,0,"8");
        instr.full_instruction=replaceAt(instr.full_instruction,190,d.ridesToFinish);
         
        const keys:string[]=[walletAddress!.toBase58(),d.customerAddress];
        console.log(instr);
        await profileService.saveDualAccountDataInstruction(connection!,keys,instr,wallet);
        await fetchProfile();
    } 

    //step 9
    const sendMoney=async(d:any)=>{
        
        if(customerAccountData!=null){
            console.log(customerAccountData);
            const driverAddress:any = getSelectedDriver(customerAccountData);
            const val:number=d.cost*1*1000000000; //convert to lamports
            const pubKeyDriver:string=customerAccountData?.driver_pub_key;
            const pubKeys=[walletAddress!.toBase58(),driverAddress];
            const instr:SingleInstruction = new SingleInstruction();
            instr.full_instruction=replaceAt(instr.full_instruction,0,"9");
            instr.full_instruction = replaceAt(instr.full_instruction,142,walletAddress!.toBase58());
            console.log(instr);
            console.log(driverAddress);
            console.log(pubKeys);
            await profileService.sendMoneyAndUpdateDriver(connection!,wallet,pubKeyDriver,val,pubKeys,instr);
            await fetchProfile();
        }
    }
   
    const accountChangeCallback=()=>{
        console.log("ACcount change callback called");
        onAccountChangeCallback();
    }
    
    useEffect(()=>{
        if(pubKey!==undefined && connection!==undefined){
            setAccountUpdateCallback(pubKey, accountChangeCallback,connection);
            fetchProfile();
        }
        
        //fetchRides();
    },[]);

    const onRefreshClick=async()=>{
        await fetchProfile();
    }

    //step 0
    const onClearProfileClick=async()=>{
        if(customerAccountData || driverAccountData){
            var result = window.confirm("This will clear users data. Are you sure you want to continue?");
            if(result){
                console.log(customerAccountData);
                
                const instr:SingleInstruction = new SingleInstruction();
                instr.full_instruction=replaceAt(instr.full_instruction,0,"0");
                if(accountType===AccountTypes.Customer)
                    instr.full_instruction = replaceAt(instr.full_instruction,1,"1");
                else if(accountType===AccountTypes.Driver)
                    instr.full_instruction = replaceAt(instr.full_instruction,1,"2");
                console.log(instr);
                
                await profileService.saveSingleAccountDataInstruction(connection!,walletAddress!.toBase58(),instr,wallet);
                await fetchProfile();
            }
        } 
    }


    return (
        <div className="profile-main">
            <div className="right">
                <b>Balance : {balance} (SOL)</b>
            </div>
            <div>
            <button className="btn float-right" onClick={onClearProfileClick}>Clear Data</button>
            <button className="btn float-right" onClick={onRefreshClick}>Refresh</button>
            </div>
            {accountType===AccountTypes.Customer && walletAddress!==null && 
            (
                <div>
                <CustomerView address={walletAddress} predefinedData={data} saveProfile={saveProfile}/>
                {/* <RidesView customerRides={rides} saveNewRide={saveRides}/> */}
                { customerAccountData && customerAccountData.profile_hash && profileService.isAllZero(customerAccountData.profile_hash)
                && <h4>Please save above details before save ride</h4>}
                {customerAccountData && currentRide 
                        && currentRide.state!==undefined && currentRide.state==="4" && (<RideView ride={currentRide} 
                            selectAndSaveRide={selectAndSaveDriver} payDriver={sendMoney} customerAccount={customerAccountData}/>)} 
                {
                    ( customerAccountData && customerAccountData.profile_hash && !profileService.isAllZero(customerAccountData.profile_hash) &&
                (
                    (currentRide 
                        && currentRide.state!==undefined 
                        && 
                        (
                            (currentRide.state!=="4" 
                        && (<RideView ride={currentRide} 
                    selectAndSaveRide={selectAndSaveDriver} payDriver={sendMoney} customerAccount={customerAccountData}/>)
                    ) 
                    
                    )
                    )
                || (<NewRideView saveRide={saveCurrentRide} />)))
                }
                </div>
            ) 
            }
            {accountType===AccountTypes.Driver && walletAddress!==null && driverAccountData!==undefined &&
            (
                <div>
                <CustomerView address={walletAddress} predefinedData={data} saveProfile={saveProfile}/>
                { driverAccountData && driverAccountData.profile_hash && profileService.isAllZero(driverAccountData.profile_hash)
                && <h4>Please save above details before selecting rides</h4>}
                { driverAccountData && driverAccountData.profile_hash && !profileService.isAllZero(driverAccountData.profile_hash) &&
                <DriverView  address={walletAddress} selectRides={selectRidesForDriver} driverData={driverAccountData} startRide={startDriverRide}
                endRide={rideFinish} />
                }
                {/* <RidesView customerRides={rides} saveNewRide={saveRides}/> */}
                {
                   
                }
                </div>
            ) 
            }
        </div>

    )
}

export default Profile;