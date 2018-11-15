'use strict';
const express = require('express');
const router = express.Router();

const data = require('../db/notes');
const simDB = require('../db/simDB');  // <<== add this
const notes = simDB.initialize(data); // <<== and this




router.get('/', (req, res, next) => {
  const { searchTerm } = req.query;
  notes.filter(searchTerm, (err, list) => {
    if (err) {
      return next(err); // goes to error handler
    }
    res.json(list); // responds with filtered array
  });
});
  
router.get('/:id', (req, res, next) => {
  const {id} = req.params; 
  notes.find(id, (err, list) => {
    if (err) {
      return next(err); // goes to error handler
    }
    res.json(list); // responds with filtered array
  });
});


router.post('/', (req, res, next) => {

  const { title, content } = req.body;
  
  const newItem = { title, content };
  /***** Never trust users - validate input *****/
  if (!newItem.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  
  notes.create(newItem, (err, item) => {
    if (err) {
      return next(err);
    }
    if (item) {
      res.location(`http://${req.headers.host}/notes/${item.id}`).status(201).json(item);
    } else {
      next();
    }
  });
});


router.delete('/:id', (req, res, next) => {
  const {id} = req.params;
  notes.delete(id, (err, item) => {
    if (err) {
      console.error(err);
    }
    if (item) {
      console.log(`Deleted note \`${req.params.ID}\``);
      res.status(204).end();
    }
  });
});
  
  
  
//     const {id} = req.params;
    
//   notes.delete(id, (err, item) => {
//     if (err) {
//       console.error(err);
//     }
//     if (item) {
//       console.log(item);
//     } else {
//       console.log('not found');
//     }
// //     next();
//   });
// });


// router.delete('/:id', (req, res) => {
//     Recipes.delete(req.params.id);
//     console.log(`Deleted shopping list item \`${req.params.ID}\``);
//     res.status(204).end();
//   });


router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  
  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateFields = ['title', 'content'];
  
  updateFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

 
  
  notes.update(id, updateObj, (err, item) => {
    if (err) {
      return next(err);
    }
    if (item) {
      console.log(req.body);
      console.log(updateObj);
      res.json(item);
    } else {
      next();
    }
  });
});
  


router.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  res.status(404).json({ message: 'Not Found' });
});


router.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
  });
});

module.exports = router;