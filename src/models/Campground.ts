import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  BaseEntity,
  ManyToOne,
} from 'typeorm'
import Review from './Review'
import User from './User'

@Entity()
export default class Campground extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
    id!: string

  @Column({ length: 100 })
    title!: string

  @Column()
    price!: number

  @Column()
    description!: string

  @Column()
    location!: string

  @Column()
    image!: string

  @ManyToOne(() => User, (user) => user.id)
    author!: User

  @OneToMany(() => Review, (review) => review.campground)
    reviews!: Review[]
}
