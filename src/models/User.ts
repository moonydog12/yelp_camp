import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export default class User {
  @PrimaryGeneratedColumn('uuid')
    id!: string

  @Column()
    username!: string

  @Column({ nullable: false, unique: true })
    email!: string

  @Column()
    password!: string
}
