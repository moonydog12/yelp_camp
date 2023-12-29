import { Request, Response } from 'express'

import { dataSource } from '../db'
import Campground from '../models/Campground'

const campgroundRepository = dataSource.getRepository(Campground)

export async function getAllCampgrounds(req: Request, res: Response) {
  const allCampgrounds = await campgroundRepository.find()
  res.render('campgrounds/index', { campgrounds: allCampgrounds })
}

export function renderNewForm(req: Request, res: Response) {
  res.render('campgrounds/new')
}

export async function createCampground(req: Request, res: Response) {
  const campground = { ...req.body.campground }
  campground.author = req.user?.id
  await campgroundRepository.save(campground)
  req.flash('success', 'Successfully made a new campground')
  res.redirect(`/campgrounds/${campground.id}`)
}

export async function showCampground(req: Request, res: Response) {
  const { id } = req.params
  const campground = await campgroundRepository
    .createQueryBuilder('campground')
    .leftJoinAndSelect('campground.reviews', 'reviews')
    .leftJoinAndSelect('campground.author', 'author')
    .leftJoinAndSelect('reviews.authorId', 'user')
    .where('campground.id = :id', { id })
    .getOne()

  if (!campground) {
    throw new Error('找不到該筆資料')
  }

  res.render('campgrounds/show', { campground })
}

export async function renderEditForm(req: Request, res: Response) {
  const { id } = req.params
  const campground = await campgroundRepository.findOneBy({ id })
  if (!campground) {
    req.flash('error', 'Cannot find that campground!')
    return res.redirect('/campgrounds')
  }
  res.render('campgrounds/edit', { campground })
}

export async function updateCampground(req: Request, res: Response) {
  const { campground } = req.body
  const { id } = req.params
  const campgroundUpdate = await campgroundRepository
    .createQueryBuilder('campground')
    .leftJoinAndSelect('campground.author', 'author')
    .where('campground.id = :id', { id })
    .getOne()

  if (!campgroundUpdate) {
    throw new Error('找不到該筆資料')
  }

  if (campgroundUpdate.author.id !== req.user?.id) {
    req.flash('error', 'You do not have permission to do that')
    return res.redirect(`/campgrounds/${id}`)
  }

  const campgroundProperties = Object.keys(campgroundUpdate)
  for (let i = 0; i < campgroundProperties.length; i += 1) {
    const prop = campgroundProperties[i]
    ;(campgroundUpdate as any)[`${prop}`] = campground[`${prop}`]
  }
  ;(campgroundUpdate as any).id = id
  await campgroundRepository.save(campgroundUpdate)
  req.flash('success', 'Successfully updated campground')
  res.redirect(`/campgrounds/${id}`)
}

export async function deleteCampground(req: Request, res: Response) {
  const { id } = req.params
  const campgroundToRemove = await campgroundRepository.findOneBy({ id })

  if (!campgroundToRemove) {
    throw new Error('找不到該筆資料')
  }

  await campgroundRepository.remove(campgroundToRemove)
  req.flash('success', 'Delete campground')
  res.redirect('/campgrounds')
}
