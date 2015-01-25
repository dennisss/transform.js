'use strict';

/* Insert operation */

/*
	For JSON types, Ins and Del work on arrays or strings, but they must maintain an internal version number of the
	container they work on: specificially two versions:
	-> 'rq' the version of the container on which the command is defined
		-> Actually, for the most obvious implementation, this will always be 0 so it can be excluded
	-> 'cv' the current version of the container: incremented and decremented through transforms against a Set operation
		-> This only needs to be transferred or stored when it is non-zero, otherwise it is implicitly zero
	The operation does nothing if 'rq' != 'cv'

	//For JSON types, Ins and Del will also store a pointer to the array from
	//their original context so that when they are transformed, they still act on the right array

*/

module.exports = Ins;

var util = require('util'),
	Operation = require('../op'),
	Del = require('./del'),
	Path = require('../path');



function Ins(p, data){
	if(!(this instanceof Ins))
		return new Ins(p, data);

	if(p instanceof Path)
		this.p = p;
	else
		this.p = new Path(p, 1);

	this.data = data;
}
util.inherits(Ins, Operation);


Ins.prototype.exec = function(data){
	var contP = this.p.parent();
	var cont = contP.get(data);

	if(cont instanceof Array){
		for(var i = this.data.length - 1; i >= 0; i--){
			cont.splice(this.i(), 0, this.data[i])
		}

		//Array.prototype.splice.apply([cont, this.i(), 0].concat(this.data));
	}
	else if(typeof(cont) == 'string'){
		contP.set(data,
			cont.substring(0, this.i()) + this.data + cont.substring(this.i())
		);
	}
	else{
		throw 'Error: invalid Ins';
	}


	return data;
}


/* Generates a function for including the effect of Ins into other operations */
/* Shift paths right: keeps paths at the same position the same */

/* Describes how the Ins changes other operations */
Ins.prototype.includer = function(other){

	if(this.p.affects(other.p)){
		this.offset(other.p);
	}

	return other;
}

Ins.prototype.i = function(){
	return this.p.i();
}

Ins.prototype.j = function(){
	return this.i();
}

Ins.prototype.offset = function(r){

	var c = r.context(this.p);

	var len = this.data.length;

	if(this.i() < c.i())
		c.shift(len);
	else if(this.i() < c.j())
		c.extend(len);
}

Ins.prototype.inv = function(){
	return Del(this.p, this.data)
}

Ins.prototype.clone = function(){
	return Ins(this.p, this.data);
}

Ins.prototype.toJSON = function(){
	return {i: this.data, p: this.p};
}


