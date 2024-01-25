import { Request, Response } from 'express'
import connection from '../db'
import Campground from '../models/Campground'
import Image from '../models/Image'

interface ICampground {
  [key: string]: any
}

export class CampgroundController {
  private campgroundRepository = connection.getRepository(Campground)

  private imageRepository = connection.getRepository(Image)

  getAllCampgrounds = async (req: Request, res: Response) => {
    const allCampgrounds = await this.campgroundRepository.find()
    res.render('campgrounds/index', { campgrounds: allCampgrounds })
  }

  static renderNewForm(req: Request, res: Response) {
    res.render('campgrounds/new')
  }

  createCampground = async (req: Request, res: Response) => {
    const filesArray = JSON.parse(JSON.stringify(req.files))
    const campground = { ...req.body.campground }
    campground.author = req.user?.id
    const storedCampground = await this.campgroundRepository.save(campground)
    filesArray.map(async (file: any) => {
      const fileToStore = {
        url: file.path,
        filename: file.filename,
        campground: storedCampground.id,
      }
      this.imageRepository.save(fileToStore)
    })
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
    const campground = await this.campgroundRepository.findOneBy({
      id: parseInt(req.params.id, 10),
    })
    if (!campground) {
      req.flash('error', 'Cannot find that campground!')
      return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
  }

  updateCampground = async (req: Request, res: Response) => {
    const { campground } = req.body
    const { id } = req.params
    const campgroundUpdate: ICampground | null = await this.campgroundRepository
      .createQueryBuilder('campground')
      .leftJoinAndSelect('campground.author', 'authorId')
      .where('campground.id = :id', { id })
      .getOne()

    if (!campgroundUpdate) {
      throw new Error('Can not find the data')
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
    await this.campgroundRepository.save(campgroundUpdate)
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
