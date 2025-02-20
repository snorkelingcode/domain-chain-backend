import axios from 'axios';
import { ethers } from 'ethers';

interface VerificationSource {
  name: string;
  verify: (domain: string, owner: string) => Promise<VerificationResult>;
}

interface VerificationResult {
  valid: boolean;
  confidence: number;
  source: string;
}

interface VerificationProof {
  proof: string;
  validity: number;
  sources: string[];
}

export class DomainVerificationService {
  private verificationSources: VerificationSource[] = [
    {
      name: 'dns-root-servers',
      verify: this.verifyDNSRootServers.bind(this)
    },
    {
      name: 'registrar-apis',
      verify: this.verifyRegistrarAPI.bind(this)
    },
    {
      name: 'blockchain-oracles',
      verify: this.verifyBlockchainOracle.bind(this)
    }
  ];

  async generateVerificationProof(
    domainName: string, 
    ownerAddress: string
  ): Promise<VerificationProof> {
    const verificationResults = await Promise.all(
      this.verificationSources.map(async source => ({
        ...await source.verify(domainName, ownerAddress),
        sourceName: source.name
      }))
    );

    const validSources = verificationResults.filter(result => result.valid);
    
    return {
      proof: this.generateCryptographicProof(validSources),
      validity: (validSources.length / this.verificationSources.length) * 100,
      sources: validSources.map(v => v.sourceName)
    };
  }

  private async verifyDNSRootServers(
    domainName: string, 
    ownerAddress: string
  ): Promise<VerificationResult> {
    try {
      const response = await axios.get(
        `https://dns-verification.api/lookup/${domainName}`,
        {
          headers: { 
            'Authorization': `Bearer ${process.env.DNS_VERIFICATION_TOKEN}` 
          }
        }
      );

      return {
        valid: response.data.owner.toLowerCase() === ownerAddress.toLowerCase(),
        confidence: 90,
        source: 'dns-root-servers'
      };
    } catch (error) {
      console.error('DNS root server verification failed', error);
      return {
        valid: false,
        confidence: 0,
        source: 'dns-root-servers'
      };
    }
  }

  private async verifyRegistrarAPI(
    domainName: string, 
    ownerAddress: string
  ): Promise<VerificationResult> {
    try {
      const response = await axios.post(
        'https://registrar-verification.api/verify',
        { 
          domain: domainName, 
          owner: ownerAddress 
        },
        {
          headers: { 
            'Authorization': `Bearer ${process.env.REGISTRAR_VERIFICATION_TOKEN}` 
          }
        }
      );

      return {
        valid: response.data.verified,
        confidence: response.data.confidence || 80,
        source: 'registrar-apis'
      };
    } catch (error) {
      console.error('Registrar API verification failed', error);
      return {
        valid: false,
        confidence: 0,
        source: 'registrar-apis'
      };
    }
  }

  private async verifyBlockchainOracle(
    domainName: string, 
    ownerAddress: string
  ): Promise<VerificationResult> {
    try {
      const response = await axios.get(
        `https://blockchain-oracle.api/domain-ownership/${domainName}`,
        {
          headers: { 
            'Authorization': `Bearer ${process.env.BLOCKCHAIN_ORACLE_TOKEN}` 
          }
        }
      );

      return {
        valid: response.data.owner.toLowerCase() === ownerAddress.toLowerCase(),
        confidence: 85,
        source: 'blockchain-oracles'
      };
    } catch (error) {
      console.error('Blockchain oracle verification failed', error);
      return {
        valid: false,
        confidence: 0,
        source: 'blockchain-oracles'
      };
    }
  }

  private generateCryptographicProof(validSources: any[]): string {
    return ethers.keccak256(
      ethers.toUtf8Bytes(
        validSources.map(source => 
          JSON.stringify(source)
        ).join('|')
      )
    );
  }
}
