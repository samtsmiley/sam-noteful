'use strict';

// Load array of notes

console.log('Hello Noteful!');

const express = require('express');

// const data = require('./db/notes');
// const simDB = require('./db/simDB');  // <<== add this
// const notes = simDB.initialize(data); // <<== and this
// const {logger} = require('./middleware/logger');

const {PORT} = require('./config');
const morgan = require('morgan');
const app = express();
const notesRouter = require('./router/notes.router');

app.use(morgan('dev'));
app.use(express.static('public'));
app.use(express.json());


app.use('/api/notes', notesRouter);

// if (require.main === module) {
//   app.startServer(PORT).catch(err => {
//     if (err.code === 'EADDRINUSE') {
//       const stars = '*'.repeat(80);
//       console.error(`${stars}\nEADDRINUSE (Error Address In Use). Please stop other web servers using port ${PORT}\n${stars}`);
//     }
//     console.error(err);
//   });
// }

if (require.main === module) {
  app.listen(process.env.PORT || PORT, function () {
    console.info(`Server listening on ${this.address().port}`);
  }).on('error', err => {
    console.error(err);
  });
}
module.exports = app; // Export for testing