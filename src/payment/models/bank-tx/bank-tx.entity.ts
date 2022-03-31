import { IEntity } from 'src/shared/models/entity';
import { Entity, Column, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { CryptoBuy } from '../crypto-buy/crypto-buy.entity';
import { CryptoSell } from '../crypto-sell/crypto-sell.entity';
import { BankTxBatch } from './bank-tx-batch.entity';

export enum BankTxType {
  INTERNAL = 'Internal',
  RETURN = 'Return',
  REPEAT = 'Repeat',
  CRYPTO_BUY = 'CryptoBuy',
  CRYPTO_SELL = 'CryptoSell',
  UNKNOWN = 'Unknown',
}

@Entity()
export class BankTx extends IEntity {
  @Column({ length: 256, unique: true })
  accountServiceRef: string;

  @Column({ type: 'datetime2', nullable: true })
  bookingDate?: Date;

  @Column({ type: 'datetime2', nullable: true })
  valueDate?: Date;

  @Column({ type: 'integer', nullable: true })
  txCount?: number;

  @Column({ length: 256, nullable: true })
  endToEndId?: string;

  @Column({ length: 256, nullable: true })
  instructionId?: string;

  @Column({ length: 256, nullable: true })
  txId?: string;

  // amounts
  @Column({ type: 'float', nullable: true })
  amount?: number;

  @Column({ length: 256, nullable: true })
  currency?: string;

  @Column({ length: 256, nullable: true })
  creditDebitIndicator?: string;

  @Column({ type: 'float', nullable: true })
  instructedAmount?: number;

  @Column({ length: 256, nullable: true })
  instructedCurrency?: string;

  @Column({ type: 'float', nullable: true })
  txAmount?: number;

  @Column({ length: 256, nullable: true })
  txCurrency?: string;

  @Column({ length: 256, nullable: true })
  exchangeSourceCurrency?: string;

  @Column({ length: 256, nullable: true })
  exchangeTargetCurrency?: string;

  @Column({ type: 'float', nullable: true })
  exchangeRate?: number;

  @Column({ type: 'float', nullable: true })
  chargeAmount: number;

  @Column({ length: 256, nullable: true })
  chargeCurrency: string;

  // related party info
  @Column({ length: 256, nullable: true })
  name?: string;

  @Column({ length: 256, nullable: true })
  ultimateName?: string;

  @Column({ length: 256, nullable: true })
  addressLine1?: string;

  @Column({ length: 256, nullable: true })
  addressLine2?: string;

  @Column({ length: 256, nullable: true })
  country?: string;

  @Column({ length: 256, nullable: true })
  iban?: string;

  // related bank info
  @Column({ length: 256, nullable: true })
  bic?: string;

  @Column({ length: 256, nullable: true })
  clearingSystemId?: string;

  @Column({ length: 256, nullable: true })
  memberId?: string;

  @Column({ length: 256, nullable: true })
  bankName?: string;

  @Column({ length: 256, nullable: true })
  bankAddressLine1?: string;

  @Column({ length: 256, nullable: true })
  bankAddressLine2?: string;

  @Column({ length: 256, nullable: true })
  remittanceInfo?: string;

  @Column({ length: 256, nullable: true })
  txInfo?: string;

  @OneToOne(() => BankTx, (bankTx) => bankTx.returnBankTx, { nullable: true })
  returnSourceBankTx?: BankTx;

  @OneToOne(() => BankTx, (bankTx) => bankTx.returnSourceBankTx, { nullable: true })
  @JoinColumn()
  returnBankTx?: BankTx;

  @OneToOne(() => BankTx, (bankTx) => bankTx.previousRepeatBankTx, { nullable: true })
  @JoinColumn()
  nextRepeatBankTx?: BankTx;

  @OneToOne(() => BankTx, (bankTx) => bankTx.nextRepeatBankTx, { nullable: true })
  previousRepeatBankTx?: BankTx;

  @ManyToOne(() => BankTxBatch, (batch) => batch.transactions, { nullable: false })
  batch: BankTxBatch;

  @OneToOne(() => CryptoSell, (sell) => sell.bankTx, { nullable: true })
  cryptoSell?: CryptoSell;

  @OneToOne(() => CryptoBuy, (buy) => buy.bankTx, { nullable: true })
  cryptoBuy?: CryptoBuy;
}
