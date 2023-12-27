import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  BaseEntity,
} from 'typeorm'
import Review from './Review'

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

  @OneToMany(() => Review, (review) => review.campground)
    reviews!: Review[]
}
