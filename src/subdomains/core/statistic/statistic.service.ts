import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Config, Process } from 'src/config/config';
import { SellService } from 'src/subdomains/core/sell-crypto/route/sell.service';
import { SettingService } from 'src/shared/models/setting/setting.service';
import { Util } from 'src/shared/utils/util';
import { UserService } from 'src/subdomains/generic/user/models/user/user.service';
import { BuyService } from '../buy-crypto/routes/buy/buy.service';
import { SettingStatus, StatisticDto } from './dto/statistic.dto';
import { Lock } from 'src/shared/utils/lock';

@Injectable()
export class StatisticService implements OnModuleInit {
  private statistic: StatisticDto;

  constructor(
    private buyService: BuyService,
    private sellService: SellService,
    private settingService: SettingService,
    private userService: UserService,
  ) {}

  onModuleInit() {
    void this.doUpdate();
  }

  @Cron(CronExpression.EVERY_HOUR)
  @Lock(7200)
  async doUpdate(): Promise<void> {
    if (Config.processDisabled(Process.UPDATE_STATISTIC)) return;

    this.statistic = {
      totalVolume: {
        buy: Util.round(await this.buyService.getTotalVolume(), Config.defaultVolumeDecimal),
        sell: Util.round(await this.sellService.getTotalVolume(), Config.defaultVolumeDecimal),
      },
      totalRewards: {
        staking: 1211040.03,
        ref: Util.round(await this.userService.getTotalRefRewards(), Config.defaultVolumeDecimal),
      },
      status: await this.getStatus(),
    };
  }

  async getStatus(): Promise<SettingStatus> {
    const settings = await this.settingService.getAll();
    return settings
      .filter((s) => s.key.endsWith('Status'))
      .reduce((prev, curr) => ({ ...prev, [curr.key.replace('Status', '')]: curr.value }), {});
  }

  getAll(): StatisticDto {
    return this.statistic;
  }
}
