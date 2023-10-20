// Global dependencies
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { json } from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import ejsMate from 'ejs-mate';

import { Campground } from './seeds/Campground';
import db from './db';
import catchAsync from './utils/catchAsync';
import ExpressError from './utils/ExpressError';

// 連接 DB
try {
  db.initialize();
} catch (error) {
  console.log(error);
}

const campgroundRepository = db.getRepository(Campground);
const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(json());

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/campgrounds', async (req, res) => {
  const allCampgrounds = await campgroundRepository.find();
  res.render('campgrounds/index', { campgrounds: allCampgrounds });
});

app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new');
});

app.post(
  '/campgrounds',
  catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = uuidv4();
    const campground = { ...req.body, id };
    const newCampground = await campgroundRepository.save(campground);
    res.send({ newCampground });
  }),
);

app.get('/campgrounds/:id', async (req, res) => {
  const { id } = req.params;
  const campground = await campgroundRepository.findOneBy({ id });
  res.render('campgrounds/show', { campground });
});

app.get('/campgrounds/:id/edit', async (req, res) => {
  const campground = await campgroundRepository.findOneBy({
    id: req.params.id,
  });
  res.render('campgrounds/edit', { campground });
});

app.put('/campgrounds/:id', async (req, res) => {
  const { location, title, description, image, price } = req.body;
  const { id } = req.params;
  try {
    const campgroundUpdate = await campgroundRepository.findOneBy({ id });

    if (!campgroundUpdate) {
      throw new Error('找不到該筆資料');
    }

    campgroundUpdate.title = title;
    campgroundUpdate.location = location;
    campgroundUpdate.description = description;
    campgroundUpdate.image = image;
    campgroundUpdate.price = price;

    await campgroundRepository.save(campgroundUpdate);

    res.send('success');
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

app.delete('/campgrounds/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const campgroundToRemove = await campgroundRepository.findOneBy({ id });
    if (!campgroundToRemove) {
      throw new Error('找不到該筆資料');
    }
    await campgroundRepository.remove(campgroundToRemove);
    res.send({ campgroundToRemove });
  } catch (error) {
    next(error);
  }
});

app.all('*', (req, res, next) => {
  next(new ExpressError('Page not Found', 400));
});

app.use((err, req: Request, res: Response, next: NextFunction) => {
  const { statusCode = 500, message = 'test' } = err;
  res.status(statusCode).send(message);
});

export default app;
