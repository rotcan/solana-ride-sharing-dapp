import Wallet from '@project-serum/sol-wallet-adapter';
import {
    Connection,
    SystemProgram,
    PublicKey,
    TransactionInstruction,
    Transaction,
} from "@solana/web3.js";

import EventEmitter from "eventemitter3";

export interface WalletAdapter extends EventEmitter{
    publicKey: PublicKey | null;
    signTransaction:(transaction: Transaction) => Promise<Transaction>;
    connect:() => any;
    disconnect:() => any;
}

const cluster = "http://localhost:8899";
const connection = new Connection (cluster,"confirmed");
const wallet: WalletAdapter = new Wallet("https://www.sollet.io",cluster);

export async function initWallet(): Promise<[Connection,WalletAdapter]>{
    await wallet.connect();
    return [connection,wallet];
}

export async function setPayerAndBlockhashTransaction(
    wallet:WalletAdapter,
    instruction: TransactionInstruction
): Promise<Transaction>{
    const transaction = new Transaction();
    transaction.add(instruction);
    transaction.feePayer=wallet!.publicKey!;
    let hash=await connection.getRecentBlockhash();
    transaction.recentBlockhash=hash.blockhash;
    return transaction;
}

export async function setPayerAndBlockhashTransactionMultipleInstruction(
    wallet:WalletAdapter,
    instructions: TransactionInstruction[]
): Promise<Transaction>{
    const transaction = new Transaction();
    for(let i=0;i<instructions.length;i++)
        transaction.add(instructions[i]);
    transaction.feePayer=wallet!.publicKey!;
    let hash=await connection.getRecentBlockhash();
    transaction.recentBlockhash=hash.blockhash;
    return transaction;
}

export async function signAndSendTransaction(
    wallet: WalletAdapter,
    transaction: Transaction
):Promise<string>{
    try{
        console.log("start signAndSendTransaction");
        let signedTrans=await wallet.signTransaction(transaction);
        console.log("signed transaction");
        console.log(signedTrans.serialize());
        let signature = await connection.sendRawTransaction(
            signedTrans.serialize(), {
                skipPreflight: false,
              }
        );
        console.log("end signAndSendTransaction");
        return signature;
    }catch(err){
        console.log("signAndSendTransaction error",err);
        throw err;
    }
}