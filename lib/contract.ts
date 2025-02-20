import { ethers } from 'ethers';

let contract: ethers.Contract | null = null;

export async function getContract() {
  if (contract) return contract;

  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY || '', provider);
  
  contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS || '',
    process.env.CONTRACT_ABI || '',
    wallet
  );

  return contract;
}