import {
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { CreateBuyDto } from './dto/create-buy.dto';
import { Buy } from './buy.entity';
import { sha256 } from 'js-sha256';
import { UpdateBuyDto } from './dto/update-buy.dto';
import { AssetRepository } from 'src/asset/asset.repository';
import { getManager } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

@EntityRepository(Buy)
export class BuyRepository extends Repository<Buy> {
  async createBuy(createBuyDto: CreateBuyDto): Promise<any> {
    if (createBuyDto.id) delete createBuyDto['id'];

    const assetObject = await getManager()
    .getCustomRepository(AssetRepository)
    .getAsset(createBuyDto.asset);

    var hash = sha256.create();
    hash.update(createBuyDto.address + assetObject.name + createBuyDto.iban);
    createBuyDto.bankUsage =
      hash.toString().toUpperCase().slice(0, 4) +
      '-' +
      hash.toString().toUpperCase().slice(4, 8) +
      '-' +
      hash.toString().toUpperCase().slice(8, 12);

    createBuyDto.asset = assetObject.id;

    const buy = this.create(createBuyDto);

    try {
      if (buy) {
        await this.save(buy);
        buy.asset = assetObject;
        delete buy['address'];
        return buy;
      }
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException();
    }
  }

  async updateBuy(updateBuyDto: UpdateBuyDto): Promise<any> {
    try {
      const buy = await this.findOne(updateBuyDto.id);

      if (buy) {
        if (buy.address != updateBuyDto.address)
          throw new ForbiddenException(
            'You can only change your own sell route',
          );
        buy.active = updateBuyDto.active;
        await this.save(buy);
        delete buy['address'];
        buy.asset = await getManager()
          .getCustomRepository(AssetRepository)
          .getAsset(buy.asset);
        return buy;
      }
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async getAssetByBankUsage(bankUsage: string): Promise<any> {
    try {
      const buy = await this.findOne({ "bankUsage": bankUsage });
      if (buy) return buy.asset;
      
      throw new NotFoundException('No matching buy route for given bankUsage found');
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }

  }

  async getBuy(id: any, address: string): Promise<any> {
    try {
      const buy = await this.findOne({ id: id.id });
      if (buy) {
        if (buy.address != address)
          throw new ForbiddenException('You can only get your own sell route');

        delete buy['address'];
        buy.asset = await getManager()
          .getCustomRepository(AssetRepository)
          .getAsset(buy.asset);
      }

      return buy;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async getAllBuy(address: string): Promise<any> {
    try {
      const buy = await this.find({ address: address });

      if (buy) {

        for(let a = 0; a < buy.length; a++){

          buy[a].asset = await getManager()
          .getCustomRepository(AssetRepository)
          .getAsset(buy[a].asset);

          delete buy[a]['address'];

        }
      }

      return buy;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }

  async getBuyCount(): Promise<any> {
    try {
      const buy = await this.find();

      return { buyCount: buy.length };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException();
    }
  }
}