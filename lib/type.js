'use strict';

var EventEmitter = require('events').EventEmitter,
	util = require('util');

/*
	This is a base class for making objects that wrap data in a document

	In the data, each object and array has a hidden _type_ property which holds an instance of a DataType.
	By default, the DataType maintains the dirty state and parent pointer of the object.


*/

module.exports = DataType;

function DataType(data, doc){
	EventEmitter.call(this);


	this.data = data;
	this.document = doc;

	this._parent = null;
	this._dirty = false;

}
util.inherits(DataType, EventEmitter);


/**
 * Recursively generates types of the given data
 */
DataType.augment = function(data, doc){
	return augment_data(data, doc, null);
};

function augment_data(data, doc, parent){

	if(data instanceof Object){

		var type = new DataType(data, doc);
		type.parent(parent);

		Object.defineProperty(data, '_type_', {
			value: type,
			writable: true,
			configurable: true,
			enumerable: false
		});

		if(data instanceof Array){
			for(var i = 0; i < data.length; i++){
				augment_data(data[i], doc, type);
			}
		}
		else{

			var keys = Object.keys(data);
			for(var i = 0; i < keys.length; i++){
				augment_data(data[keys[i]], doc, type);
			}
		}
	}

	return data;
}




DataType.prototype.parent = function(obj){
	if(arguments.length == 1){
		this._parent = obj;
	}

	return this._parent;
}


DataType.prototype.path = function(){
	var path = [];

	for(var p = this; p != null; p = p.parent()){
		path.splice(0,0, p);
	}

	return path;
}


/* For container pointers this is a shorthand for subscripting (via pointerOf) */
DataType.prototype._ = function(i){
	return this.pointerOf(i);
}

DataType.prototype.i = function(){
	return this._parent.indexOf(this);
}


DataType.prototype.dirty = function(val){
	if(arguments.length == 1){

		this._dirty = val? true : false;

		// All nodes up will also become dirty
		if(val){
			var p = this._parent; //this.parent();
			if(p && !p.dirty() /* Stop if the above path has already been set as dirty */)
				p.dirty(true);
		}


	}
	else{
		return this._dirty? true: false;
	}
}

DataType.prototype.clean = function(){
	this.dirty(false);
}
