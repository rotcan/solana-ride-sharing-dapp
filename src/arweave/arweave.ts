import Arweave from 'arweave';
import { JWKInterface } from 'arweave/node/lib/wallet';
import TestWeave from 'testweave-sdk';
import { CustomerProfile, CustomerRides} from '../utils/util';

class ArweaveService{
    arweave:Arweave;
    testWeave?:TestWeave;
    walletKey?:JWKInterface;
    
    constructor(){
        this.arweave=Arweave.init({
            host:"localhost",
            port:1984,
            protocol:"http",
        });

        TestWeave.init(this.arweave).then((testWeave)=>{
            this.testWeave=testWeave;
            this.walletKey=this.testWeave.rootJWK;
        });

    }

    public async saveProfileData(profile:CustomerProfile):Promise<string> {
        
        const jsonData:string =JSON.stringify(profile);
        return await this.saveData(jsonData);
       
    }

    public async saveRidesData(rides:CustomerRides):Promise<string>{
        const jsonData:string =JSON.stringify(rides);
        return await this.saveData(jsonData);
    }

    private async saveData(jsonData : string):Promise<string>{
        let transaction = await this.arweave.createTransaction({
            data:jsonData
        },this.walletKey!);
        //Buffer.from(jsonData,'utf-8')

        transaction.addTag("Content-Type","text/plain");

        //sign
        await this.arweave.transactions.sign(transaction,this.walletKey!);
        //post
        await this.arweave.transactions.post(transaction);

        await this.testWeave!.mine();

        const hash=transaction.id;
        const status=await this.arweave.transactions.getStatus(hash);
        
        console.log("arweave post status = ",status);

        return hash;
    }

    public async loadCustomerProfileData(hash: string):Promise<CustomerProfile>{
        let profileObj: CustomerProfile;
        try{
            const data=await this.arweave.transactions.getData(hash,{decode:true,string:true});
            
            //const profileObj = SerializationHelper.toInstance(new CustomerProfile(),data.toString());
            profileObj = JSON.parse(data.toString());
        }catch(error){
            profileObj=new CustomerProfile();
        }
        return profileObj;
    }

    public async loadDriverProfileData(hash: string):Promise<CustomerProfile>{
        const data=await this.arweave.transactions.getData(hash,{decode:true,string:true});
        
        //const profileObj = SerializationHelper.toInstance(new CustomerProfile(),data.toString());
        let profileObj: CustomerProfile = JSON.parse(data.toString());
        return profileObj;
    }

    public async loadCustomerRidesData(hash: string):Promise<CustomerRides>{
        const data=await this.arweave.transactions.getData(hash,{decode:true,string:true});
        let customerRides: CustomerRides = JSON.parse(data.toString());
        return customerRides;
    }
}

const arweaveService: ArweaveService = new ArweaveService()
export default arweaveService;