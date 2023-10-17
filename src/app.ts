// Global dependencies
import express from 'express';
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

app.get('/', (_req, res) => {
  res.render('home');
});

app.get('/campgrounds', async (_req, res) => {
  const allCampgrounds = await campgroundRepository.find();
  res.render('campgrounds/index', { campgrounds: allCampgrounds });
});

app.get('/campgrounds/new', (_req, res) => {
  res.render('campgrounds/new');
});

app.post('/campgrounds/new', async (req, res) => {
  const id = uuidv4();
  const campground = { ...req.body, id };
  const createdCampground = await campgroundRepository.save(campground);
  res.redirect(`/campgrounds/${createdCampground.id}`);
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
      return res.send('fail');
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
      return res.send('fail');
    }
    await campgroundRepository.remove(campgroundToRemove);
    res.send('success');
  } catch (error) {
    console.log(error);
  }
});

export default app;
