'use strict';

describe('Move', function(){

	var doc;
	beforeEach(function(){
		doc = new transform.Document({a: [1,4,5,6], b: [1,2,3,4,5]}, 0);
	});

	it('should be able to make around items between arrays', function(){
		doc.apply({m: 2, f: ['b', 1], t: ['a', 1] });

		assert.deepEqual(
			doc.val(),
			{a: [1,2,3,4,5,6], b: [1,4,5]}
		);
	});

	it('should be able to shuffle items of the same array', function(){
		doc.apply({m: 1, f: ['b', 3], t: ['b', 1]});

		assert.deepEqual(
			doc.val(),
			{a: [1,4,5,6], b: [1,4,2,3,5]}
		);
	});

	// from to same place

	// overlapping ranges
});
