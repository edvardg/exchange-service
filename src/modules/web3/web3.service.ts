import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class Web3Service {
  private readonly provider: ethers.JsonRpcProvider;
  private readonly factoryV2Address: string;

  constructor(private readonly configService: ConfigService) {
    this.provider = new ethers.JsonRpcProvider(this.configService.web3.rpcUrl);
    this.factoryV2Address = this.configService.web3.factoryV2Address;
  }

  async getBaseFeePerGas(): Promise<bigint> {
    const pendingBlock = await this.provider.getBlock('pending');

    return pendingBlock.baseFeePerGas ? pendingBlock.baseFeePerGas : 0n;
  }

  async getFeeData(): Promise<{
    gasPrice: bigint;
    maxPriorityFeePerGas: bigint;
    maxFeePerGas: bigint;
  }> {
    const feeData = await this.provider.getFeeData();
    return {
      gasPrice: feeData.gasPrice,
      maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
      maxFeePerGas: feeData.maxFeePerGas,
    };
  }

  async getReserves(pairAddress: string): Promise<{ reserveA: bigint; reserveB: bigint }> {
    const pairABI = [
      'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
    ];
    const pairContract = new ethers.Contract(pairAddress, pairABI, this.provider);
    const [reserve0, reserve1] = await pairContract.getReserves();
    return { reserveA: reserve0, reserveB: reserve1 };
  }

  getPairAddress(tokenA: string, tokenB: string): string {
    const [token0, token1] = this.sortTokens(tokenA, tokenB);

    const salt = ethers.keccak256(ethers.solidityPacked(['address', 'address'], [token0, token1]));

    return ethers.getCreate2Address(this.factoryV2Address, salt, this.configService.web3.pairV2InitCodeHash);
  }

  private sortTokens(tokenA: string, tokenB: string): [string, string] {
    return tokenA.toLowerCase() < tokenB.toLowerCase() ? [tokenA, tokenB] : [tokenB, tokenA];
  }
}
