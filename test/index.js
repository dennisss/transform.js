'use strict';

global.assert = require('assert');

global.transform = require('../lib')

describe('lib', function(){

	var data = { text: 'hello world' };
	var doc;

	beforeEach(function(){
		doc = new transform.Document({text: 'hello world'}, 0);
	});

	describe('basic functionality', function(){

		it('should be able to create a document with a value', function(){
			assert.deepEqual(data, doc.value());
		});

		it('should be able to insert characters', function(){
			doc.apply({ i: 'XYZ', p: ['text', 1] });
			assert.equal(doc.val().text, 'hXYZello world');
		});

		it('should be able to delete characters', function(){
			doc.apply({ d: 3, p: ['text', 2] });
			assert.equal(doc.val().text, 'he world');
		});
	});

	describe('operation transformation', function(){

		it('insert - insert', function(){

			doc.apply({ i: 'XY', p: ['text', 1] }, 0); //hXYello world

			doc.commit();

			doc.apply({ i: 'Z', p: ['text', 6]}, 0); //hello Zworld

			assert.equal(doc.val().text, 'hXYello Zworld');
		});

	});


	require('./ops');


});
