'use strict';


describe('Set', function(){


	var doc;
	beforeEach(function(){
		doc = new transform.Document({a: 1, b: 'hello', c: [{}, {d:12}]}, 0);
	});

	it('can set a character in a string', function(){
		doc.apply({s: 'XY', p: ['b', 1]});

		assert.deepEqual(doc.val(), {a: 1, b: 'hXYllo', c: [{}, {d:12}]})
	})

	it('should be able to set root key values', function(){
		doc.apply({s: 5, p: ['a']});

		assert.deepEqual(doc.val(), {a: 5, b: 'hello', c: [{}, {d:12}]});
	});

	it('should be able to set a nested key', function(){
		doc.apply({s: 5, p: ['c', 1, 'd']});

		assert.deepEqual(doc.val(), {a: 1, b: 'hello', c: [{}, {d:5}]});
	});


	it('should not do anything after a delete of a parent object', function(){
		doc.apply({d: 1, p: ['c', 1]}, 0);
		doc.commit();
		doc.apply({s: 5, p: ['c', 1, 'd']}, 0);

		assert.deepEqual(doc.val(), {a: 1, b: 'hello', c: [{}]})

	});

	it('should set a character right next to a previous insert', function(){
		doc.apply({i: 'XY', p: ['b',2]}, 0);
		doc.commit();
		doc.apply({s: 'Z', p: ['b',2]}, 0);

		assert.deepEqual(doc.val(), {a: 1, b: 'heXYZlo', c: [{}, {d:12}]});

	})


});
