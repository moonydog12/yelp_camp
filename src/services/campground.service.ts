import { NextFunction, Request, Response } from 'express'
import mapboxGeocoding from '@mapbox/mapbox-sdk/services/geocoding'
import { cloudinaryConfig } from '../configs/cloudinaryConfigs'
import connection from '../configs/db'
import Campground from '../models/Campground'
import Image from '../models/Image'
import { campgroundSchema } from '../models/schemas'
import ExpressError from '../utils/ExpressError'

const campgroundRepository = connection.getRepository(Campground)
const imageRepository = connection.getRepository(Image)
const mapboxToken = process.env.MAPBOX_TOKEN
const geocoder = mapboxGeocoding({
  accessToken: mapboxToken!,
})

interface File {
  fieldname: string
  originalname: string
  encoding: string
  mimetype: string
  path: string
  size: number
  filename: string
}

export default class CampgroundService {
  static saveFiles(array: File[], id: Campground) {
    array.forEach(async (file: File) => {
      const fileToStore = {
        url: file.path,
        filename: file.filename,
        campground: id,
      }
      await imageRepository.save(fileToStore)
    })
  }

  static deleteImages(images: string[]) {
    images.forEach(async (image: string) => {
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

    if (!campground) {
      throw new Error('Can not find the data')
    }

    if (campground.author.id !== req.user.id) {
      req.flash('error', 'You do not have permission to do that')
      return res.redirect(`/campgrounds/${id}`)
    }

    next()
  }

  static async get() {
    const campgrounds = await campgroundRepository
      .createQueryBuilder('campground')
      .leftJoinAndSelect('campground.images', 'images')
      .getMany()
    return campgrounds
  }

  static async create(data: any) {
    const { files, campground, author } = data
    const geoData = await geocoder
      .forwardGeocode({ query: campground.location, limit: 1 })
      .send()
    const [longitude, latitude] = geoData.body.features[0].geometry.coordinates
    const filesArray = JSON.parse(JSON.stringify(files))
    const campgroundToStore = { ...campground }
    campgroundToStore.author = author
    campgroundToStore.geometry = {
      type: geoData.body.features[0].geometry.type,
      coordinates: [longitude, latitude],
    }
    const newCampground = await campgroundRepository.save(campgroundToStore)
    this.saveFiles(filesArray, newCampground.id)

    return newCampground
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

    if (!campground) {
      throw new Error('Can not find the data')
    }

    return campground
  }

  static async update(data: any) {
    const { updatedData, campground, id, filesArray, images } = data
    const campgroundProperties = Object.keys(campground)
    campgroundProperties.forEach((prop) => {
      campground[prop] = updatedData[prop]
    })
    campground.id = parseInt(id, 10)
    this.saveFiles(filesArray, campground.id)

    if (images) {
      this.deleteImages(images)
    }

    await campgroundRepository.save(campground)

    return campground
  }

  static async delete(data: any) {
    const images = data.images.map((image: File) => image.filename)
    if (images) {
      this.deleteImages(images)
    }

    await campgroundRepository.remove(data)
  }
}
