import { VercelRequest, VercelResponse } from '@vercel/node';
import { DomainVerificationService } from '@lib/verification';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { domainName, ownerAddress } = req.body;
    
    const verificationService = new DomainVerificationService();
    const verification = await verificationService.generateVerificationProof(
      domainName,
      ownerAddress
    );

    res.status(200).json({
      isValid: verification.validity >= 70,
      proof: verification.proof,
      sources: verification.sources,
      score: verification.validity
    });
  } catch (error) {
    console.error('Error verifying domain:', error);
    res.status(400).json({ error: error.message });
  }
}