import { Entity, PrimaryGeneratedColumn, Column, PrimaryColumn } from 'typeorm';
import * as typeorm from 'typeorm';

@Entity({
  name: 'countries'
})
export class Country {
  @PrimaryColumn({ type: 'varchar', unique: true, length: 4 })
  symbol: string;

  @Column({ type: 'varchar', length: 34 })
  name: string;

  @Column({ type: 'tinyint',  default: 1 })
  enable: boolean;
}