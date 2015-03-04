'use strict';

var util = require('util'),
	Operation = require('../op'),
	Ins = require('./ins'),
	Del = require('./del'),
	Path = require('../path');

/* Move a range of things from one location to anywhere else in the document (implemented as a smart atomic delete followed by an insert) */

module.exports = Move;


/**
 * @class Move
 * @classdesc moves a range of items from one position in an array to another position
 *
 *
 * 'from' and 'to' should be either integers or a two element array range indicating 'from' where to grab the data and where 'to' put it
 * Both of the arguments should be defined on the same document context (FYI: Overlapping from/to ranges have an overall effect of NOP)
 **/
function Move(from, to, n){
	if(!(this instanceof Move))
		return new Move(from, to, n);

	this.from = new Path(from, n);
	this.to = new Path(to);
}
util.inherits(Move, Operation);


Move.prototype.del = function(){
	return new Del(this.from);
}

/* A non-transformed insert */
Move.prototype.ins = function(){
	return Ins(this.to, this.data || this.from.length());
}


Move.prototype.exec = function(data){
	var d = this.del();
	data = d.exec(data);
	this.data = d.data;

	var i = this.ins().include(d)
	data = i.exec(data);

	return data;
}

Move.prototype.clone = function(){
	return Move(this.from, this.to, this.from.length());
}

Move.prototype.include = function(other){
	var self = this.clone();

	self.del().include(other);
	self.ins().include(other);

	return self;
}

Move.prototype.includer = function(other){

	var d = this.del();
	var i = this.ins().include(d);

	return other.include([
		d,
		i
	]);


	return function(self){
		var d = other.del();
		var i = other.ins().include(d);

		self.include([
			d,
			i
		]);
	}

}


Move.prototype.toJSON = function(){
	return {
		m: this.from.length(),
		f: this.from,
		t: this.to
	};
}
