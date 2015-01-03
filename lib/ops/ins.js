'use strict';

/* Insert operation */

/*
	For JSON types, Ins and Del will also store a pointer to the array from
	their original context so that when they are transformed, they still act on the right array

*/

module.exports = Ins;

var util = require('util'),
	Operation = require('../op'),
	Del = require('./del');



function Ins(i, data){
	if(!(this instanceof Ins))
		return new Ins(i, data);

	this.i = i; // Start
	this.j = i; // Stop

	this.data = data;
}
util.inherits(Ins, Operation);


Ins.prototype.exec = function(str){
	return str.substring(0, this.i) + this.data + str.substring(this.i);
}

/* Generates a function for including the effect of Ins into other operations */
Ins.prototype.includer = function(){
	var other = this;
	return function(self){
		var len = other.data.length;

		if(other.i < self.i) // TODO: < or <= ?
			self.i += len; // Add the length of the inserted text

		if(other.i < self.j)
			self.j += len;
	};
}

Ins.prototype.inv = function(){
	return Del(this.i, this.data)
}

Ins.prototype.clone = function(){
	return Ins(this.i, this.data);
}

Ins.prototype.toJSON = function(){
	return {i: this.data, p: this.i, v: this.v};
}


