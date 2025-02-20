import { VercelRequest, VercelResponse } from '@vercel/node';
import { getContract } from '@lib/contract';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { domainName, price, duration } = req.body;
    const contract = await getContract();
    
    const tx = await contract.createEscrow(domainName, price, duration);
    const receipt = await tx.wait();
    
    res.status(200).json({
      transactionHash: receipt.hash,
      escrowId: receipt.events[0].args.escrowId.toString()
    });
  } catch (error) {
    console.error('Error creating escrow:', error);
    res.status(400).json({ error: error.message });
  }
}