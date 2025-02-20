import { VercelRequest, VercelResponse } from '@vercel/node';
import { getContract } from '@lib/contract';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const contract = await getContract();
    
    const escrow = await contract.escrows(id);
    res.status(200).json(escrow);
  } catch (error) {
    console.error('Error fetching escrow:', error);
    res.status(404).json({ error: 'Escrow not found' });
  }
}