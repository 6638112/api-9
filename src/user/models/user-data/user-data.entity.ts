import { Country } from 'src/shared/models/country/country.entity';
import { IEntity } from 'src/shared/models/entity';
import { Language } from 'src/shared/models/language/language.entity';
import { BankData } from 'src/user/models/bank-data/bank-data.entity';
import { User } from 'src/user/models/user/user.entity';
import { Entity, Column, OneToMany, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
import { SpiderData } from '../spider-data/spider-data.entity';

export enum AccountType {
  PERSONAL = 'Personal',
  BUSINESS = 'Business',
  SOLE_PROPRIETORSHIP = 'SoleProprietorship',
}

export enum KycStatus {
  NA = 'NA',
  CHATBOT = 'Chatbot',
  ONLINE_ID = 'OnlineId',
  VIDEO_ID = 'VideoId',
  MANUAL = 'Manual',
  COMPLETED = 'Completed',
}

export enum KycState {
  NA = 'NA',
  FAILED = 'Failed',
  REMINDED = 'Reminded',
}

export enum RiskState {
  A = 'a',
  B = 'b',
  C = 'c',
}

@Entity()
export class UserData extends IEntity {
  // TODO: remove
  @Column({ default: true })
  isMigrated: boolean;

  @Column({ default: AccountType.PERSONAL, length: 256 })
  accountType: AccountType;

  @Column({ length: 256, nullable: true })
  mail: string;

  @Column({ length: 256, nullable: true })
  firstname: string;

  @Column({ length: 256, nullable: true })
  surname: string;

  @Column({ length: 256, nullable: true })
  street: string;

  @Column({ length: 256, nullable: true })
  houseNumber: string;

  @Column({ length: 256, nullable: true })
  location: string;

  @Column({ length: 256, nullable: true })
  zip: string;

  @ManyToOne(() => Country, { eager: true })
  country: Country;

  @Column({ length: 256, nullable: true })
  organizationName: string;

  @Column({ length: 256, nullable: true })
  organizationStreet: string;

  @Column({ length: 256, nullable: true })
  organizationHouseNumber: string;

  @Column({ length: 256, nullable: true })
  organizationLocation: string;

  @Column({ length: 256, nullable: true })
  organizationZip: string;

  @ManyToOne(() => Country, { eager: true })
  organizationCountry: Country;

  @Column({ length: 256, nullable: true })
  phone: string;

  @ManyToOne(() => Language, { eager: true })
  language: Language;

  @Column({ length: 256, nullable: true })
  riskState: RiskState;

  @Column({ length: 256, default: KycStatus.NA })
  kycStatus: KycStatus;

  @Column({ length: 256, default: KycState.NA })
  kycState: KycState;

  @Column({ type: 'datetime2', nullable: true })
  kycStatusChangeDate: Date;

  @Column({ type: 'integer', nullable: true })
  kycFileId: number;

  @Column({ type: 'integer', nullable: true })
  kycCustomerId: number;

  @Column({ length: 256, nullable: true })
  kycHash: string;

  @Column({ type: 'float', default: 90000 })
  depositLimit: number;

  @Column({ type: 'integer', nullable: true })
  contribution: number;

  @Column({ length: 256, nullable: true })
  plannedContribution: string;

  @OneToMany(() => BankData, (bankData) => bankData.userData)
  bankDatas: BankData[];

  @OneToOne(() => BankData, { nullable: true })
  @JoinColumn()
  mainBankData: BankData;

  @OneToMany(() => User, (user) => user.userData)
  users: User[];

  @OneToOne(() => SpiderData, (c) => c.userData, { nullable: true })
  spiderData: SpiderData;
}

export const KycInProgressStates = [KycStatus.CHATBOT, KycStatus.ONLINE_ID, KycStatus.VIDEO_ID];
export const KycCompletedStates = [KycStatus.MANUAL, KycStatus.COMPLETED];

export function KycInProgress(kycStatus?: KycStatus): boolean {
  return KycInProgressStates.includes(kycStatus);
}

export function KycCompleted(kycStatus?: KycStatus): boolean {
  return KycCompletedStates.includes(kycStatus);
}