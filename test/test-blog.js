const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const faker = require ('faker');

const {TEST_DATABASE_URL} = require('../config');
const {app, runServer, closeServer} = require('../server');
const {BlogPost} = require('../models');

const should = chai.should();
chai.use('chaiHttp');

function seedBlogData() {
	console.info('seeding blog data');
	const seedData = [];
	for (let i=1; i<= 10; i++) {
		seedData.push(generateBlogData);
	}
	return BlogPost.insertMany(seedData);
}

function generateBlogData() {
	return {
		title: faker.Lorem.words().join(" "),
		author: {
			firstName: faker.firstName(),
			lastName: faker.lastName()
		},
		content: faker.Lorem.sentence()
	};
}