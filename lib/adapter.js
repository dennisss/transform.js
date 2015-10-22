'use strict';

/*
	Adapters need to support performing the basic CRUD operations on the underlying datastore
	For the purposes of unique identification and indexing, most adapters will also create a required 'id' field in the document to make things easier

	They don't need to have any access-control as that will be handled by the model

*/


var util = require('util'),
	EventEmitter = require('events').EventEmitter,
	Document = require('./document');


/**
 * @classdesc Base class for creating adapters for
 * @class
 * @abstract
 */
class Adapter extends EventEmitter {
	constructor(){
		super();
	};

};




/**
 * Sample adapter which stores all documents in non-persistent memory
 *
 */
class MemoryAdapter extends Adapter {
	constructor(){
		super();

		this.db = {};
		this.inc = 1;
	};

	/**
	 * Creates a new record in the database
	 */
	create(collection, callback){

		if(!this.db[collection])
			this.db[collection] = [];


		var newdoc = {
			id: this.inc++,
			v: 0
		};

		this.db[collection].push(newdoc);

		callback(null, _inst(newdoc));

	};


	// TODO: This should also be able to read many documents
	read(collection, selector, callback){
		var col = this.db[collection];

		if(!col){
			callback(null, null);
			return;
		}

		for(var i = 0; i < col.length; i++){

			var c = col[i];

			var match = true;
			for(var k in selector){
				if(selector.hasOwnProperty(k)){
					if(c[k] != selector[k]){
						match = false;
						break;
					}
				}
			}

			if(match){
				callback(null, col[i]);
				return;
			}
		}

		callback(null, null);

	};

	update(doc, callback){


		// I need to know the version in the database and


	};

	destroy(doc, callback){
		var col = this.db[doc.model.name];
		for(var i = 0; i < col.length i++){
			if(col[i].id == doc.data.id){
				col.splice(i, 1);
				break;
			}
		}

		callback(null);
	};


	// Helper function for making a copy of and instantiating the data as a document (this is to simulate a network transfer with isolation from the datastore)
	// Given an object in the serialized db form, make it into a document
	_inst(data){
		// The version isn't an actualy data field, but is inserted by the adapter
		// TODO: Maybe do the same thing for id?
		var ver = data.v;
		data = _.extend({}, data);
		delete data.v;

		var doc = new Document(data, ver);
		doc.model = this;

		return doc;
	};

}



module.exports = Adapter;
Adapter.Memory = MemoryAdapter;
