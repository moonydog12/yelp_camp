// Global dependencies
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { json } from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import ejsMate from 'ejs-mate';

import { Campground } from './seeds/Campground';
import db from './db';

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

app.post('/campgrounds', async (req, res, next) => {
  try {
    const id = uuidv4();
    const campground = { ...req.body, id };
    const createdCampground = await campgroundRepository.save(campground);
    res.status(200).send({ createdCampground });
  } catch (error) {
    next(error);
  }
});

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

    // Redirect to the updated campground's page
    res.send('success');
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
});

app.delete('/campgrounds/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const campgroundToRemove = await campgroundRepository.findOneBy({ id });
    if (!campgroundToRemove) {
      throw new Error('找不到該筆資料');
    }
    await campgroundRepository.remove(campgroundToRemove);
    res.send('success');
  } catch (error) {
    console.log(error);
  }
});

app.use(
  (err: ErrorConstructor, req: Request, res: Response, next: NextFunction) => {
    res.send('Oh boy something went wrong');
  },
);

export default app;
