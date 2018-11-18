'use strict';
const express = require('express');
const router = express.Router();

const data = require('../db/notes');
const simDB = require('../db/simDB');  // <<== add this
const notes = simDB.initialize(data); // <<== and this




router.get('/', (req, res, next) => {
  const { searchTerm } = req.query;
  notes.filter(searchTerm) 
    .then(item => {
      if(item){
        res.json(item);
      }else{
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

  
router.get('/:id', (req, res, next) => {
  const {id} = req.params; 
  notes.find(id)
    .then (item => {
      if (item) {
        res.json(item);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
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
  notes.create(newItem)  
    .then(item => {
      if (item){
        res.location(`http://${req.headers.host}/api/notes/${item.id}`).status(201).json(item);
      }else{
        next();
      }    
    })
    .catch(err => {
      next(err);
    });
});
    
    
    


router.delete('/:id', (req, res, next) => {
  const {id} = req.params;
  notes.delete(id) 
  
    .then(item => {
      if (item) {
        console.log(`Deleted note ${id}`);
        res.status(204).end();
      }else{
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});
  


router.put('/:id', (req, res, next) => {
  const id = req.params.id;
  const updateObj = {};
  const updateFields = ['title', 'content'];
  updateFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });
  if (!updateObj.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  notes.update(id, updateObj)
    .then(item => {
      if (item) {
        res.json(item);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
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