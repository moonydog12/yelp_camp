import { DataSource } from 'typeorm'
import { Campground } from './seeds/Campground'
import dotenv from 'dotenv'

dotenv.config()

const db = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: process.env.DB_PASSWORD,
  database: 'Yelp-Camp',
  synchronize: true,
  logging: false,
  entities: [Campground],
})

export default db
