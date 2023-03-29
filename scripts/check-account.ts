import { StarkNetWallet } from "../src/StarkNetWallet";
import { getProvider } from "../src/ProviderConfig";
import { utils } from "ethers";
import fs from "fs";
import readline from 'readline';
import { stark } from "starknet";

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const ACCOUNT_ADDRESS = process.env.ACCOUNT_ADDRESS;

async function main() {
  let provider = getProvider();
  const fileStream = fs.createReadStream('secret1.txt');
  
  const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
  });
  let count = 1;
  for await (const line of rl) {
    await sleep(1000).then(async() => {
      const authArr = line.split(",");
      let address = authArr[1];
      let mnemonic = authArr[0];
      let newWallet = StarkNetWallet.fromMnemonic(mnemonic, 0, provider);
      try {
        const balance = await newWallet.getBalance();
        console.log(count, balance)
      } catch (ex) {
        console.log(count,address);
      }
      count++;
    })
  }
}

function sleep(ms: any) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main();
