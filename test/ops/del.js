'use strict';


describe('Delete', function(){

	var doc;
	beforeEach(function(){
		doc = new transform.Document({a: 1, b: 'hello', c: [{}, {d:12}]}, 0);
	});


	it('should delete from both arrays from strings', function(){

		doc.apply({d: 2, p: ['b',1] }, 0);
		doc.apply({d: 2, p: ['c',0]});

		assert.deepEqual(doc.val(), {a: 1, b: 'hlo', c: []});

	});

	it('delete is transformed by a previous insert', function(){

		doc.apply({i: 'abcd', p:['b',1] }, 0);
		doc.commit();

		doc.apply({d: 2, p: ['b', 2]}, 0);


		assert.deepEqual(doc.val(), {a: 1, b: 'habcdeo', c: [{}, {d:12}]});
	});


	it('does not double delete on overlapping ranges', function(){
		doc.apply({d: 3, p: ['b', 1]}, 0);
		doc.commit();
		doc.apply({d: 1, p: ['b', 2]}, 0);

		assert.deepEqual(doc.val(), {a: 1, b: 'ho', c: [{}, {d:12}]});

	});

	it('does not double delete on overlapping ranges (forward)', function(){
		doc.apply({d: 1, p: ['b', 2]}, 0);
		doc.commit();
		doc.apply({d: 3, p: ['b', 1]}, 0);

		assert.deepEqual(doc.val(), {a: 1, b: 'ho', c: [{}, {d:12}]});

	});


	// overlapping commands on same range



});
