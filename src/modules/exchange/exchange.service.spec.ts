import { Test, TestingModule } from '@nestjs/testing';
import { ExchangeService } from './exchange.service';
import { Web3Service } from '../web3/web3.service';
import {
  InsufficientInputAmountException,
  InsufficientLiquidityException,
  PairReserveFetchException,
} from '../../errors';

describe('ExchangeService', () => {
  let service: ExchangeService;
  let web3Service: Web3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeService,
        {
          provide: Web3Service,
          useValue: {
            getPairAddress: jest.fn(),
            getReserves: jest.fn(),
            getDecimals: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ExchangeService>(ExchangeService);
    web3Service = module.get<Web3Service>(Web3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateExchangeOutput', () => {
    const fromTokenAddress = '0x0000000000000000000000000000000000000001';
    const toTokenAddress = '0x0000000000000000000000000000000000000002';
    const amountIn = '1000000000000000000';

    it('should return the expected output amount', async () => {
      const pairAddress = '0x0000000000000000000000000000000000000003';
      const reserveA = BigInt('500000000000000000000');
      const reserveB = BigInt('100000000000000000000000');
      const expectedAmountOut = '199003187643838186655';

      jest.spyOn(web3Service, 'getPairAddress').mockReturnValue(pairAddress);
      jest.spyOn(web3Service, 'getReserves').mockResolvedValue({ reserveA, reserveB });

      const result = await service.calculateExchangeOutput(fromTokenAddress, toTokenAddress, amountIn);

      expect(result).toEqual({ amountOut: expectedAmountOut });
    });

    it('should throw InsufficientInputAmountException if amountIn is zero or less', async () => {
      const invalidAmountIn = '0';

      await expect(
        service.calculateExchangeOutput(fromTokenAddress, toTokenAddress, invalidAmountIn),
      ).rejects.toThrow(InsufficientInputAmountException);
    });

    it('should throw InsufficientLiquidityException if reserves are insufficient', async () => {
      const pairAddress = '0x0000000000000000000000000000000000000003';
      jest.spyOn(web3Service, 'getPairAddress').mockReturnValue(pairAddress);
      jest.spyOn(web3Service, 'getReserves').mockResolvedValue({ reserveA: BigInt(0), reserveB: BigInt(20000) });

      await expect(service.calculateExchangeOutput(fromTokenAddress, toTokenAddress, amountIn)).rejects.toThrow(
        InsufficientLiquidityException,
      );
    });

    it('should throw PairReserveFetchException if there is an error fetching reserves', async () => {
      const pairAddress = '0x0000000000000000000000000000000000000003';
      jest.spyOn(web3Service, 'getPairAddress').mockReturnValue(pairAddress);
      jest.spyOn(web3Service, 'getReserves').mockRejectedValue(new Error('Fetch error'));

      await expect(service.calculateExchangeOutput(fromTokenAddress, toTokenAddress, amountIn)).rejects.toThrow(
        PairReserveFetchException,
      );
    });
  });
});
