import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  VirtualColumn,
} from 'typeorm'
import Campground from './Campground'

@Entity()
export default class Image {
  @PrimaryGeneratedColumn()
    id!: number

  @Column()
    filename!: string

  @Column()
    url!: string

  @VirtualColumn({
    query: (entity: any) => `SELECT REPLACE(${entity}.url,'/upload','/upload/w_200')`,
  })
    thumbnail!: string

  @ManyToOne(() => Campground, (campground) => campground.images, {
    onDelete: 'CASCADE',
  })
    campground!: Campground
}
