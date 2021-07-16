import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Fiat } from './fiat.entity';
import { CreateFiatDto } from 'src/fiat/dto/create-fiat.dto';
import { GetFiatDto } from "./dto/get-fiat.dto";
import { UpdateFiatDto } from "./dto/update-fiat.dto";
import { FiatRepository } from 'src/fiat/fiat.repository';

@Injectable()
export class FiatService {
  constructor(private fiatRepository: FiatRepository) {}
  
  async createFiat(createFiatDto: CreateFiatDto): Promise<any>{
    return this.fiatRepository.createFiat(createFiatDto);
  }

  async getAllFiat(): Promise<any> {
    return this.fiatRepository.getAllFiat();
  }

  async updateFiat(fiat: UpdateFiatDto): Promise<any> {
    return this.fiatRepository.updateFiat(fiat);
  }

  async getFiat(key:any): Promise<any> {
    return this.fiatRepository.getFiat(key);
  }
}
