'use strict';

var util = require('util'),
	Operation = require('../op'),
	Ins = require('./ins'),
	Del = require('./del');

/* Move a range of things from one location to anywhere else in the document (implemented as a smart atomic delete followed by an insert) */

module.exports = Move;


/*
	'from' and 'to' should be either integers or a two element array range indicating 'from' where to grab the data and where 'to' put it
	Both of the arguments should be defined on the same document context (FYI: Overlapping from/to ranges have an overall effect of NOP)
*/
function Move(from, to){
	this.from = from;
	this.to = to;



}
util.inherits(Move, Operation);



Move.prototype.exec = function(data){

	// Apply a Del

	// Make a Ins

	// Transform it with the Del

	// Apply the Ins

}

Move.prototype.include = function(other){
	//


}

Move.prototype.includer = function(){
	var other = this;
	return function(self){
		self.include([
			other.del(),
			other.ins() // This will already be transformed by the .del() operation
		]);
	}

}
