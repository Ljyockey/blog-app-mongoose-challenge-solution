const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const faker = require ('faker');

const {TEST_DATABASE_URL} = require('../config');
const {app, runServer, closeServer} = require('../server');
const {BlogPost} = require('../models');

const should = chai.should();
chai.use(chaiHttp);

function seedBlogData() {
	console.info('seeding blog data');
	const seedData = [];
	for (let i=1; i<= 10; i++) {
		seedData.push(generateBlogData());
	}
	return BlogPost.insertMany(seedData);
}

function generateBlogData() {
	return {
		title: faker.lorem.word(),
		author: {
			firstName: faker.name.firstName(),
			lastName: faker.name.lastName()
		},
		content: faker.lorem.sentence(),
		created: faker.date.recent()
	};
}

function tearDownDb() {
	console.warn('Deleting database');
	return mongoose.connection.dropDatabase();
}

describe('Blog API Resources', function() {

before(function() {
	return runServer(TEST_DATABASE_URL);
});

beforeEach(function() {
	return seedBlogData();
});

afterEach(function() {
	return tearDownDb();
});

after(function() {
	return closeServer();
});

describe ('GET endpoint', function() {

	it('should return list of all existing blog posts', function() {
		let res;
		return chai.request(app)
		.get('/posts')
		.then(function(_res) {
			res = _res;
			res.should.have.status(200);
			res.body.should.have.length.of.at.least(1);
			return BlogPost.count();
		})
		.then(function(count) {
			res.body.should.have.length.of(count);
		});
	});

	it('should return restaurants with right fields', function() {
		let res;
		return chai.request(app)
		.get('/posts')
		.then(function(_res) {
			res = _res;
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('array');
			res.body.should.have.length.of.at.least(1);
			res.body.forEach(function(post) {
				post.should.be.a('object');
				post.should.include.keys('title', 'author', 'content', 'id', 'created');
			});
			resBlog = res.body[0];
			return BlogPost.findById(resBlog.id).exec();
		})
		.then(function(blog) {
			console.log(blog);
			resBlog.id.should.equal(blog.id);
			resBlog.title.should.equal(blog.title);
			resBlog.author.should.equal(blog.authorName);
			resBlog.content.should.equal(blog.content);
		});
	});
});

});