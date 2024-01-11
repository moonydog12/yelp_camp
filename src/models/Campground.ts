import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm'
import Review from './Review'
import User from './User'
import Image from './Image'

@Entity()
export default class Campground {
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

  @ManyToOne(() => User, (user) => user.id)
    author!: User

  @OneToMany(() => Review, (review) => review.campground)
    reviews!: Review[]

  @OneToMany(() => Image, (image) => image.campground)
    images!: Image[]
}
