import { Entity, Column, PrimaryColumn } from 'typeorm'

@Entity()
export class Campground {
  @PrimaryColumn()
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
}
