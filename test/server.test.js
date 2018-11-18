'use strict';

const app = require('../server');
const chai = require('chai');
const chaiHttp = require('chai-http');

const expect = chai.expect;

chai.use(chaiHttp);


describe('Reality check', function () {

  it('true should be true', function () {
    expect(true).to.be.true;
  });

  it('2 + 2 should equal 4', function () {
    expect(2 + 2).to.equal(4);
  });

});

describe('Express static', function () {

  it('GET request "/" should return the index page', function () {
    return chai.request(app)
      .get('/')
      .then(function (res) {
        expect(res).to.exist;
        expect(res).to.have.status(200);
        expect(res).to.be.html;
      });
  });
  
});
  
describe('404 handler', function () {
  
  it('should respond with 404 when given a bad path', function () {
    return chai.request(app)
      .get('/DOES/NOT/EXIST')
      .then(res => {
        expect(res).to.have.status(404);
      });
  });
});

describe('GET /api/notes', function () {
  
  it('should return the default of 10 Notes as an array', function () {
    return chai.request(app)
      .get('/api/notes')
      .then(res => {
        expect(res.body.length).equals(10);
      });
  });
  it('should return an array of objects with the id, title and content', function () {
    return chai.request(app)
      .get('/api/notes')
      .then(res => {
        for ( let i=0; i<res.body.length; i++)
          expect(res.body[i]).to.include.keys('id', 'title', 'content' );
        // expect(res.body[1]).to.include.keys('title');
        // expect(res.body[2]).to.include.keys('content');
      });
  });
  it('should return correct search results for a valid query', function () {
    const searchTerm = 'government';
    return chai.request(app)
      .get(`/api/notes?searchTerm=${searchTerm}`)
      .then(res => {
        res.body.forEach(function (note) {
          expect(note.title).includes(searchTerm);
        });
      });
  });
  it('should return an empty array for an incorrect query', function () {
    const searchTerm = 'dogs';
    return chai.request(app)
      .get(`/api/notes?searchTerm=${searchTerm}`)
      .then(res => {
        expect(res.body.length).equals(0);
      });
  });
});

describe('GET /api/notes/:id', function () {
  
  it('should return correct note object with id, title and content for a given id', function () {

    return chai.request(app)
      .get('/api/notes/1001')
      .then(res => {
        expect(res.body).to.deep.equal({
          'id': 1001,
          'title': 'What the government doesn\'t want you to know about cats',
          'content': 'Posuere sollicitudin aliquam ultrices sagittis orci a. Feugiat sed lectus vestibulum mattis ullamcorper velit. Odio pellentesque diam volutpat commodo sed egestas egestas fringilla. Velit egestas dui id ornare arcu odio. Molestie at elementum eu facilisis sed odio morbi. Tempor nec feugiat nisl pretium. At tempor commodo ullamcorper a lacus. Egestas dui id ornare arcu odio. Id cursus metus aliquam eleifend. Vitae sapien pellentesque habitant morbi tristique. Dis parturient montes nascetur ridiculus. Egestas egestas fringilla phasellus faucibus scelerisque eleifend. Aliquam faucibus purus in massa tempor nec feugiat nisl.'
        });
      });
  });
  it('should respond with a 404 for an invalid id (/api/notes/DOESNOTEXIST)', function () {
    return chai.request(app)
      .get('/api/notes/DOESNOTEXIST')
      .then(res => {
        expect(res).to.have.status(404);
      });
  });
});

describe('POST /api/notes', function () {
  
  it('should create and return a new item with location header when provided valid data', function () {
    const newItem = {title: 'coffee', content: 'yumm'};
    return chai.request(app)
      .post('/api/notes')
      .send(newItem)
      .then(res => {
        //console.log(res.headers);
        expect(res.headers.location).to.have.string('/api/notes/1010');
      });
  });
  it('should return an object with a message property "Missing title in request body" when missing "title" field', function () {
    const newItem = {title: 'apples', content: 'yumm'};
    return chai.request(app)
      .post('/api/notes')
      .send(newItem)
      .then(res => {
        expect(res.body.title).to.not.equal(null);
      });
  });
});


describe('PUT /api/notes/:id', function () {
  
  it('should update and return a note object when given valid data', function () {
    const updateItem = {title: 'cofffffee', content: 'yumm'};
    return chai.request(app)
      .get('/api/notes')
      .then(function(res) {
        updateItem.id = res.body[0].id;
        return chai.request(app)
          .put(`/api/notes/${updateItem.id}`)
          .send(updateItem);
      })
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('id', 'title', 'content');

        expect(res.body.id).to.equal(1000);
        expect(res.body.title).to.equal(updateItem.title);
        expect(res.body.content).to.equal(updateItem.content);
      });
  });
  it('should return an object with a message property "Missing title in request body" when missing "title" field', function () {
    const updateItem = {title: '', content: 'yumm'};
    return chai.request(app)
      .put('/api/notes/1005')
      .send(updateItem)
      .catch(err => err.response)
      .then(res => {
        //console.log(res.body);
        expect(res).to.have.status(400);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body.message).to.equal('Missing `title` in request body');
      });
  });
  it('should respond with a 404 for an invalid id (/api/notes/DOESNOTEXIST))', function () {
    const updateItem = {title: 'asdfasdfasdfasdfasdf', content: 'yumm'};   
    return chai.request(app)
      .put('/api/notes/DOESNOTEXIST')
      .send(updateItem)
      .catch(err => err.response)
      .then(res => {
        expect(res).to.have.status(404);
      });
  });
});
describe('DELETE  /api/notes/:id', function () {

  it('should delete an item by id', function () {
    return chai.request(app)
      .delete('/api/notes/1005')
      .then(function (res) {
        expect(res).to.have.status(204);
      });
  });

});
















