import {
  Entity, Column, PrimaryGeneratedColumn, ManyToOne,
} from 'typeorm'
import Campground from './Campground'

@Entity()
export default class Image {
  @PrimaryGeneratedColumn('increment')
    id!: string

  @Column()
    filename!: string

  @Column()
    url!: string

  @ManyToOne(() => Campground, (campground) => campground.images)
    campground!: Campground
}
