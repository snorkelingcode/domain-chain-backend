import { VercelRequest, VercelResponse } from '@vercel/node';
import { rewardsService } from '@lib/rewards-service';

// Get user's rewards information
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method === 'GET') {
    try {
      const { address } = req.query;

      if (!address || typeof address !== 'string') {
        return res.status(400).json({ error: 'Invalid address' });
      }

      const rewardsData = await rewardsService.getUserRewards(address);

      res.status(200).json({
        success: true,
        data: rewardsData
      });
    } catch (error) {
      console.error('Rewards retrieval error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  } else if (req.method === 'POST') {
    // Token transfer endpoint
    try {
      const { from, to, amount } = req.body;

      if (!from || !to || !amount) {
        return res.status(400).json({ error: 'Missing required parameters' });
      }

      const transferReceipt = await rewardsService.transferTokens(from, to, amount);

      res.status(200).json({
        success: true,
        transactionHash: transferReceipt.hash
      });
    } catch (error) {
      console.error('Token transfer error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}