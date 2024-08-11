import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeController } from './exchange.controller';
import { ExchangeService } from './exchange.service';
import { ExchangeCalculationParams } from './dto/exchange-calculation-params.dto';
import { ExchangeCalculationOutput } from './dto/exchange-calculation-output.dto';
import { InsufficientInputAmountException, InsufficientLiquidityException, PairReserveFetchException } from '../../errors';

describe('ExchangeController', () => {
  let controller: ExchangeController;
  let service: ExchangeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExchangeController],
      providers: [
        {
          provide: ExchangeService,
          useValue: {
            calculateExchangeOutput: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ExchangeController>(ExchangeController);
    service = module.get<ExchangeService>(ExchangeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getExchangeOutput', () => {
    const params: ExchangeCalculationParams = {
      fromTokenAddress: '0x0000000000000000000000000000000000000001',
      toTokenAddress: '0x0000000000000000000000000000000000000002',
      amountIn: '1000000000000000000',
    };

    it('should return the expected output amount', async () => {
      const expectedOutput: ExchangeCalculationOutput = { amountOut: '199003187643838186655' };

      jest.spyOn(service, 'calculateExchangeOutput').mockResolvedValue(expectedOutput);

      const result = await controller.getExchangeOutput(params);

      expect(result).toEqual(expectedOutput);
      expect(service.calculateExchangeOutput).toHaveBeenCalledWith(
        params.fromTokenAddress,
        params.toTokenAddress,
        params.amountIn,
      );
    });

    it('should throw InsufficientInputAmountException if input amount is invalid', async () => {
      jest.spyOn(service, 'calculateExchangeOutput').mockRejectedValue(new InsufficientInputAmountException());

      await expect(controller.getExchangeOutput(params)).rejects.toThrow(InsufficientInputAmountException);
    });

    it('should throw InsufficientLiquidityException if liquidity is insufficient', async () => {
      jest.spyOn(service, 'calculateExchangeOutput').mockRejectedValue(new InsufficientLiquidityException());

      await expect(controller.getExchangeOutput(params)).rejects.toThrow(InsufficientLiquidityException);
    });

    it('should throw PairReserveFetchException if there is an error fetching reserves', async () => {
      jest.spyOn(service, 'calculateExchangeOutput').mockRejectedValue(new PairReserveFetchException());

      await expect(controller.getExchangeOutput(params)).rejects.toThrow(PairReserveFetchException);
    });
  });
});
