import { Injectable } from '@nestjs/common';
import { NotificationService } from 'src/subdomains/supporting/notification/services/notification.service';
import { Asset } from 'src/shared/models/asset/asset.entity';
import { AssetService } from 'src/shared/models/asset/asset.service';
import { Util } from 'src/shared/utils/util';
import { PayoutOrder, PayoutOrderContext } from '../../../entities/payout-order.entity';
import { FeeResult } from '../../../interfaces';
import { PayoutOrderRepository } from '../../../repositories/payout-order.repository';
import { PayoutGroup } from '../../../services/base/payout-jellyfish.service';
import { PayoutBitcoinService } from '../../../services/payout-bitcoin.service';
import { JellyfishStrategy } from './base/jellyfish.strategy';
import { DfxLogger } from 'src/shared/services/dfx-logger';

@Injectable()
export class BitcoinStrategy extends JellyfishStrategy {
  protected readonly logger = new DfxLogger(BitcoinStrategy);

  private readonly averageTransactionSize = 180; // vBytes

  constructor(
    notificationService: NotificationService,
    protected readonly bitcoinService: PayoutBitcoinService,
    protected readonly payoutOrderRepo: PayoutOrderRepository,
    protected readonly assetService: AssetService,
  ) {
    super(notificationService, payoutOrderRepo, bitcoinService);
  }

  async estimateFee(): Promise<FeeResult> {
    const feeRate = await this.bitcoinService.getCurrentFastestFeeRate();
    const satoshiFeeAmount = this.averageTransactionSize * feeRate;
    const btcFeeAmount = Util.round(satoshiFeeAmount / 100000000, 8);

    return { asset: await this.feeAsset(), amount: btcFeeAmount };
  }

  protected async doPayoutForContext(context: PayoutOrderContext, orders: PayoutOrder[]): Promise<void> {
    const payoutGroups = this.createPayoutGroups(orders, 100);

    for (const group of payoutGroups) {
      try {
        if (group.length === 0) {
          continue;
        }

        this.logger.verbose(`Paying out ${group.length} BTC orders(s). Order ID(s): ${group.map((o) => o.id)}`);

        await this.sendBTC(context, group);
      } catch (e) {
        this.logger.error(
          `Error in paying out a group of ${group.length} BTC orders(s). Order ID(s): ${group.map((o) => o.id)}`,
          e,
        );
        // continue with next group in case payout failed
        continue;
      }
    }
  }

  protected dispatchPayout(context: PayoutOrderContext, payout: PayoutGroup): Promise<string> {
    return this.bitcoinService.sendUtxoToMany(context, payout);
  }

  protected getFeeAsset(): Promise<Asset> {
    return this.assetService.getBtcCoin();
  }

  private async sendBTC(context: PayoutOrderContext, orders: PayoutOrder[]): Promise<void> {
    await this.send(context, orders, 'BTC');
  }
}
