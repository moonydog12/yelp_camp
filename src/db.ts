import { DataSource } from 'typeorm'
import dotenv from 'dotenv'
import { Campground } from './models/Campground'
import { Review } from './models/Review'
import { User } from './models/User'

dotenv.config()

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT || '5432'),
  username: process.env.PG_USERNAME,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  entities: [Campground, Review, User],
  synchronize: true, // ! remove in prod
})

const connectToDB = async () => {
  try {
    await dataSource.initialize()
  } catch (error: any) {
    console.log(`Unable to connect to PostgreSQL (${error.message}) `)
  }
}

export { connectToDB, dataSource }
