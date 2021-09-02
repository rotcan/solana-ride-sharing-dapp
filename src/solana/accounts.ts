import { AccountChangeCallback, AccountInfo, Connection, PublicKey, SystemProgram } from "@solana/web3.js";
import { AccountTypes, GetSeed } from "../utils/util";
import {programId} from "./program";

import {
    setPayerAndBlockhashTransaction,
    signAndSendTransaction,
    WalletAdapter,
} from "./wallet";

export function setAccountUpdateCallback(publicKey: PublicKey,
    callback: AccountChangeCallback,
    connection: Connection):void{
        connection.onAccountChange(publicKey,callback);
}


export async function getProfileAccount(
    wallet:WalletAdapter,
    connection:Connection,
    space: number,
    accountType: AccountTypes,
    counter: number
): Promise<PublicKey>{
    if(!wallet.publicKey){
        throw Error("Wallet has no PublicKey");
    }
    let profileAccountPubKey: PublicKey | null =null;

    console.log("Create new profile account");
    console.log(wallet.publicKey,accountType);
    const PROFILE_SEED = GetSeed(accountType,counter);
    profileAccountPubKey = await PublicKey.createWithSeed(
        wallet.publicKey,
        PROFILE_SEED,
        programId,
    );

    // Check if the greeting account has already been created
    const profileAccount = await connection.getAccountInfo(profileAccountPubKey);
    console.log("space",space);
    console.log("profileAccount",profileAccount);
    if (profileAccount === null) {
        console.log(
        'Creating account',
        profileAccountPubKey.toBase58(),
        'for storing profile info',
        );
        const lamports = await connection.getMinimumBalanceForRentExemption(
            space,
        );
        const instruction= SystemProgram.createAccountWithSeed({
            fromPubkey: wallet.publicKey,
            basePubkey: wallet.publicKey,
            seed: PROFILE_SEED,
            newAccountPubkey: profileAccountPubKey,
            lamports,
            space: space,
            programId,
        });
        
        let trans=await setPayerAndBlockhashTransaction(wallet,instruction);
        let signature=await signAndSendTransaction(wallet,trans);
        let result = await connection.confirmTransaction(signature,"singleGossip");
        console.log(result);
        
        
    }
    return profileAccountPubKey;
}

