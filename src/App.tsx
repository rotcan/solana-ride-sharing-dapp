import { Connection } from "@solana/web3.js";
import React,{useEffect,useState} from 'react';
import { initWallet, WalletAdapter } from "./solana/wallet";
import {getProfileAccount, setAccountUpdateCallback} from "./solana/accounts";
import {AccountTypes, CustomerAccountSize, DriverAccountSize} from "./utils/util";
import { PublicKey } from "@solana/web3.js";
import Profile from "./components/Profile";
import './App.css';
import profileService from "./solana/profile";

const WALLET_PUB_KEY:string="pub_key_store";
const CONNECTION_KEY:string="conn_store";
const USER_VIEW_KEY:string="user_view_store";
const PROFILE_KEY:string="profile_key_store";

function App() {
  const conn=React.useRef<Connection|undefined>();
  const [myWallet,setMyWallet] = useState<WalletAdapter|undefined>();
  const [userView,setUserView] = useState<AccountTypes | undefined>();
  const [profileKey, setProfileKey] = useState<PublicKey | undefined>();
  const [publicProfileKey, setPublicProfileKey] = useState<string|undefined>();
 

  const walletConnect= async(
    e: React.MouseEvent<HTMLButtonElement,MouseEvent>,walletType: AccountTypes,counter: number)=>{
    e.preventDefault();
    console.log(walletType);
      initWallet().then(async ([connection,wallet]:[Connection,WalletAdapter])=>{
      conn.current=connection;
      console.log("before logging in ",wallet.publicKey);
      if(wallet.publicKey){
        //init profile account
        let size=CustomerAccountSize;
        if (walletType===AccountTypes.Driver)
          size=DriverAccountSize;
        console.log("ProfileDataSize size",size);
        const key:PublicKey=await getProfileAccount(wallet,connection,size,walletType,counter);
        console.log(key.toBase58());
        console.log(wallet.publicKey.toBase58());
        //add account callback
        
        // setPublicProfileKey(key.toBase58().toString());
        setProfileKey(key);
        setUserView(walletType);
        setMyWallet(wallet);
      }
    });
  }
 
  useEffect(()=>{
  
  },[]);
  return (
    <div className="App">
      <header className="header">
      <h1 >Ride Sharing Dapp</h1>
      {/* <div className="right">
        <b>  <label>Public Key:{profileKey}</label>
          <label>({publicProfileKey  && conn.current!==undefined && profileService.getAccountBalance(conn.current,publicProfileKey)})</label>
          </b>
      </div> */}
      </header>

      
      <div className="Main">
        {myWallet === undefined && (
          <div className="Users">
            <div className="Customers">
              <div className="full-width">
              <button className="btn" onClick={(e)=>{walletConnect(e,AccountTypes.Customer,1);}} >Customer 1</button>
              </div>
              <div className="full-width">
              <button className="btn" onClick={(e)=>{walletConnect(e,AccountTypes.Customer,2);}} >Customer 2</button>
              </div>
              <div className="full-width">
              <button className="btn" onClick={(e)=>{walletConnect(e,AccountTypes.Customer,3);}} >Customer 3</button>
              </div>
              <div className="full-width">
              <button className="btn" onClick={(e)=>{walletConnect(e,AccountTypes.Customer,4);}} >Customer 4</button>
              </div>
            </div>
            <div className="Drivers">
              <div className="full-width">
              <button className="btn" onClick={(e)=>{walletConnect(e,AccountTypes.Driver,1);}} >Driver 1</button>
              </div>
              <div className="full-width">
              <button className="btn" onClick={(e)=>{walletConnect(e,AccountTypes.Driver,2);}} >Driver 2</button>
              </div>
              <div className="full-width">
              <button className="btn" onClick={(e)=>{walletConnect(e,AccountTypes.Driver,3);}} >Driver 3</button>
              </div>
          </div>
          {/* <button className="btn" onClick={(e)=>{walletConnect(e,AccountTypes.Admin);}} >Admin</button> */}
          </div>
        )}
        {myWallet!==undefined 
        && userView!==undefined 
        && conn.current!==undefined
        && 
        (
          (
            userView===AccountTypes.Customer &&
            (
              <Profile accountType={userView} walletAddress={profileKey} connection={conn.current} wallet={myWallet} pubKey={profileKey}/>
            
            )
          )
          ||
          (
            userView===AccountTypes.Driver &&
            (
              <Profile accountType={userView} walletAddress={profileKey} connection={conn.current} wallet={myWallet} pubKey={profileKey}/>
            
            )
          )
          
        )}
      </div>
    </div>
  );
}

export default App;
