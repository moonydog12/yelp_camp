import express from 'express';
import morgan from 'morgan';

const app = express();

app.use((req, res, next) => {
  console.log(req.method.toUpperCase(), req.path);
  req.requestTime = Date.now();
  next();
});

app.get('/', (req, res) => {
  res.send('Hello World');
  console.log(`request time: ${Date.now() - req.requestTime}`);
});

app.get('/dogs', (req, res) => {
  console.log(`request time: ${Date.now() - req.requestTime}`);
  res.send('Woof');
});

app.use((req, res) => {
  res.status(404).send('Not found');
});

app.listen(8000, () => {
  console.log('App is running on localhost:8000');
});
