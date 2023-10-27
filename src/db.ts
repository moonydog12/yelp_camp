import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { Campground } from './seeds/Campground';

dotenv.config();

const database = new DataSource({
  type: 'postgres',
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT || '5432'),
  username: process.env.PG_USERNAME,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  entities: [Campground],
  synchronize: true, // ! remove in prod
});

const connectToDB = async () => {
  try {
    await database.initialize();
    console.log('Connected to PostgreSQL');
  } catch (error) {
    console.log(`Unable to connect to PostgreSQL (${error.message}) `);
  }
};

export { connectToDB, database };
