import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  BaseEntity,
  JoinColumn,
} from 'typeorm'
import Campground from './Campground'
import User from './User'

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

  @Column()
  @ManyToOne(() => User, (user) => user.id)
    authorId!: string
}
