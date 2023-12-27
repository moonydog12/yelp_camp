import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  BaseEntity,
} from 'typeorm'
import Campground from './Campground'

@Entity()
export default class Review extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
    id!: string

  @Column()
    body!: string

  @Column()
    rating!: number

  @ManyToOne(() => Campground, (campground) => campground.reviews, {
    onDelete: 'CASCADE',
  })
    campground!: Campground
}
