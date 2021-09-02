import Arweave from "arweave";
import * as fs from "fs/promises";
import {existsSync} from "fs";

(async function () {
    const filepath=__dirname + "wallet.json";
    console.log("file to check",filepath);

    if(!existsSync(filepath)){
        const arweave = Arweave.init({
            host:"127.0.0.1",
            port:1984,
            protocol:"http",
        });

        const key=await arweave.wallets.generate();

        const address = await arweave.wallets.jwkToAddress(key);

        const wallet={
            key,
            address
        };

        await fs.writeFile(filepath,JSON.stringify(wallet));
        console.log("wallet created");
    }else{
        console.log("wallet already exists");
    }
})();