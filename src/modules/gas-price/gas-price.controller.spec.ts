import { Test, TestingModule } from '@nestjs/testing';
import { GasPriceController } from './gas-price.controller';
import { GasPriceService } from './gas-price.service';
import { GasPrice } from './dto/gas-price.dto';
import { GasPriceFetchException } from '../../errors';

describe('GasPriceController', () => {
  let controller: GasPriceController;
  let service: GasPriceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GasPriceController],
      providers: [
        {
          provide: GasPriceService,
          useValue: {
            getGasPrice: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GasPriceController>(GasPriceController);
    service = module.get<GasPriceService>(GasPriceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getGasPrice', () => {
    it('should return gas price for a legacy transaction type', async () => {
      const mockGasPrice: GasPrice = { gasPrice: '10000000000' };
      jest.spyOn(service, 'getGasPrice').mockResolvedValue(mockGasPrice);

      const result = await controller.getGasPrice();

      expect(result).toEqual(mockGasPrice);
      expect(service.getGasPrice).toHaveBeenCalled();
    });

    it('should return gas price for an EIP-1559 transaction type', async () => {
      const mockGasPrice: GasPrice = {
        baseFee: '10000000000',
        maxPriorityFeePerGas: '2000000000',
        maxFeePerGas: '12000000000',
      };
      jest.spyOn(service, 'getGasPrice').mockResolvedValue(mockGasPrice);

      const result = await controller.getGasPrice();

      expect(result).toEqual(mockGasPrice);
      expect(service.getGasPrice).toHaveBeenCalled();
    });

    it('should handle GasPriceFetchException and return appropriate error', async () => {
      jest.spyOn(service, 'getGasPrice').mockRejectedValue(new GasPriceFetchException('Error fetching gas price'));

      try {
        await controller.getGasPrice();
      } catch (error) {
        expect(error).toBeInstanceOf(GasPriceFetchException);
        expect(service.getGasPrice).toHaveBeenCalled();
      }
    });
  });
});
