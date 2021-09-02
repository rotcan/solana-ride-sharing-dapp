import { Connection, PublicKey, RpcResponseAndContext, SignatureResult, SystemProgram, TransactionInstruction } from "@solana/web3.js";
import { CustomerProfile,ProfileDataSchema,ProfileData, DUMMY_TX_ID, DUMMY_CREATED_ON, sampleData, CustomerRides, 
     CustomerAccount, CustomerAccountSchema, Ride, DUMMY_LATLONG, DriverAccount, DriverAccountSchema, SingleInstruction, SingleInstructionSchema } from "../utils/util";
import * as borsh from "borsh";
import { programId } from "./program";
import { setPayerAndBlockhashTransaction, setPayerAndBlockhashTransactionMultipleInstruction, signAndSendTransaction, WalletAdapter } from "./wallet";
import arweaveService from "../arweave/arweave";
// @ts-ignore
import lo from "buffer-layout";

class ProfileService{

    async getProfileData(
        connection: Connection,
        pubKeyString: string,
    ):Promise<ProfileData>{
        const profileKey=new PublicKey(pubKeyString);
        console.log("profileKey",profileKey.toBase58());
        const profileAccount = await connection.getAccountInfo(profileKey);

        if(!profileAccount){
            throw Error(`Account ${profileKey} does not exist`);
        }
        console.log("profileAccount",profileAccount);

        // const profile_hash=lo.cstr("profile_hash");
        // const update_time=lo.cstr("update_time");
        // const dataStruct= lo.struct(
        //     [profile_hash,lo.seq(lo.u8()),update_time,lo.seq(lo.u8())],
        //     "ProfileData"
        // );
        // const profileData=dataStruct.decode(profileAccount.data);
        
        const schema= ProfileDataSchema;
        let profileData : ProfileData;
        try{
            profileData  = borsh.deserialize(schema,ProfileData,profileAccount.data);
        }catch(ex: any){
            console.log(ex);
            if (ex instanceof borsh.BorshError)
                profileData= new ProfileData();
            else
                throw ex;
        }
        console.log("profileData",profileData);
        return profileData;
    }

    async getAccountBalance(connection: Connection,
        pubKey: PublicKey):
        Promise<number>{
            
            const value=await connection.getBalance(pubKey);
            return value;
    }
    
    getNewRideData(
        customerAccount:CustomerAccount
    ):Ride{
        let ride:Ride=new Ride()
        console.log(customerAccount);
        if (customerAccount.from_lat && !this.isAllZero(customerAccount.from_lat)
        && customerAccount.to_lat && !this.isAllZero(customerAccount.to_lat)
        && customerAccount.from_long && !this.isAllZero(customerAccount.from_long)
        && customerAccount.to_long && !this.isAllZero(customerAccount.to_long))
            {
                ride.fromLat=customerAccount.from_lat;
                ride.toLat=customerAccount.to_lat;
                ride.fromLong=customerAccount.from_long;
                ride.toLong=customerAccount.to_long;
                ride.state=customerAccount.ride_state;
                ride.distance=customerAccount.distance;
                ride.final_cost=customerAccount.final_cost;
                 
                
            }
        return ride;
    }
    
    
    async getNewProfileCustomerData(
        connection: Connection,
        pubKeyString: string
    ):Promise<CustomerAccount>{
        const profileKey=new PublicKey(pubKeyString);
        console.log("profileKey",profileKey.toBase58());
        const profileAccount = await connection.getAccountInfo(profileKey);

        if(!profileAccount){
            throw Error(`Account ${profileKey} does not exist`);
        }
        console.log("profileAccount",profileAccount);

        // const profile_hash=lo.cstr("profile_hash");
        // const update_time=lo.cstr("update_time");
        // const dataStruct= lo.struct(
        //     [profile_hash,lo.seq(lo.u8()),update_time,lo.seq(lo.u8())],
        //     "ProfileData"
        // );
        // const profileData=dataStruct.decode(profileAccount.data);
        
        const schema= CustomerAccountSchema;
        let customerAccount : CustomerAccount;
        try{
            customerAccount  = borsh.deserialize(schema,CustomerAccount,profileAccount.data);
        }catch(ex: any){
            console.log(ex);
            if (ex instanceof borsh.BorshError)
                customerAccount= new CustomerAccount();
            else
                throw ex;
        }
        console.log("new customerAccount",customerAccount);
        return customerAccount;
    }


    async getNewProfileDriverData(
        connection: Connection,
        pubKeyString: string
    ):Promise<DriverAccount>{
        const profileKey=new PublicKey(pubKeyString);
        console.log("profileKey",profileKey.toBase58());
        const profileAccount = await connection.getAccountInfo(profileKey);

        if(!profileAccount){
            throw Error(`Account ${profileKey} does not exist`);
        }
        console.log("profileAccount",profileAccount);

        // const profile_hash=lo.cstr("profile_hash");
        // const update_time=lo.cstr("update_time");
        // const dataStruct= lo.struct(
        //     [profile_hash,lo.seq(lo.u8()),update_time,lo.seq(lo.u8())],
        //     "ProfileData"
        // );
        // const profileData=dataStruct.decode(profileAccount.data);
        
        const schema= DriverAccountSchema;
        let driverAccount : DriverAccount;
        try{
            driverAccount  = borsh.deserialize(schema,DriverAccount,profileAccount.data);
        }catch(ex: any){
            console.log(ex);
            if (ex instanceof borsh.BorshError)
                driverAccount= new DriverAccount();
            else
                throw ex;
        }
        console.log("new driver account",driverAccount);
        return driverAccount;
    }



    async getCustomerProfileDataFromProfile(
        profileData: ProfileData
    ):Promise<CustomerProfile>{
        let customerProfileData:CustomerProfile = new CustomerProfile();
        if (profileData.profile_hash && !this.isAllZero(profileData.profile_hash))
            customerProfileData = await arweaveService.loadCustomerProfileData(profileData.profile_hash);
        console.log(customerProfileData);
        return customerProfileData;
    }

    async getCustomerProfileDataFromProfileNew(
        customerAccount: CustomerAccount
    ):Promise<CustomerProfile>{
        let customerProfileData:CustomerProfile = new CustomerProfile();
        if (customerAccount.profile_hash && !this.isAllZero(customerAccount.profile_hash))
            customerProfileData = await arweaveService.loadCustomerProfileData(customerAccount.profile_hash);
        console.log(customerProfileData);
        return customerProfileData;
    }

    async getCustomerProfileDataFromProfileNewDriver(
        customerAccount: DriverAccount
    ):Promise<CustomerProfile>{
        let customerProfileData:CustomerProfile = new CustomerProfile();
        if (customerAccount.profile_hash && !this.isAllZero(customerAccount.profile_hash))
            customerProfileData = await arweaveService.loadCustomerProfileData(customerAccount.profile_hash);
        console.log(customerProfileData);
        return customerProfileData;
    }

    async getCustomerRidesFromProfile(
        profileData: ProfileData
    ):Promise<CustomerRides>{
        let rides:CustomerRides = new CustomerRides();
        if (profileData.rides_hash && !this.isAllZero(profileData.rides_hash))
        rides = await arweaveService.loadCustomerRidesData(profileData.rides_hash);
        console.log(rides);
        return rides;
    }

    async getCustomerProfileData(
        connection: Connection,
        pubKeyString: string
    ):Promise<CustomerProfile>{
    //):Promise<void>{
        const profileData: ProfileData = await this.getProfileData(connection,pubKeyString);
        // get and deserialize solana account data and receive txid
        // go to arweave and query using these txid
        
        
        return await this.getCustomerProfileDataFromProfile(profileData);
        // parse json and return ChatMessages
    }

    async saveCustomerProfileData(
        customerProfileData: CustomerProfile,
        
    ):Promise<string>{
        const arweaveTxId=await arweaveService.saveProfileData(customerProfileData);
        return this.getTxnIdFromArweave(arweaveTxId);
    }

    async saveRidesData(
        customerRides:CustomerRides,
        
    ):Promise<string>{
        const arweaveTxId=await arweaveService.saveRidesData(customerRides);
        return this.getTxnIdFromArweave(arweaveTxId);
    }

    async saveProfileData(
        connection:Connection,
        pubKeyString: string,
        profileData: ProfileData,
        wallet:WalletAdapter
    ):Promise<RpcResponseAndContext<SignatureResult>>{
        const profileKey=new PublicKey(pubKeyString);
        //const profileAccount =connection.getAccountInfo(profileKey);
        //const profileData: ProfileData = new ProfileData();
        //save to arweave
        //const arweaveTxId=await arweaveService.saveProfileData(customerProfileData);
        //get new arweave txn id
        //profileData.profile_hash=this.getTxnIdFromArweave(arweaveTxId);
        profileData.update_time =this.getCreatedOn();
        
        console.log("profileData",profileData);
        
        const profileInstruction = new TransactionInstruction({
            keys:[{pubkey:profileKey,isSigner:false,isWritable:true}],
            programId,
            data:Buffer.from(borsh.serialize(ProfileDataSchema,profileData)),
        });

        const trans=await setPayerAndBlockhashTransaction(
            wallet,
            profileInstruction
        );

        const signature = await signAndSendTransaction(wallet,trans);

        const result= await connection.confirmTransaction(signature,"singleGossip");

        console.log(result);
        return result;

    }

    async getNewDriverProfileData(
        connection: Connection,
        pubKeyString: string,
    ):Promise<DriverAccount>{
        const profileKey=new PublicKey(pubKeyString);
        console.log("profileKey",profileKey.toBase58());
        const profileAccount = await connection.getAccountInfo(profileKey);

        if(!profileAccount){
            throw Error(`Account ${profileKey} does not exist`);
        }
        console.log("profileAccount",profileAccount);

        
        const schema= DriverAccountSchema;
        let driverAccount : DriverAccount;
        try{
            driverAccount  = borsh.deserialize(schema,DriverAccount,profileAccount.data);
        }catch(ex: any){
            console.log(ex);
            if (ex instanceof borsh.BorshError)
            driverAccount= new DriverAccount();
            else
                throw ex;
        }
        console.log("new driverAccount",driverAccount);
        return driverAccount;
    }

    async getDriverProfileDataFromProfileNew(
        driverAccount:DriverAccount
    ):Promise<CustomerProfile>{
        let driverProfileData:CustomerProfile = new CustomerProfile();
        if (driverAccount.profile_hash && !this.isAllZero(driverAccount.profile_hash))
        driverProfileData = await arweaveService.loadDriverProfileData(driverAccount.profile_hash);
        console.log(driverProfileData);
        return driverProfileData;
    }


    // async saveCustomerRideInstruction(
    //     connection:Connection,
    //     pubKeyString:string,
    //     instrRecord: SingleInstruction,
    //     wallet:WalletAdapter
    // ):Promise<RpcResponseAndContext<SignatureResult>>{
    //     const profileKey=new PublicKey(pubKeyString);

    //     // instrRecord.from_lat=this.padZero(instrRecord.from_lat,DUMMY_LATLONG);
    //     // instrRecord.to_lat=this.padZero(instrRecord.to_lat,DUMMY_LATLONG);
    //     // instrRecord.from_long=this.padZero(instrRecord.from_long,DUMMY_LATLONG);
    //     // instrRecord.to_long=this.padZero(instrRecord.to_long,DUMMY_LATLONG);
        
    //     console.log("instrRecord",instrRecord);

    //     const profileInstruction = new TransactionInstruction({
    //         keys:[{pubkey:profileKey,isSigner:false,isWritable:true}],
    //         programId,
    //         data:Buffer.from(borsh.serialize(SingleInstructionSchema,instrRecord)),
    //     });

    //     const trans=await setPayerAndBlockhashTransaction(
    //         wallet,
    //         profileInstruction
    //     );

    //     const signature = await signAndSendTransaction(wallet,trans);

    //     const result= await connection.confirmTransaction(signature,"singleGossip");

    //     console.log(result);
    //     return result;
    // }
    async saveSingleAccountDataInstruction(
        connection:Connection,
        pubKeyString: string,
        instrRecord: SingleInstruction,
        wallet:WalletAdapter
    ):Promise<RpcResponseAndContext<SignatureResult>>{
        const profileKey=new PublicKey(pubKeyString);
        //const profileAccount =connection.getAccountInfo(profileKey);
        //const profileData: ProfileData = new ProfileData();
        //save to arweave
        //const arweaveTxId=await arweaveService.saveProfileData(customerProfileData);
        //get new arweave txn id
        //profileData.profile_hash=this.getTxnIdFromArweave(arweaveTxId);
        //instrRecord. =this.getCreatedOn();
        
        console.log("instrRecord",instrRecord);
        
        const profileInstruction = new TransactionInstruction({
            keys:[{pubkey:profileKey,isSigner:false,isWritable:true}],
            programId,
            data:Buffer.from(borsh.serialize(SingleInstructionSchema,instrRecord)),
        });

        const trans=await setPayerAndBlockhashTransaction(
            wallet,
            profileInstruction
        );

        const signature = await signAndSendTransaction(wallet,trans);

        const result= await connection.confirmTransaction(signature,"singleGossip");

        console.log(result);
        return result;

    }


    async saveDualAccountDataInstruction(
        connection:Connection,
        publicKeys: string[],
        instrRecord: SingleInstruction,
        wallet:WalletAdapter,
        
    ):Promise<RpcResponseAndContext<SignatureResult>>{
        const profileKey1=new PublicKey(publicKeys[0]);
        const profileKey2=new PublicKey(publicKeys[1]);
       
        console.log("instrRecord",instrRecord);
        
        const profileInstruction = new TransactionInstruction({
            keys:[{pubkey:profileKey1,isSigner:false,isWritable:true},
                {pubkey:profileKey2,isSigner:false,isWritable:true}],
            programId,
            data:Buffer.from(borsh.serialize(SingleInstructionSchema,instrRecord)),
        });

        const trans=await setPayerAndBlockhashTransaction(
            wallet,
            profileInstruction
        );

        const signature = await signAndSendTransaction(wallet,trans);

        const result= await connection.confirmTransaction(signature,"singleGossip");

        console.log(result);
        return result;

    }

    async saveDualAccountDataInstructionMultiple(
        connection:Connection,
        publicKeys: any[],
        instrRecords: SingleInstruction[],
        wallet:WalletAdapter,
        
    ):Promise<RpcResponseAndContext<SignatureResult>>{
        
        console.log("instrRecord",instrRecords);
        
        let profileInstructions:TransactionInstruction[] = [];
        for (let i=0;i<instrRecords.length;i++){
            const key=publicKeys[i];
            if(key.length===1){
                const profileKey1=new PublicKey(key[0]);
                
                const profileInstruction = new TransactionInstruction({
                    keys:[
                        {pubkey:profileKey1,isSigner:false,isWritable:true},
                    ],
                    programId,
                    data:Buffer.from(borsh.serialize(SingleInstructionSchema,instrRecords[i])),
                });
                profileInstructions.push(profileInstruction);
            }else{
                const profileKey1=new PublicKey(key[0]);
                const profileKey2=new PublicKey(key[1]);
                
                const profileInstruction = new TransactionInstruction({
                    keys:[
                        {pubkey:profileKey1,isSigner:false,isWritable:true},
                        {pubkey:profileKey2,isSigner:false,isWritable:true}],
                    programId,
                    data:Buffer.from(borsh.serialize(SingleInstructionSchema,instrRecords[i])),
                });
                profileInstructions.push(profileInstruction);
            }
        }

        const trans=await setPayerAndBlockhashTransactionMultipleInstruction(
            wallet,
            profileInstructions
        );

        const signature = await signAndSendTransaction(wallet,trans);

        const result= await connection.confirmTransaction(signature,"singleGossip");

        console.log(result);
        return result;

    }

    public async sendMoneyAndUpdateDriver(
        connection:Connection,
        wallet:WalletAdapter,
        driverPubKeyStr: string,
        lamports: number = 500 * 1000000,
        publicKeys: string[],
        driverInstruction: SingleInstruction
      ):Promise<RpcResponseAndContext<SignatureResult>> {
        
          console.log("starting sendMoney");
          const destPubkey = new PublicKey(driverPubKeyStr);
          const walletAccountInfo = await connection.getAccountInfo(
            wallet!.publicKey!
          );
          console.log("wallet data size", walletAccountInfo?.data.length);
      
          //const receiverAccountInfo = await connection.getAccountInfo(destPubkey);
          //console.log("receiver data size", receiverAccountInfo?.data.length);
            
          let profileInstructions:TransactionInstruction[] = [];
          const instruction = SystemProgram.transfer({
            fromPubkey: wallet!.publicKey!,
            toPubkey: destPubkey,
            lamports, // about half a SOL
          });
          
        const profileKey1=new PublicKey(publicKeys[0]);
        const profileKey2=new PublicKey(publicKeys[1]);
                
          const profileInstruction = new TransactionInstruction({
            keys:[
                {pubkey:profileKey1,isSigner:false,isWritable:true},
                {pubkey:profileKey2,isSigner:false,isWritable:true}],
            programId,
            data:Buffer.from(borsh.serialize(SingleInstructionSchema,driverInstruction)),
        });
        
        profileInstructions.push(instruction);

        profileInstructions.push(profileInstruction);

        //   let trans = await setWalletTransaction(instruction);
      
        //   let signature = await signAndSendTransaction(wallet, trans);
        //   let result = await connection.confirmTransaction(signature, "singleGossip");
        //   console.log("money sent", result);
            const trans=await setPayerAndBlockhashTransactionMultipleInstruction(
                wallet,
                profileInstructions
            );

            const signature = await signAndSendTransaction(wallet,trans);

            const result= await connection.confirmTransaction(signature,"singleGossip");

            console.log(result);
            return result;
         
    }
      

    private getTxnIdFromArweave(newTxId: string){
        let txnId="";
        const dummyLength=DUMMY_TX_ID.length-newTxId.length;
        for (let i=0;i<dummyLength;i++)
            txnId=txnId+"0";
        txnId=txnId+newTxId;
        return txnId;
    }

    public getCreatedOn():string {
        const now=Date.now().toString();
        const total= DUMMY_CREATED_ON.length;
        const diff=total-now.length;
        let time="";
        for(let i=0;i<diff;i++)
            time+="0";
        time+=now;
        return time;
    }

    public padZeroNumeric(val:string, reference:string){
        let newVal:string="";
        let numVal: number=+val;
        let val2: string = numVal.toString();
        const dummyLength=reference.length-val2.length;
        for(let i=0;i<dummyLength;i++)
            newVal+="0";
        newVal+=val;
        return newVal
    }

    public isAllZero(str: string): boolean {
        for (let i = 0; i < str.length; i++) {
            if (str[i] !== "0") {
            return false;
            }
        }
        return true;
    }
}

const profileService : ProfileService= new ProfileService()
export default profileService;