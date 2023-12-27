import {
  Entity, Column, PrimaryGeneratedColumn, BaseEntity,
} from 'typeorm'

@Entity()
export default class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
    id!: string

  @Column()
    username!: string

  @Column({ nullable: false, unique: true })
    email!: string

  @Column()
    password!: string
}
