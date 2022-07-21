import { Body, Controller, Get, Post, Query, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetJwt } from 'src/shared/auth/get-jwt.decorator';
import { JwtPayload } from 'src/shared/auth/jwt-payload.interface';
import { RoleGuard } from 'src/shared/auth/role.guard';
import { UserRole } from 'src/shared/auth/user-role.enum';
import { KycDocument } from 'src/user/services/spider/dto/spider.dto';
import { LimitRequestDto } from '../limit-request/dto/limit-request.dto';
import { LimitRequestService } from '../limit-request/limit-request.service';
import { KycUserDataDto } from '../kyc/dto/kyc-user-data.dto';
import { KycInfo, KycService } from './kyc.service';

@ApiTags('kyc')
@Controller('kyc')
export class KycController {
  constructor(private readonly kycService: KycService, private readonly limitRequestService: LimitRequestService) {}

  @Get()
  async getKycProgress(@Query('code') code: string): Promise<KycInfo> {
    return await this.kycService.getKycStatus(code);
  }

  @Post()
  async requestKyc(@Query('code') code: string): Promise<string> {
    return await this.kycService.requestKyc(code).then(JSON.stringify);
  }

  @Post('data')
  async updateKycData(@Query('code') code: string, @Body() data: KycUserDataDto): Promise<boolean> {
    await this.kycService.updateKycData(code, data);
    return true;
  }

  @Post('limit')
  async increaseLimit(@Query('code') code: string, @Body() request: LimitRequestDto): Promise<void> {
    return await this.limitRequestService.increaseLimit(code, request);
  }

  @Post('incorporationCertificate')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadIncorporationCertificate(
    @Query('code') code: string,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<boolean> {
    return this.kycService.uploadDocument(code, files[0], KycDocument.INCORPORATION_CERTIFICATE);
  }
}
