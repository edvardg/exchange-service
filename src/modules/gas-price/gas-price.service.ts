import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { GasPrice } from './dto/gas-price.dto';
import { Web3Service } from '../web3/web3.service';
import { GasPriceCacheService } from '../storage/gas-price-cache/gas-price-cache.service';
import { GasPriceFetchException } from '../../errors';

const GAS_PRICE_UPDATE_INTERVAL = 2000;

@Injectable()
export class GasPriceService {
  private logger: Logger = new Logger(GasPriceService.name);

  constructor(
    private readonly web3Service: Web3Service,
    private readonly gasPriceCacheService: GasPriceCacheService,
  ) {}

  /*
    Note: Consider offloading this periodic task to a separate worker service.
    This would keep GasPriceService more lightweight and focused on serving requests.
    A worker could be responsible for updating the gas price at regular intervals
    and storing it in Redis or another persistent storage.
  */
  @Interval(GAS_PRICE_UPDATE_INTERVAL)
  async updateGasPrice(): Promise<void> {
    try {
      const gasPrice: GasPrice = await this.getGasPriceFromChain();
      await this.setGasPrice(gasPrice);

      this.logger.log('Successfully updated gas price');
    } catch (error) {
      this.logger.error(`Failed to update gas price, error: ${error.message}`);
    }
  }

  async getGasPrice(): Promise<GasPrice> {
    try {
      const cachedGasPrice = await this.gasPriceCacheService.getGasPrice();
      if (!cachedGasPrice) {
        this.logger.log('Fetching gas price from chain');

        return this.getGasPriceFromChain();
      }

      return cachedGasPrice;
    } catch (error) {
      this.logger.error(`Failed to fetch gas price, error: ${error.message}`);
      throw new GasPriceFetchException(error.message);
    }
  }

  private async getGasPriceFromChain(): Promise<GasPrice> {
    const [baseFee, feeData] = await Promise.all([
      this.web3Service.getBaseFeePerGas(),
      this.web3Service.getFeeData(),
    ]);

    const { gasPrice, maxPriorityFeePerGas } = feeData;
    if (!baseFee) {
      return { gasPrice: gasPrice.toString() };
    }

    /*
      Note: maxFeePerGas is calculated as baseFee + maxPriorityFeePerGas.
      This value represents the current network conditions, but the base fee may
      increase slightly before the transaction is mined. Consider adjusting
      maxFeePerGas slightly higher for robustness.
    */
    const effectiveMaxFeePerGas = baseFee + maxPriorityFeePerGas;

    return {
      baseFee: baseFee.toString(),
      maxPriorityFeePerGas: maxPriorityFeePerGas.toString(),
      maxFeePerGas: effectiveMaxFeePerGas.toString(),
    };
  }

  private async setGasPrice(gasPrice: GasPrice): Promise<void> {
    await this.gasPriceCacheService.setGasPrice(gasPrice);
  }
}
