import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export default class User {
  @PrimaryGeneratedColumn()
    id!: string

  @Column()
    username!: string

  @Column({ nullable: false, unique: true })
    email!: string

  @Column()
    password!: string
}
