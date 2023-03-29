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
  let count = 1
  for await (const line of rl) {
    await sleep(2000).then(async() => {
      const authArr = line.split(",");
      let address = authArr[1];
      let mnemonic = authArr[0];
      let account = StarkNetWallet.getAccountFromMnemonic(address, mnemonic, 0, provider);
      console.log(count, address)
      count++
      //Allow
      let loopFlag = true
      while (loopFlag) {
        try {
          const allowHash = await account.execute(
            [
              {
                //ETH Gate
                contractAddress: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
                entrypoint: 'approve',
                calldata: stark.compileCalldata([
                  // zklend market
                  '0x10fe9d5af7a51945d67e72167b57a856736a792b873407363f8ff81244c4bbb',
                  '1000000000000000', //0.0001 ETH
                  '0'
                  ])
              },
              {
                contractAddress: '0x010fe9d5af7a51945d67e72167b57a856736a792b873407363f8ff81244c4bbb',
                entrypoint: 'deposit',
                calldata: stark.compileCalldata({
                  token: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
                  amount: '100000000000000'
                })
              },
              {
                contractAddress: '0x010fe9d5af7a51945d67e72167b57a856736a792b873407363f8ff81244c4bbb',
                entrypoint: 'enable_collateral',
                calldata: stark.compileCalldata([
                  '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7'
                ])
              }
            ]
            ,
            undefined,
            {
              maxFee: "230639040202010"
            },
          );
          await provider.waitForTransaction(allowHash.transaction_hash);
          loopFlag = false
        } catch(e) {
          // console.log(e)
          console.log('Wait 5 min')
          await sleep(360000)
          console.log('Retry deposit ' + address)
        }
      }
      
      // Borrow
      let borrLoopFlag = true
      while (borrLoopFlag) {
        try {
          const executeBorrowHash = await account.execute(
            {
              contractAddress: '0x010fe9d5af7a51945d67e72167b57a856736a792b873407363f8ff81244c4bbb',
              entrypoint: 'borrow',
              calldata: stark.compileCalldata({
                token: '0x5a643907b9a4bc6a55e9069c4fd5fd1f5c79a22470690f75556c4736e34426',
                amount: '10000'
              },
              )
            },
            undefined,
            {
              maxFee: "230639040202010"
            },
          );
          await provider.waitForTransaction(executeBorrowHash.transaction_hash);
          borrLoopFlag = false
        } catch (e) {
          // console.log(e)
          console.log('Wait 5 min')
          await sleep(360000)
          console.log('Retry borrow ' + address)
        }
      }
    })
    
  }

}

function sleep(ms: any) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main();
