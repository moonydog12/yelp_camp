import { Request } from 'express'
import connection from '../db'
import Campground from '../models/Campground'
import Image from '../models/Image'

const campgroundRepository = connection.getRepository(Campground)
const imageRepository = connection.getRepository(Image)

export default class CampgroundService {
  static saveFiles(array: any, id: any) {
    array.forEach(async (file: any) => {
      const fileToStore = {
        url: file.path,
        filename: file.filename,
        campground: id,
      }
      await imageRepository.save(fileToStore)
    })
  }

  static async getAll() {
    const campgrounds = await campgroundRepository
      .createQueryBuilder('campground')
      .leftJoinAndSelect('campground.images', 'images')
      .getMany()

    return campgrounds
  }

  static async create(author: any, campground: any, files: any) {
    const filesArray = JSON.parse(JSON.stringify(files))
    const campgroundToStore = { ...campground }
    campgroundToStore.author = author
    const storedCampground = await campgroundRepository.save(campgroundToStore)
    this.saveFiles(filesArray, storedCampground.id)
    return storedCampground
  }
}
