import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards';
import { CurrentUserId } from '../auth/decorators/auth.decorators';

class FundWalletDto {
  amount: number;
  reference: string;
}

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get('balance')
  async getBalance(@CurrentUserId() userId: string) {
    const balance = await this.walletService.getBalance(userId);
    const availableBalance = await this.walletService.getAvailableBalance(userId);
    const wallet = await this.walletService.getWallet(userId);

    return {
      balance: balance.toString(),
      availableBalance: availableBalance.toString(),
      lockedBalance: wallet.lockedBalance.toString(),
    };
  }

  @Post('fund')
  @HttpCode(HttpStatus.CREATED)
  async fundWallet(
    @CurrentUserId() userId: string,
    @Body() dto: FundWalletDto,
  ) {
    // In MVP, we stub Paystack integration
    const amountInSmallestUnit = BigInt(Math.floor(dto.amount * 100));
    
    return await this.walletService.fundWallet(
      userId,
      amountInSmallestUnit,
      dto.reference,
    );
  }

  @Get('history')
  async getTransactionHistory(@CurrentUserId() userId: string) {
    return await this.walletService.getTransactionHistory(userId);
  }
}
