'use strict';

describe('Insert', function(){

	var doc;
	beforeEach(function(){
		doc = new transform.Document({a: 1, b: 'hello', c: [{}, {d:12}]}, 0);
	});

	it('two inserts at the same position', function(){
		doc.apply({i: 'X', p: ['b',1]}, 0);
		doc.commit();
		doc.apply({i: 'Y', p: ['b',1]}, 0);

		assert.deepEqual(doc.val(), {a: 1, b: 'hXYello', c: [{}, {d:12}]})
	})

	it('insert transformed by delete', function(){

		doc.apply({d: 2, p: ['b',0]}, 0);
		doc.commit();
		doc.apply({i: 'XYZ', p: ['b',3]}, 0);

		assert.deepEqual(doc.val(), {a: 1, b: 'lXYZlo', c: [{}, {d:12}]});
	});




})
