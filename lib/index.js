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
	Document: require('./document'),
	Model: require('./model'),
	Adapter: require('./adapter'),
	//Type: require('./type'), // TODO: This was stupid to add

	net: {
		ClientAdapter: require('./net/client'),
		Server: require('./net/server')
	}
}











function IT(op1, op2){ return Transform(op1, op2); };
function ET(op1, op2){ return Transform(op1, Inv(op2)); };

