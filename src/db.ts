import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { Campground } from './seeds/Campground';

dotenv.config();

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
});

export default db;
