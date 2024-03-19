import { NextFunction, Request, Response } from 'express'
import { cloudinaryConfig } from '../cloudinary'
import connection from '../db'
import Campground from '../models/Campground'
import Image from '../models/Image'
import { campgroundSchema } from '../models/schemas'
import ExpressError from '../utils/ExpressError'

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

  static validateCampground(req: Request, res: Response, next: NextFunction) {
    const { error } = campgroundSchema.validate(req.body)
    if (error) {
      const errorMessages = error.details.map((el) => el.message).join(',')
      throw new ExpressError(errorMessages, 400)
    }
    next()
  }

  static async isAuthor(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params
    const campground = await campgroundRepository
      .createQueryBuilder('campground')
      .leftJoin('campground.author', 'author')
      .addSelect(['author.id'])
      .where('campground.id = :id', { id })
      .getOne()

    if (campground?.author.id !== req.user?.id) {
      req.flash('error', 'You do not have permission to do that')
      return res.redirect(`/campgrounds/${id}`)
    }

    next()
  }

  static async getAll() {
    const campgrounds = await campgroundRepository
      .createQueryBuilder('campground')
      .leftJoinAndSelect('campground.images', 'images')
      .getMany()

    return campgrounds
  }

  static async create(data: any) {
    const { files, campground, author } = data
    const filesArray = JSON.parse(JSON.stringify(files))
    const campgroundToStore = { ...campground }
    campgroundToStore.author = author
    const storedCampground = await campgroundRepository.save(campgroundToStore)
    this.saveFiles(filesArray, storedCampground.id)

    return storedCampground
  }

  static async getOne(id: string) {
    const campground = await campgroundRepository
      .createQueryBuilder('campground')
      .leftJoinAndSelect('campground.reviews', 'reviews')
      .leftJoinAndSelect('campground.author', 'author')
      .leftJoinAndSelect('campground.images', 'images')
      .leftJoinAndSelect('reviews.author', 'user')
      .where('campground.id = :id', { id })
      .getOne()

    return campground
  }

  static async getEdit(id: string) {
    const campground = campgroundRepository
      .createQueryBuilder('campground')
      .leftJoinAndSelect('campground.images', 'images')
      .where('campground.id = :id', { id })
      .getOne()

    return campground
  }

  static async update(data: any) {
    const { updatedData, campground, id, filesArray, deleteImages } = data
    const campgroundProperties = Object.keys(campground)
    campgroundProperties.forEach((prop) => {
      campground[prop] = updatedData[prop]
    })
    campground.id = parseInt(id, 10)
    this.saveFiles(filesArray, campground.id)

    if (deleteImages) {
      deleteImages.forEach(async (image: string) => {
        const imageToDelete = await imageRepository.findOneBy({
          filename: image,
        })
        if (!imageToDelete) {
          throw new Error('Can not find the image to delete')
        }
        await imageRepository.remove(imageToDelete)
        await cloudinaryConfig.uploader.destroy(image)
      })
    }

    await campgroundRepository.save(campground)

    return campground
  }

  static async delete(data: any) {
    campgroundRepository.remove(data)
  }
}
