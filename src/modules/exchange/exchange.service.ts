import { Injectable, Logger } from '@nestjs/common';
import { Web3Service } from '../web3/web3.service';
import { ExchangeCalculationOutput } from './dto/exchange-calculation-output.dto';
import {
  InsufficientInputAmountException,
  InsufficientLiquidityException,
  PairReserveFetchException,
} from '../../errors';

@Injectable()
export class ExchangeService {
  private logger: Logger = new Logger(ExchangeService.name);

  constructor(private readonly web3Service: Web3Service) {}

  async calculateExchangeOutput(
    fromTokenAddress: string,
    toTokenAddress: string,
    amountIn: string,
  ): Promise<ExchangeCalculationOutput> {
    const pairAddress = this.web3Service.getPairAddress(fromTokenAddress, toTokenAddress);

    const amountInInt = BigInt(amountIn);
    if (amountInInt <= 0n) {
      this.logger.error(`Invalid input amount: ${amountIn}`);
      throw new InsufficientInputAmountException('Invalid input amount');
    }

    let [reserveIn, reserveOut] = [0n, 0n];
    try {
      [reserveIn, reserveOut] = await this.getReserves(pairAddress, fromTokenAddress, toTokenAddress);
    } catch (error) {
      this.logger.error(`Failed to fetch pair reserves, error: ${error.message}`);
      throw new PairReserveFetchException(error.message);
    }

    if (reserveIn <= 0n || reserveOut <= 0n) {
      this.logger.error(`Invalid reserves: ${reserveIn} ${reserveOut}`);
      throw new InsufficientLiquidityException('Invalid reserves');
    }

    const amountOut = this.getAmountOut(amountInInt, reserveIn, reserveOut);

    return { amountOut: amountOut.toString() };
  }

  private async getReserves(pairAddress: string, tokenA: string, tokenB: string): Promise<[bigint, bigint]> {
    const { reserveA, reserveB } = await this.web3Service.getReserves(pairAddress);
    const [token0] = this.sortTokens(tokenA, tokenB);

    return tokenA.toLowerCase() === token0.toLowerCase() ? [reserveA, reserveB] : [reserveB, reserveA];
  }

  private sortTokens(tokenA: string, tokenB: string): [string, string] {
    return tokenA.toLowerCase() < tokenB.toLowerCase() ? [tokenA, tokenB] : [tokenB, tokenA];
  }

  private getAmountOut(amountIn: bigint, reserveIn: bigint, reserveOut: bigint): bigint {
    const amountInWithFee = amountIn * BigInt(997); // considering 0.3% fee
    const numerator = amountInWithFee * reserveOut;
    const denominator = reserveIn * BigInt(1000) + amountInWithFee;

    return numerator / denominator;
  }
}
