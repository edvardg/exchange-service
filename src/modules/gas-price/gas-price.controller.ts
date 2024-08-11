import { Controller, Get } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
  refs,
} from '@nestjs/swagger';
import { GasPriceService } from './gas-price.service';
import { Eip1559GasPrice, GasPrice, LegacyGasPrice } from './dto/gas-price.dto';

@ApiTags('Gas Price')
@Controller('gasPrice')
export class GasPriceController {
  constructor(private readonly gasPriceService: GasPriceService) {}

  @Get()
  @ApiOperation({ summary: 'Get gas price depending on transaction type' })
  @ApiExtraModels(Eip1559GasPrice, LegacyGasPrice)
  @ApiOkResponse({
    description: 'Gas price details based on the transaction type',
    schema: {
      oneOf: refs(Eip1559GasPrice, LegacyGasPrice),
    },
  })
  @ApiServiceUnavailableResponse({
    description: 'Service is unavailable or failed to fetch gas price',
  })
  async getGasPrice(): Promise<GasPrice> {
    return this.gasPriceService.getGasPrice();
  }
}
