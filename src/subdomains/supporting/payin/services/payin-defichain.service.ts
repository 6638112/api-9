import { Lock } from 'src/shared/utils/lock';
import { AccountHistory } from '@defichain/jellyfish-api-core/dist/category/account';
import { InWalletTransaction, UTXO } from '@defichain/jellyfish-api-core/dist/category/wallet';
import { Injectable } from '@nestjs/common';
import { Config } from 'src/config/config';
import { DeFiClient } from 'src/integration/blockchain/ain/node/defi-client';
import { NodeService, NodeType } from 'src/integration/blockchain/ain/node/node.service';
import { Blockchain } from 'src/integration/blockchain/shared/enums/blockchain.enum';
import { AssetCategory, AssetType } from 'src/shared/models/asset/asset.entity';
import { AssetService } from 'src/shared/models/asset/asset.service';
import { CryptoInput } from '../entities/crypto-input.entity';
import { PayInRepository } from '../repositories/payin.repository';
import { Interval } from '@nestjs/schedule';
import { PayInJellyfishService } from './base/payin-jellyfish.service';

export interface HistoryAmount {
  amount: number;
  asset: string;
  type: AssetType;
}

@Injectable()
export class PayInDeFiChainService extends PayInJellyfishService {
  private client: DeFiClient;

  private readonly utxoTxTypes = ['receive', 'blockReward'];
  private readonly tokenTxTypes = [
    'AccountToAccount',
    'AnyAccountsToAccounts',
    'WithdrawFromVault',
    'PoolSwap',
    'RemovePoolLiquidity',
    'ProposalFeeRedistribution',
  ];

  constructor(
    private readonly assetService: AssetService,
    protected readonly payInRepo: PayInRepository,
    nodeService: NodeService,
  ) {
    super();
    nodeService.getConnectedNode(NodeType.INPUT).subscribe((client) => (this.client = client));
  }

  async checkHealthOrThrow(): Promise<void> {
    await this.client.checkSync();
  }

  async getCurrentHeight(): Promise<number> {
    const { blocks: currentHeight } = await this.client.checkSync();

    return currentHeight;
  }

  async getNewTransactionsHistorySince(lastHeight: number): Promise<AccountHistory[]> {
    const { blocks: currentHeight } = await this.client.checkSync();

    return this.client
      .getHistory(lastHeight + 1, currentHeight)
      .then((i) => i.filter((h) => [...this.utxoTxTypes, ...this.tokenTxTypes].includes(h.type)))
      .then((i) => i.filter((h) => h.blockHeight > lastHeight))
      .then((i) => i.filter((h) => h.owner != Config.blockchain.default.utxoSpenderAddress));
  }

  async getTx(outTxId: string): Promise<InWalletTransaction> {
    return this.client.getTx(outTxId);
  }

  async sendUtxo(input: CryptoInput): Promise<{ outTxId: string; feeAmount: number }> {
    return this.client.sendCompleteUtxo(input.address.address, input.destinationAddress.address, input.amount);
  }

  async sendToken(input: CryptoInput, onSent: (outTxId: string) => Promise<void>): Promise<void> {
    await this.doTokenTx(input.address.address, async (utxo) => {
      const outTxId = await this.client.sendToken(
        input.address.address,
        input.destinationAddress.address,
        input.asset.dexName,
        input.amount,
        [utxo],
      );

      await onSent(outTxId);

      return outTxId;
    });
  }

  async sendTokenSync(input: CryptoInput, utxo: UTXO): Promise<string> {
    return this.client.sendToken(
      input.address.address,
      input.destinationAddress.address,
      input.asset.dexName,
      input.amount,
      [utxo],
    );
  }

  @Interval(900000)
  @Lock(7200)
  async convertTokens(): Promise<void> {
    await this.client.checkSync();

    const tokens = await this.client.getToken();

    for (const token of tokens) {
      try {
        const { amount, asset } = this.client.parseAmount(token.amount);
        const assetEntity = await this.assetService.getAssetByQuery({
          dexName: asset,
          blockchain: Blockchain.DEFICHAIN,
          type: AssetType.TOKEN,
        });

        if (assetEntity?.category === AssetCategory.POOL_PAIR) {
          console.log('Removing pool liquidity:', token);

          // remove pool liquidity
          await this.doTokenTx(token.owner, (utxo) =>
            this.client.removePoolLiquidity(token.owner, token.amount, [utxo]),
          );

          // send UTXO (for second token)
          const additionalFeeUtxo = await this.getFeeUtxo(token.owner);
          if (!additionalFeeUtxo) {
            await this.sendFeeUtxo(token.owner);
          }
        } else {
          // ignoring dust DFI transactions
          if (asset === 'DFI' && amount < Config.blockchain.default.minTxAmount) {
            continue;
          }

          // check for min. deposit
          const usdtAmount = await this.client.testCompositeSwap(asset, 'USDT', amount);
          if (usdtAmount < Config.blockchain.default.minDeposit.DeFiChain.USDT) {
            console.log('Retrieving small token:', token);

            await this.doTokenTx(token.owner, async (utxo) =>
              this.client.sendToken(token.owner, Config.blockchain.default.dexWalletAddress, asset, amount, [utxo]),
            );
          }
        }
      } catch (e) {
        console.error(`Failed to convert token (${token.amount} on ${token.owner}):`, e);
      }
    }
  }

  async getFeeUtxo(address: string): Promise<UTXO | undefined> {
    return this.client
      .getUtxo()
      .then((utxos) =>
        utxos.find(
          (u) =>
            u.address === address &&
            u.amount.toNumber() < Config.blockchain.default.minDeposit.DeFiChain.DFI &&
            u.amount.toNumber() > Config.blockchain.default.minDeposit.DeFiChain.DFI / 4,
        ),
      );
  }

  async getFeeUtxoByTransaction(addressFrom: string, utxoTx: string): Promise<UTXO | undefined> {
    return this.client.getUtxo().then((utxos) => utxos.find((u) => u.txid === utxoTx && u.address === addressFrom));
  }

  async sendFeeUtxo(address: string, fee = Config.blockchain.default.minDeposit.DeFiChain.DFI / 2): Promise<string> {
    return this.client.sendUtxo(Config.blockchain.default.utxoSpenderAddress, address, fee);
  }

  //*** HELPER METHODS ***//

  private async doTokenTx(addressFrom: string, tx: (utxo: UTXO) => Promise<string>): Promise<void> {
    const feeUtxo = await this.getFeeUtxo(addressFrom);
    feeUtxo ? await this.tokenTx(addressFrom, tx, feeUtxo) : void this.tokenTx(addressFrom, tx); // no waiting;
  }

  private async tokenTx(addressFrom: string, tx: (utxo: UTXO) => Promise<string>, feeUtxo?: UTXO): Promise<void> {
    try {
      // get UTXO
      if (!feeUtxo) {
        const utxoTx = await this.sendFeeUtxo(addressFrom);
        await this.client.waitForTx(utxoTx);
        feeUtxo = await this.getFeeUtxoByTransaction(addressFrom, utxoTx);
      }

      // do TX
      await tx(feeUtxo);
    } catch (e) {
      console.error('Failed to do token TX:', e);
    }
  }

  getAmounts(history: AccountHistory): HistoryAmount[] {
    const amounts = this.utxoTxTypes.includes(history.type)
      ? history.amounts.map((a) => this.parseAmount(a, AssetType.COIN))
      : history.amounts.map((a) => this.parseAmount(a, AssetType.TOKEN)).filter((a) => a.amount > 0);

    return amounts.map((a) => ({ ...a, amount: Math.abs(a.amount) }));
  }

  private parseAmount(amount: string, type: AssetType): HistoryAmount {
    return { ...this.client.parseAmount(amount), type };
  }
}