import { VercelRequest, VercelResponse } from '@vercel/node';
import { getContract } from '@lib/contract';
import { ethers } from 'ethers';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const contract = await getContract();
    
    // Get active listings from contract
    const activeListings = await contract.getActiveListings();
    
    // Transform contract data into frontend format
    const listings = await Promise.all(activeListings.map(async (listing: any) => {
      const verificationStatus = await contract.getDomainVerificationStatus(listing.tokenId);
      
      return {
        id: listing.tokenId.toString(),
        domain: listing.domainName,
        price: ethers.formatEther(listing.price),
        seller: listing.seller,
        createdAt: new Date(listing.timestamp * 1000).toISOString(),
        status: 'active',
        verificationStatus: verificationStatus.status,
        priceHistory: [
          {
            price: ethers.formatEther(listing.price),
            date: new Date(listing.timestamp * 1000).toISOString()
          }
        ],
        duration: listing.duration,
        description: listing.description || 'No description provided',
        category: listing.category || 'General',
        tld: '.' + listing.domainName.split('.').pop()
      };
    }));

    // For development, if no listings found, return test data
    if (listings.length === 0) {
      return res.status(200).json([
        {
          id: '1',
          domain: 'example.com',
          price: '2.5',
          seller: '0x1234...5678',
          createdAt: new Date().toISOString(),
          status: 'active',
          verificationStatus: 'verified',
          priceHistory: [
            { price: '3.0', date: '2024-01-01' },
            { price: '2.8', date: '2024-02-01' },
            { price: '2.5', date: '2024-03-01' }
          ],
          duration: 14,
          description: 'Premium domain name',
          category: 'Technology',
          tld: '.com'
        },
        {
          id: '2',
          domain: 'crypto.io',
          price: '5.0',
          seller: '0x5678...9012',
          createdAt: new Date().toISOString(),
          status: 'active',
          verificationStatus: 'pending',
          priceHistory: [
            { price: '6.0', date: '2024-01-01' },
            { price: '5.5', date: '2024-02-01' },
            { price: '5.0', date: '2024-03-01' }
          ],
          duration: 30,
          description: 'Perfect for crypto projects',
          category: 'Crypto',
          tld: '.io'
        }
      ]);
    }

    res.status(200).json(listings);
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch listings' 
    });
  }
}