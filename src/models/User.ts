import { Entity, Column, PrimaryGeneratedColumn, BaseEntity } from 'typeorm'

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  username!: string

  @Column({ nullable: false, unique: true })
  email!: string

  @Column()
  password!: string
}
