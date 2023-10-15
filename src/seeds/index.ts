import 'reflect-metadata'
import { Campground } from './Campground'
import { v4 as uuidv4 } from 'uuid'
import { descriptors, places } from './seedHelpers'
import cities from './cities'
import db from '../db'

function sample(array: String[]) {
  return array[Math.floor(Math.random() * array.length)]
}

async function cleanDB() {
  // Get the repository for your entity
  const campgroundRepository = db.getRepository(Campground)
  console.log(campgroundRepository)

  // Delete all records from the 'Campground' table
  await campgroundRepository
    .createQueryBuilder()
    .delete()
    .from(Campground)
    .where({})
    .execute()
}

async function seedDB() {
  for (let i = 0; i < 25; ++i) {
    const random1000 = Math.floor(Math.random() * 1000)
    const campground = new Campground()
    campground.id = uuidv4()
    campground.location = `${cities[random1000].city}, ${cities[random1000].state}`
    campground.title = `${sample(descriptors)} ${sample(places)}`
    campground.image = 'https://random.imagecdn.app/1920/1080'
    campground.description =
      'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Praesentium, placeat provident .'
    campground.price = Math.floor(Math.random() * 20) + 10
    console.log(campground)
    await db.manager.save(campground)
  }
}

db.initialize()
  .then(() => {
    console.log('成功連線')
    // cleanDB()
    seedDB()
  })
  .catch((error) => console.log(error))
