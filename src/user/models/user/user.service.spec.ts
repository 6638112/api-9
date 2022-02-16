import { Test, TestingModule } from '@nestjs/testing';
import { createMock } from '@golevelup/ts-jest';
import { CountryService } from 'src/shared/models/country/country.service';
import { FiatService } from 'src/shared/models/fiat/fiat.service';
import { LanguageService } from 'src/shared/models/language/language.service';
import { UserDataService } from '../user-data/user-data.service';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';
import { KycService } from 'src/user/services/kyc/kyc.service';

describe('UserService', () => {
  let service: UserService;

  let userRepo: UserRepository;
  let userDataService: UserDataService;
  let countryService: CountryService;
  let languageService: LanguageService;
  let fiatService: FiatService;
  let kycService: KycService;

  beforeEach(async () => {
    userRepo = createMock<UserRepository>();
    userDataService = createMock<UserDataService>();
    countryService = createMock<CountryService>();
    languageService = createMock<LanguageService>();
    fiatService = createMock<FiatService>();
    kycService = createMock<KycService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: userRepo },
        { provide: UserDataService, useValue: userDataService },
        { provide: CountryService, useValue: countryService },
        { provide: LanguageService, useValue: languageService },
        { provide: FiatService, useValue: fiatService },
        { provide: KycService, useValue: kycService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
