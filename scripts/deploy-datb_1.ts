import { StarkNetWallet } from "../src/StarkNetWallet";
import { getProvider } from "../src/ProviderConfig";
import { utils } from "ethers";
import fs from "fs";

const PRIVATE_KEY = process.env.PRIVATE_KEY_1 || "";
const ACCOUNT_ADDRESS = process.env.ACCOUNT_ADDRESS_1;

async function main() {
  let provider = getProvider();

  let funderWallet = new StarkNetWallet(PRIVATE_KEY, provider, ACCOUNT_ADDRESS);

  for (let i = 0; i <= 500; i++) {
    let newMnemonic = StarkNetWallet.generateSeed();
    let futureAddress = StarkNetWallet.computeAddressFromMnemonic(newMnemonic, 0);
    console.log(`Future Address ${futureAddress}`);

    let amount = utils.parseEther("0.0005");
    while(true) {
      try {
        await funderWallet.transfer(futureAddress, amount);
        break;
      } catch (exep) {
        console.log(exep)
        await funderWallet.transfer(futureAddress, amount);
        break;
      }
    }
    
    while(true) {
      try {
        StarkNetWallet.deployPrefundedAccount(futureAddress, newMnemonic, provider);
        break;
      } catch (exep) {
        console.log(exep)
        StarkNetWallet.deployPrefundedAccount(futureAddress, newMnemonic, provider);
        break;
      }
    }
    fs.appendFile('secret1.txt', newMnemonic + "," + futureAddress + "\n", function (err) {
        if (err) throw err;
    });
    
  }
  
}

function sleep(ms: any) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main();
