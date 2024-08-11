import { Test, TestingModule } from '@nestjs/testing';
import { GasPriceService } from './gas-price.service';
import { GasPrice } from './dto/gas-price.dto';
import { Web3Service } from '../web3/web3.service';
import { GasPriceCacheService } from '../storage/gas-price-cache/gas-price-cache.service';
import { GasPriceFetchException } from '../../errors';

describe('GasPriceService', () => {
  let service: GasPriceService;
  let web3Service: Web3Service;
  let gasPriceCacheService: GasPriceCacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GasPriceService,
        {
          provide: Web3Service,
          useValue: {
            getBaseFeePerGas: jest.fn(),
            getFeeData: jest.fn(),
          },
        },
        {
          provide: GasPriceCacheService,
          useValue: {
            getGasPrice: jest.fn(),
            setGasPrice: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GasPriceService>(GasPriceService);
    web3Service = module.get<Web3Service>(Web3Service);
    gasPriceCacheService = module.get<GasPriceCacheService>(GasPriceCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getGasPrice', () => {
    it('should return cached gas price if available', async () => {
      const cachedGasPrice: GasPrice = {
        baseFee: '10000000000',
        maxPriorityFeePerGas: '2000000000',
        maxFeePerGas: '12000000000',
      };
      jest.spyOn(gasPriceCacheService, 'getGasPrice').mockResolvedValue(cachedGasPrice);

      const result = await service.getGasPrice();

      expect(result).toBe(cachedGasPrice);
      expect(gasPriceCacheService.getGasPrice).toHaveBeenCalled();
      expect(web3Service.getBaseFeePerGas).not.toHaveBeenCalled();
    });

    it('should fetch gas price from chain for legacy type if cache is empty', async () => {
      const gasPriceFromChain: GasPrice = {
        gasPrice: '10000000000',
      };
      jest.spyOn(gasPriceCacheService, 'getGasPrice').mockResolvedValue(null);
      jest.spyOn(web3Service, 'getBaseFeePerGas').mockResolvedValue(0n);
      jest.spyOn(web3Service, 'getFeeData').mockResolvedValue({
        gasPrice: BigInt(10000000000),
        maxPriorityFeePerGas: undefined,
        maxFeePerGas: undefined,
      });

      const result = await service.getGasPrice();

      expect(result).toEqual(gasPriceFromChain);
      expect(web3Service.getBaseFeePerGas).toHaveBeenCalled();
      expect(web3Service.getFeeData).toHaveBeenCalled();
    });

    it('should fetch gas price from chain for EIP1559 type if cache is empty', async () => {
      const gasPriceFromChain: GasPrice = {
        baseFee: '10000000000',
        maxPriorityFeePerGas: '2000000000',
        maxFeePerGas: '12000000000',
      };
      jest.spyOn(gasPriceCacheService, 'getGasPrice').mockResolvedValue(null);
      jest.spyOn(web3Service, 'getBaseFeePerGas').mockResolvedValue(BigInt(10000000000));
      jest.spyOn(web3Service, 'getFeeData').mockResolvedValue({
        gasPrice: BigInt(10000000000),
        maxPriorityFeePerGas: BigInt(2000000000),
        maxFeePerGas: BigInt(12000000000),
      });

      const result = await service.getGasPrice();

      expect(result).toEqual(gasPriceFromChain);
      expect(web3Service.getBaseFeePerGas).toHaveBeenCalled();
      expect(web3Service.getFeeData).toHaveBeenCalled();
    });

    it('should throw GasPriceFetchException if both cache and chain fetch fail', async () => {
      jest.spyOn(gasPriceCacheService, 'getGasPrice').mockRejectedValue(new Error('Redis error'));
      jest.spyOn(web3Service, 'getBaseFeePerGas').mockRejectedValue(new Error('Chain error'));

      await expect(service.getGasPrice()).rejects.toThrow(GasPriceFetchException);
    });
  });

  describe('updateGasPrice', () => {
    it('should update gas price and log success', async () => {
      const gasPriceFromChain: GasPrice = {
        baseFee: '10000000000',
        maxPriorityFeePerGas: '2000000000',
        maxFeePerGas: '12000000000',
      };
      jest.spyOn(web3Service, 'getBaseFeePerGas').mockResolvedValue(BigInt(10000000000));
      jest.spyOn(web3Service, 'getFeeData').mockResolvedValue({
        gasPrice: BigInt(10000000000),
        maxPriorityFeePerGas: BigInt(2000000000),
        maxFeePerGas: BigInt(12000000000),
      });
      jest.spyOn(gasPriceCacheService, 'setGasPrice').mockResolvedValue(undefined);

      const logSpy = jest.spyOn(service['logger'], 'log');

      await service.updateGasPrice();

      expect(web3Service.getBaseFeePerGas).toHaveBeenCalled();
      expect(web3Service.getFeeData).toHaveBeenCalled();
      expect(gasPriceCacheService.setGasPrice).toHaveBeenCalledWith(gasPriceFromChain);
      expect(logSpy).toHaveBeenCalledWith('Successfully updated gas price');
    });

    it('should log an error if update fails', async () => {
      jest.spyOn(web3Service, 'getBaseFeePerGas').mockRejectedValue(new Error('Chain error'));
      const logSpy = jest.spyOn(service['logger'], 'error');

      await service.updateGasPrice();

      expect(logSpy).toHaveBeenCalledWith('Failed to update gas price, error: Chain error');
    });
  });
});
