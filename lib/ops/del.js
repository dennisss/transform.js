'use strict';

module.exports = Del;

var util = require('util'),
	Operation = require('../op'),
	Ins = require('./ins'),
	Path = require('../path');



/*
	TODO Case:

	Starting at 'hello',

	IT( Ins(1, 'X'),  Del(0, 5) ) = Nop

	but IT(Ins(1, 'X'), Del(0, 1)) = Ins(0, 'X')

*/



function Del(p, data){
	if(!(this instanceof Del))
		return new Del(p, data);


	if(typeof(data) == 'string'){
		this.data = data;
		data = data.length;
	}

	if(p instanceof Path)
		this.p = p;
	else
		this.p = new Path(p, data);
}
util.inherits(Del, Operation);


Del.prototype.exec = function(data){
	var contP = this.p.parent();
	var cont = contP.get(data);

	var len = this.p.length();

	if(cont instanceof Array){
		this.data = cont.splice(this.p.i(), len);
	}
	else if(typeof(cont) == 'string'){
		this.data = cont.substring(this.p.i(), this.p.j())

		contP.set(data,
			cont.substring(0, this.p.i()) + cont.substring(this.p.j())
		);
	}

	return data;
}

/* Currently just usable for transforms */
Del.prototype.inv = function(){
	var str;
	var len = this.j - this.i;

	if(this.data && this.data.length == len){
		str = this.data;
	}
	else{
		str = "";
		for(var i = 0; i < len; i++){
			str += '*';
		}
	}

	return Ins(this.i, str);
}

Del.prototype.includer = function(other){

	if(this.p.affects(other.p)){
		this.offset(other.p); // TODO: What if it a Set command
	}


	return other;

	// TODO: If the context turns into something with length 1, set the operation to Nop
}

/* Beginning integer offset of the deletion range */
Del.prototype.i = function(){
	return this.p.i();
}

/* Ending integer offset of the deletion range */
Del.prototype.j = function(){
	return this.p.j();
}


// TODO: Some commands need to be made noop if their reference objects are completely deleted
Del.prototype.offset = function(r){
	// Make sure all changes to the range paths are with respect to the current array
	var c = r.context(this.p);

	var len = this.p.length();

	var leading = (this.i() < c.i())? (Math.min(this.j(), c.i()) - this.i()) : 0;
	var trailing = (this.j() > c.j())? (this.j() - Math.max(this.i(), c.j())): 0;
	var inner = len - leading - trailing;

	c.unshift(leading);
	c.shrink(inner);
}


Del.prototype.clone = function(){
	return new Del(this.p, this.j - this.i);
}

Del.prototype.toJSON = function(){
	return {d: this.p.length(), p: this.p};
}
