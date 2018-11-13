'use strict';

// Load array of notes

console.log('Hello Noteful!');

const express = require('express');
const data = require('./db/notes');
const {PORT} = require('./config');
const {logger} = require('./middleware/logger');

const app = express();

app.use(express.static('public'));
app.use(logger);

app.get('/api/notes', (req, res) => {
  const searchTerm = req.query.searchTerm;
  if (searchTerm) {
    let listFiltered = data.filter(function (item) {
      return item.title.includes(searchTerm);
    });
    res.json(listFiltered);
  }else {
    res.json(data);
  }
});
//to check runtime errors
// app.get('/boom', (req, res, next) => {
//   throw new Error('Boom!!');
// });

app.get('/api/notes/:id', (req, res) => {
  const id = req.params.id; 

  res.json(data.find(item => item.id === Number(id)));
});

app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  res.status(404).json({ message: 'Not Found' });
});
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});

app.listen(PORT, function () {
  console.info(`Server listening on ${this.address().port}`);
}).on('error', err => {
  console.error(err);
});