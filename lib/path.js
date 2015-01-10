'use strict';

var util = require('util'),
	Pointer = require('./pointer')

module.exports = Path;


// TODO: Cleanup and figure out which of these are needed

/*
	TODO: This needs to have good support for path projections
*/

/* Object traversal path useful functions */


function Path(p, len){

	if(arguments.length == 1){
		len = 0; // TODO: Most parent or context paths have length 1: shrinking them to zero should also invalidate the path
	}

	if(p instanceof Path){
		this.p = p.p;

		if(arguments.length == 2)
			this.len = len;
		else
			this.len = p.len;
	}
	else if(p instanceof Array){
		this.p = p;
		this.len = len;
	}
	else
		console.log('Path Error');
}

Path.prototype.parent = function(){
	return new Path(this.p.slice(0, this.p.length - 1), 1);
}

/*
	Returns the projection of another path on this on
	i.e. [1,2,3,4].project([1,2,4,5,6]) = [1,2]
		 [1,2,3,4].project([1,2,3,4,5]) = [1,2,3,4]
*/
Path.prototype.project = function(other){
	var i;
	for(i = 0; i < this.p.length; i++){
		if(this.p[i] != other.p[i])
			break;
	}

	return new Path(other.p.slice(0, i));
}

Path.prototype.affects = function(other){
	var proj = this.project(other);
	if(proj.p.length == this.p.length || (proj.p.length == this.p.length - 1 && typeof(this.p[this.p.length - 1]) == 'number'))
		return true;

	return false;
}



Path.prototype.resolve = function(data){
	var cont = data;
	for(var i = 0; i < this.p.length - 1; i++){
		cont = cont[this.p[i]];
	}

	return new Pointer(cont, this.i());
}

Path.prototype.get = function(obj){
	for(var i = 0; i < this.p.length; i++){
		obj = obj[this.p[i]];
	}

	return obj;
}

Path.prototype.set = function(obj, val){
	for(var i = 0; i < this.p.length - 1; i++){
		obj = obj[this.p[i]];
	}

	obj[this.i()] = val;
}

Path.prototype.i = function(v){
	if(arguments.length == 1){
		this.p[this.p.length - 1] = v;
	}

	return this.p[this.p.length - 1];
}

Path.prototype.context = function(other){
	var pos = other.p.length - 1;

	if(pos == this.p.length - 1){
		return this;
	}
	else{

		var self = this;

		throw "Not implemented";

		return {
			i: function(){ self.p[pos] },
			j: function(){ return this.i(); },

			shift: function(){

			},

			unshift: function(){

			},

			extend: function(){

			},

			shrink: function(){

			},


			length: function(){

			}


		};
	}
}

/* Add a number to the index part of the path*/
Path.prototype.add = function(x){
	this.i(this.i() + x);

	//this.p[this.p.length - 1] += x;
	return this;
}

Path.prototype.subtract = function(v){
	return this.add(-1*v);
}


/* Determine if two paths depend on each other. In other words, whether or not a change at one of the paths could effect the other */
Path.prototype.dependent = function(other){

	var p1 = this.p.slice();
	var p2 = other.p.slice();

	// Remove common part of the two
	while(p1.length > 0 && p2.length > 0){

		var a = p1[0];
		var b = p2[0];

		if(a == b){
			p1.shift();
			p2.shift();
		}
		else
			break;
	}

	if(p1.length == 0 || p2.length == 0){ // They overlap or are identical
		return true;
	}


	if(typeof(p1[0]) == 'number' || typeof(p2[0]) == 'number'){ // Ordered container
		return true;
	}

	return false;
}


Path.prototype.toJSON = function(){
	return this.p;
}

/* Given a bunch of paths, return the common part of them */
Path.common = function(paths){


}



// Range stuff
Path.prototype.shift = function(v){
	this.add(v);
}

Path.prototype.unshift = function(v){
	this.shift(-1*v);
}

Path.prototype.extend = function(v){
	this.len += v;
}
Path.prototype.shrink = function(v){
	this.extend(-1*v);
}

Path.prototype.j = function(){
	return this.i() + this.len;
}

Path.prototype.length = function(){
	return this.len;
}

