import { IsNotEmpty, IsEthereumAddress, IsNumberString } from 'class-validator';

export class ExchangeCalculationParams {
  @IsEthereumAddress()
  @IsNotEmpty()
  fromTokenAddress: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  toTokenAddress: string;

  @IsNumberString()
  @IsNotEmpty()
  amountIn: string;
}
