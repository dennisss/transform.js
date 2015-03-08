'use strict';

var util = require('util'),
	Pointer = require('./pointer')

module.exports = Path;


// TODO: Cleanup and figure out which of these are needed

/*
	TODO: This needs to have good support for path projections
*/

/* Object traversal path useful functions */

/**
 * @class Path
 * @classdesc Represents a set of indices going from the root to some position in the document
 * @param p another path to copy or an array of indices to populate a new one with
 * @param len the optional length of the path representing how many items it spans in the parent object
 */
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
	var parent = null;
	for(var i = 0; i < this.p.length - 1; i++){
		parent = obj;
		obj = parent[this.p[i]];
	}

	if(typeof(obj) == 'string'){
		var s = obj.substr(0, this.i()) + val + obj.substr(this.i() + 1);
		parent[this.p[this.p.length - 2]] = s;
	}
	else
		obj[this.i()] = val;
}

Path.prototype.i = function(v){
	if(arguments.length == 1){
		this.p[this.p.length - 1] = v;
	}

	return this.p[this.p.length - 1];
}

/**
 * Creates a context for modified this path with respect to another
 *
 * @param other the other path
 *
 * ex: if this path is [0, 'b', 3, 'c']
 *     and the other path is [0, 'b', 1],
 *     applying a shift to the context of one
 *     to the context returned will make the
 *     original path [0, 'b', 4, 'c']. in other words
 *     the context specifies the position in the path that is being modified
 */
Path.prototype.context = function(other){
	var pos = other.p.length - 1;

	if(pos == this.p.length - 1){
		return this;
	}
	else{

		var self = this;

		if(typeof(this.p[pos]) != 'number')
			throw "Not implemented for non integer locations";

		var len = 1;

		return {
			i: function(i){
				if(arguments.length == 1)
					self.p[pos] = i;

				return self.p[pos]
			},
			j: function(){ return this.i() + len; },

			shift: function(v){
				this.i(this.i() + v);
			},
			unshift: Path.prototype.unshift,

			extend: function(v){
				if(v < 0){
					len += v;

					if(len <= 0){
						self.extend(v);
					}
				}
				else{
					this.shift(v);
				}
			},
			shrink: Path.prototype.shrink,


			length: function(){
				return len;
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

