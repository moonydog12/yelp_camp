import { Request, Response } from 'express'
import connection from '../db'
import Campground from '../models/Campground'
import Image from '../models/Image'
import { cloudinaryConfig } from '../cloudinary'

interface ICampground {
  [key: string]: any
}

export class CampgroundController {
  private campgroundRepository = connection.getRepository(Campground)

  private imageRepository = connection.getRepository(Image)

  saveFiles(array: any, id: any) {
    array.forEach(async (file: any) => {
      const fileToStore = {
        url: file.path,
        filename: file.filename,
        campground: id,
      }
      await this.imageRepository.save(fileToStore)
    })
  }

  getAllCampgrounds = async (req: Request, res: Response) => {
    const campgrounds = await this.campgroundRepository
      .createQueryBuilder('campground')
      .leftJoinAndSelect('campground.images', 'images')
      .getMany()
    res.render('campgrounds/index', { campgrounds })
  }

  static renderNewForm(req: Request, res: Response) {
    res.render('campgrounds/new')
  }

  createCampground = async (req: Request, res: Response) => {
    const filesArray = JSON.parse(JSON.stringify(req.files))
    const campground = { ...req.body.campground }
    campground.author = req.user?.id
    const storedCampground = await this.campgroundRepository.save(campground)
    this.saveFiles(filesArray, storedCampground.id)
    req.flash('success', 'Successfully made a new campground')
    res.redirect(`/campgrounds/${campground.id}`)
  }

  showCampground = async (req: Request, res: Response) => {
    const { id } = req.params
    const campground = await this.campgroundRepository
      .createQueryBuilder('campground')
      .leftJoinAndSelect('campground.reviews', 'reviews')
      .leftJoinAndSelect('campground.author', 'author')
      .leftJoinAndSelect('campground.images', 'images')
      .leftJoinAndSelect('reviews.author', 'user')
      .where('campground.id = :id', { id })
      .getOne()

    if (campground === null) {
      throw new Error('Can not find the data')
    }

    res.render('campgrounds/show', { campground })
  }

  renderEditForm = async (req: Request, res: Response) => {
    const campground = await this.campgroundRepository
      .createQueryBuilder('campground')
      .leftJoinAndSelect('campground.images', 'images')
      .where('campground.id = :id', { id: req.params.id })
      .getOne()
    if (!campground) {
      req.flash('error', 'Cannot find that campground!')
      return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
  }

  updateCampground = async (req: Request, res: Response) => {
    const { campground } = req.body
    const { id } = req.params
    const filesArray = JSON.parse(JSON.stringify(req.files))
    const campgroundUpdate: ICampground | null = await this.campgroundRepository
      .createQueryBuilder('campground')
      .leftJoinAndSelect('campground.author', 'authorId')
      .where('campground.id = :id', { id })
      .getOne()

    if (!campgroundUpdate) {
      throw new Error('Can not find the campground to update')
    }

    if (campgroundUpdate.author.id !== req.user?.id) {
      req.flash('error', 'You do not have permission to do that')
      return res.redirect(`/campgrounds/${id}`)
    }

    const campgroundProperties = Object.keys(campgroundUpdate)
    campgroundProperties.forEach((prop) => {
      campgroundUpdate[prop] = campground[prop]
    })
    campgroundUpdate.id = parseInt(id, 10)
    this.saveFiles(filesArray, campgroundUpdate.id)
    await this.campgroundRepository.save(campgroundUpdate)

    if (req.body.deleteImages.length > 0) {
      req.body.deleteImages.forEach(async (image: string) => {
        const imageToDelete = await this.imageRepository.findOneBy({
          filename: image,
        })
        if (!imageToDelete) {
          throw new Error('Can not find the image to delete')
        }
        await this.imageRepository.remove(imageToDelete)
        await cloudinaryConfig.uploader.destroy(image)
      })
    }
    req.flash('success', 'Successfully updated campground')
    res.redirect(`/campgrounds/${id}`)
  }

  deleteCampground = async (req: Request, res: Response) => {
    const campgroundToRemove = await this.campgroundRepository.findOneBy({
      id: parseInt(req.params.id, 10),
    })

    if (!campgroundToRemove) {
      throw new Error('Can not find the data')
    }

    await this.campgroundRepository.remove(campgroundToRemove)
    req.flash('success', 'Delete campground')
    res.redirect('/campgrounds')
  }
}

const campgroundController = new CampgroundController()

export default campgroundController
