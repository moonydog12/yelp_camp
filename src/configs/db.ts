import { DataSource } from 'typeorm'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

const connection = new DataSource({
  type: 'postgres',
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT || '5432', 10),
  username: process.env.PG_USERNAME,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  entities: [path.join(__dirname, '../models/*.js')],
  synchronize: true,
  logging: false,
})

export default connection
