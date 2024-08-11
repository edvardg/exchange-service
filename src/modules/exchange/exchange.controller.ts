import { Controller, Get, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ExchangeService } from './exchange.service';
import { ExchangeCalculationParams } from './dto/exchange-calculation-params.dto';
import { ExchangeCalculationOutput } from './dto/exchange-calculation-output.dto';

@ApiTags('Exchange')
@Controller('return')
export class ExchangeController {
  constructor(private readonly exchangeService: ExchangeService) {}

  @Get(':fromTokenAddress/:toTokenAddress/:amountIn')
  @ApiOperation({ summary: 'Get estimated output amount for a token swap' })
  @ApiParam({ name: 'fromTokenAddress', description: 'The address of the source token (ERC-20)' })
  @ApiParam({ name: 'toTokenAddress', description: 'The address of the destination token (ERC-20)' })
  @ApiParam({ name: 'amountIn', description: 'The exact input amount in the smallest unit of the source token' })
  @ApiOkResponse({
    type: ExchangeCalculationOutput,
    description: 'The estimated output amount in the smallest unit of the destination token',
  })
  @ApiBadRequestResponse({ description: 'Insufficient input amount or liquidity' })
  @ApiServiceUnavailableResponse({ description: 'Service is unavailable or failed to fetch pair reserves' })
  async getExchangeOutput(@Param() params: ExchangeCalculationParams): Promise<ExchangeCalculationOutput> {
    return this.exchangeService.calculateExchangeOutput(
      params.fromTokenAddress,
      params.toTokenAddress,
      params.amountIn,
    );
  }
}
