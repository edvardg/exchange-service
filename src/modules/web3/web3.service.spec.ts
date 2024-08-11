import { Test, TestingModule } from '@nestjs/testing';
import { ethers } from 'ethers';
import { Web3Service } from './web3.service';
import { ConfigService } from '../../config/config.service';

jest.mock('ethers');

describe('Web3Service', () => {
  let service: Web3Service;
  let configService: ConfigService;
  let providerMock: jest.Mocked<ethers.JsonRpcProvider>;

  beforeEach(async () => {
    providerMock = {
      getBlock: jest.fn(),
      getFeeData: jest.fn(),
    } as unknown as jest.Mocked<ethers.JsonRpcProvider>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Web3Service,
        {
          provide: ConfigService,
          useValue: {
            web3: {
              rpcUrl: 'https://test-rpc-url',
              factoryV2Address: '0xFactoryAddress',
              pairV2InitCodeHash: '0xPairInitCodeHash',
            },
          },
        },
      ],
    }).compile();

    configService = module.get<ConfigService>(ConfigService);
    service = new Web3Service(configService);
    (service as any).provider = providerMock;
  });

  describe('getBaseFeePerGas', () => {
    it('should return the baseFeePerGas from the pending block', async () => {
      const baseFeePerGasMock = BigInt(1000000000);
      const blockMock = {
        baseFeePerGas: baseFeePerGasMock,
      } as unknown as ethers.Block;

      providerMock.getBlock.mockResolvedValue(blockMock);

      const result = await service.getBaseFeePerGas();

      expect(providerMock.getBlock).toHaveBeenCalledWith('pending');
      expect(result).toBe(baseFeePerGasMock);
    });

    it('should return 0n if baseFeePerGas is undefined', async () => {
      const blockMock = {
        baseFeePerGas: undefined,
      } as unknown as ethers.Block;

      providerMock.getBlock.mockResolvedValue(blockMock);

      const result = await service.getBaseFeePerGas();

      expect(result).toBe(0n);
    });
  });

  describe('getFeeData', () => {
    it('should return the correct fee data', async () => {
      const feeDataMock = {
        gasPrice: BigInt(1000000000),
        maxPriorityFeePerGas: BigInt(2000000000),
        maxFeePerGas: BigInt(3000000000),
      } as ethers.FeeData;

      providerMock.getFeeData.mockResolvedValue(feeDataMock);

      const result = await service.getFeeData();

      expect(providerMock.getFeeData).toHaveBeenCalled();
      expect(result).toEqual({
        gasPrice: feeDataMock.gasPrice,
        maxPriorityFeePerGas: feeDataMock.maxPriorityFeePerGas,
        maxFeePerGas: feeDataMock.maxFeePerGas,
      });
    });
  });

  describe('getReserves', () => {
    it('should return the reserves of the pair contract', async () => {
      const pairAddress = '0xPairAddress';
      const reserveMock = { reserveA: BigInt(500000), reserveB: BigInt(1000000) };
      const getReservesMock = jest.fn().mockResolvedValue([reserveMock.reserveA, reserveMock.reserveB]);
      ethers.Contract = jest.fn().mockReturnValue({
        getReserves: getReservesMock,
      });

      const result = await service.getReserves(pairAddress);

      expect(ethers.Contract).toHaveBeenCalledWith(pairAddress, expect.any(Array), providerMock);
      expect(result).toEqual(reserveMock);
    });
  });

  describe('getPairAddress', () => {
    it('should return the correct pair address using create2', () => {
      const tokenA = '0xTokenA';
      const tokenB = '0xTokenB';
      const saltMock = '0xSalt';
      const pairAddressMock = '0xPairAddress';

      jest.spyOn(ethers, 'keccak256').mockReturnValue(saltMock);
      jest.spyOn(ethers, 'solidityPacked').mockReturnValue('0xEncoded');
      jest.spyOn(ethers, 'getCreate2Address').mockReturnValue(pairAddressMock);

      const result = service.getPairAddress(tokenA, tokenB);

      expect(ethers.keccak256).toHaveBeenCalledWith('0xEncoded');
      expect(ethers.getCreate2Address).toHaveBeenCalledWith(
        configService.web3.factoryV2Address,
        saltMock,
        configService.web3.pairV2InitCodeHash,
      );
      expect(result).toBe(pairAddressMock);
    });
  });
});
