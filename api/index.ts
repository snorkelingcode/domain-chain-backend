import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ 
    status: 'online',
    message: 'Domain Chain API is running',
    endpoints: {
      create: '/api/escrow/create',
      get: '/api/escrow/:id',
      verify: '/api/escrow/verify/:id'
    }
  });
}