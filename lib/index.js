'use strict';


require('./ui');

/*

Transform Control Function
-> Generic based on ctx and is responsible for

Transform Function
-> Transform (IT, ET)
	-> Del, Ins, ...





Applying this stuff to JSON objects:

Operations now have



Ops
{v: 1, d: 5, p: []}
{v: 1, i: "", p: []}
{v: 1, m: [], p: []}

*/

module.exports = {
	Document: require('./document')
}











function IT(op1, op2){ return Transform(op1, op2); };
function ET(op1, op2){ return Transform(op1, Inv(op2)); };


/* this is an IT transform */
function Transform(op1 /* The operation to transform */, op2 /* The operation with which it should be transformed (or an array of them)*/){

}




/*
	A context consists of a set of operations performed since the last context,
	A pointer to the parent (predecessor) context
	And optionally a version number
*/
function Context(ops, parent, v){
	this.ops = ops;
	this.parent = parent;
	this.v = v;

}


/* Maintains the latest copy of the data string, the current version number, and a history (how to get to any other)  */
/* It also knows which actions have been localy applied */
function Document(str){
	this.str = str;
	this.history = [
		new Context([], null, 1)
	];
	this.local = [];
	this.v = 1;
}

Document.prototype.currentContext = function(){

}

/* Given a version number, get a context associated with it */
Document.prototype.getContextFor = function(v){
	for(var i = this.history.length - 1; i >= 0; i--){
		var ctx = this.history[i];

		if(ctx.v == v)
			return ctx;

	}
}

Document.prototype.applyCommand = function(data){

	var v = data.v;

	if(v < 1){
		console.log('Invalid prehistoric version');
		return null;
	}

	if(v > this.v){
		console.log('Invalid future version');
		return null;
	}

	var ctx = this.getContextFor(v);

	// The operation must be transformed against every operation since it's context
}


function test_ot(){

	//aXbYc
	var doc = 'abcdefg';

	//var o1 = Ins(null, 1, 'x')
	//var o2 = Ins(null, 2, 'y');

	var o1 = Del(null, 1, 2);
	var o2 = Del(null, 2, 2);

	var o3 = Ins(null, 6, 'X'); // After f in original


	var o2p = Transform(o2, o1);

	var o3p  = Transform(o3, [o1, o2p])

	console.log(o2p);
	console.log(o3p);

	var final = o3p.eval( o2p.eval( o1.eval(doc) ) );



	console.log(final);


}

//test_ot();
