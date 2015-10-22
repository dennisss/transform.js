'use strict';

var MongoClient = require('mongodb').MongoClient,
	fs = require('fs');


function connect(dbName, callback){
	var uri = "mongodb://localhost/" + dbName;
	var options = {
		db: { },
		server: {
			socketOptions: {
				keepAlive: 1
			}
		},
		replset: {
			socketOptions: {
				keepAlive: 1
			}
		}
	}

	MongoClient.connect(uri, options, function(err, db){
		global.db = db;
	});



/*

	In order to share common code between the browser and the server, different adapters will be used to drive models

	So,

	A Model is a








	Works for documents that are objects

	Adds an additional key 'v' to each document

	A separate 'history' collection stores history for that document. Updates need to be atomic
*/


/**
 * Used for working with Documents stored in a MongoDb collection
 *
 * This needs to be
 *
 *
 *
 */
class MongoAdapter {
	constructor(db, collectionName){

		this.collection = db.collection(collectionName);


		/*
			Format of the history collection
			{
				collection_id: '', // id of the document in the main collection
				ops: [...[..ops applied to v:(n-2) to get v:(n-1)..], [..ops applied to v:(n-1) to get v:n ... ]] // List of operations as a 2d list, the array should be traversed backwards
			}

		*/
		this.history = db.collection(collectionName + '_history');


	};




};


function MongoAdapter(db, collectionName){

}

/**
 * Finds the single document associated with the selector, and passes it back as a Document object
 */
MongoCollection.prototype.find = function(selector, callback){


}
