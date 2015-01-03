'use strict';

module.exports = Del;

var util = require('util'),
	Operation = require('../op'),
	Ins = require('./ins');





function Del(i, data){
	if(!(this instanceof Del))
		return new Del(i, data);


	if(typeof(data) == 'string'){
		this.data = data;
		data = data.length;
	}

	this.i = i; // Start
	this.j = i + data;
}
util.inherits(Del, Operation);


Del.prototype.exec = function(str){
	this.data = str.substring(this.i, this.j);
	return str.substring(0, this.i) + str.substring(this.j);
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


Del.prototype.includer = function(){
	var other = this;
	return function(self){
		var len = other.j - other.i;

		var leading, trailing, inner;

		leading = (other.i < self.i)? (Math.min(other.j, self.i) - other.i)  : 0
		trailing = (other.j > self.j)? (other.j - Math.max(other.i, self.j)) : 0;
		inner = len - leading - trailing;

		self.i -= leading;
		self.j -= leading + inner;
	}
}


Del.prototype.clone = function(){
	return new Del(this.i, this.j - this.i);
}

Del.prototype.toJSON = function(){
	return {d: this.j - this.i, p: this.i, v: this.v};
}
