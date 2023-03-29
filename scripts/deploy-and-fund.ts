import { StarkNetWallet } from "../src/StarkNetWallet";
import { getProvider } from "../src/ProviderConfig";
import { utils } from "ethers";
import fs from "fs";

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const ACCOUNT_ADDRESS = process.env.ACCOUNT_ADDRESS;

async function main() {
  let provider = getProvider();

  let funderWallet = new StarkNetWallet(PRIVATE_KEY, provider, ACCOUNT_ADDRESS);

  let funderBalance = await funderWallet.getBalance();
  console.log("Funder Balance", utils.formatEther(funderBalance));

  let newMnemonic = StarkNetWallet.generateSeed();
  let futureAddress = StarkNetWallet.computeAddressFromMnemonic(newMnemonic, 2);
  console.log(`Future Address ${futureAddress}`);

  console.log("Funding");
  let amount = utils.parseEther("0.0005");
  // console.log('Amount:', amount);
  // await funderWallet.transfer(futureAddress, amount);

  await StarkNetWallet.deployPrefundedAccount(futureAddress, newMnemonic, provider);

  let newWallet = StarkNetWallet.fromMnemonic(newMnemonic, 1, provider);

  let newAccountBalance = await newWallet.getBalance();
  console.log("New Balance", utils.formatEther(newAccountBalance));

  fs.appendFile('secret1.txt', futureAddress + "\n", function (err) {
      if (err) throw err;
  });
}

main();
