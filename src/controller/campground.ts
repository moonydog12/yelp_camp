import { Request, Response } from 'express'
import connection from '../db'
import Campground from '../models/Campground'

interface ICampground {
  [key: string]: any
  id: string
  title: string
  price: number
  description: string
  location: string
  image: string
  author: {
    id: string
    email: string
    username: string
  }
}

export class CampgroundController {
  private repository = connection.getRepository(Campground)

  getAllCampgrounds = async (req: Request, res: Response) => {
    const allCampgrounds = await this.repository.find()
    res.render('campgrounds/index', { campgrounds: allCampgrounds })
  }

  static renderNewForm(req: Request, res: Response) {
    res.render('campgrounds/new')
  }

  createCampground = async (req: Request, res: Response) => {
    const campground = { ...req.body.campground }
    campground.author = req.user?.id
    await this.repository.save(campground)
    req.flash('success', 'Successfully made a new campground')
    res.redirect(`/campgrounds/${campground.id}`)
  }

  showCampground = async (req: Request, res: Response) => {
    const { id } = req.params
    const campground = await this.repository
      .createQueryBuilder('campground')
      .leftJoinAndSelect('campground.reviews', 'reviews')
      .leftJoinAndSelect('campground.author', 'author')
      .leftJoinAndSelect('reviews.authorId', 'user')
      .where('campground.id = :id', { id })
      .getOne()

    if (campground === null) {
      throw new Error('Can not find the data')
    }

    res.render('campgrounds/show', { campground })
  }

  renderEditForm = async (req: Request, res: Response) => {
    const { id } = req.params
    const campground = await this.repository.findOneBy({ id })
    if (campground === null) {
      req.flash('error', 'Cannot find that campground!')
      return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground })
  }

  updateCampground = async (req: Request, res: Response) => {
    const { campground } = req.body
    const { id } = req.params
    const campgroundUpdate: ICampground | null = await this.repository
      .createQueryBuilder('campground')
      .leftJoinAndSelect('campground.author', 'author')
      .where('campground.id = :id', { id })
      .getOne()

    if (campgroundUpdate === null) {
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
    campgroundUpdate.id = id
    await this.repository.save(campgroundUpdate)
    req.flash('success', 'Successfully updated campground')
    res.redirect(`/campgrounds/${id}`)
  }

  deleteCampground = async (req: Request, res: Response) => {
    const { id } = req.params
    const campgroundToRemove = await this.repository.findOneBy({ id })

    if (campgroundToRemove === null) {
      throw new Error('Can not find the data')
    }

    await this.repository.remove(campgroundToRemove)
    req.flash('success', 'Delete campground')
    res.redirect('/campgrounds')
  }
}

const campgroundController = new CampgroundController()

export default campgroundController
