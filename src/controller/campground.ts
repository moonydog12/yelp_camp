import { Request, Response } from 'express'
import CampgroundService from '../services/campground.service'

export default class CampgroundController {
  static async get(req: Request, res: Response) {
    const campgrounds = await CampgroundService.get()
    res.render('campgrounds/index', { campgrounds })
  }

  static renderNew(req: Request, res: Response) {
    res.render('campgrounds/new')
  }

  static async create(req: Request, res: Response) {
    const data = {
      author: req.user.id,
      files: req.files,
      campground: req.body.campground,
    }
    const campground = await CampgroundService.create(data)
    req.flash('success', 'Successfully made a new campground')
    res.redirect(`/campgrounds/${campground.id}`)
  }

  static async show(req: Request, res: Response) {
    const { id } = req.params
    const campground = await CampgroundService.getOne(id)

    res.render('campgrounds/show', { campground })
  }

  static async renderEdit(req: Request, res: Response) {
    const { id } = req.params
    const campground = await CampgroundService.getOne(id)

    res.render('campgrounds/edit', { campground })
  }

  static async update(req: Request, res: Response) {
    const { campground: updatedData } = req.body
    const { id } = req.params
    const filesArray = JSON.parse(JSON.stringify(req.files))
    const campground = await CampgroundService.getOne(id)

    if (campground.author.id !== req.user.id) {
      req.flash('error', 'You do not have permission to do that')
      return res.redirect(`/campgrounds/${id}`)
    }
    const data = {
      updatedData,
      filesArray,
      campground,
      id,
      deleteImages: req.body.deleteImages,
    }

    const updatedCampground = await CampgroundService.update(data)

    req.flash('success', 'Successfully updated campground')
    res.redirect(`/campgrounds/${updatedCampground.id}`)
  }

  static async delete(req: Request, res: Response) {
    const { id } = req.params
    const campground = await CampgroundService.getOne(id)
    await CampgroundService.delete(campground)
    req.flash('success', 'Delete campground')
    res.redirect('/campgrounds')
  }
}
