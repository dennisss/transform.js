'use strict';

var util = require('util'),
	Operation = require('../op'),
	Path = require('../path'),
	Nop = require('./nop');

module.exports = Set;

/**
 * @class Set
 * @classdesc Sets the value of a field in the document
 * @extends Operation
 *
 */
function Set(p, data){
	if(!(this instanceof Set))
		return new Set(p, data);


	this.p = new Path(p, 1);
	this.data = data;

}
util.inherits(Set, Operation);


Set.prototype.exec = function(data){
	this.old = this.p.get(data);
	this.p.set(data, this.data);

	return data;
}

Set.prototype.inv = function(){
	var o = new Set(this.p, this.old);
	o.old = this.data;
	return o;
}

Set.prototype.clone = function(){
	var o = new Set(this.p, this.data);

	o.old = this.old;
	return o;
}

Set.prototype.includer = function(other){

	if(this.p.affects(other.p)){
		return Nop();
	}
	else
		return other;
}


Set.prototype.toJSON = function(){
	return {s: this.data, p: this.i, o: this.old }
}
