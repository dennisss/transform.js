'use strict';

var util = require('util'),
	Adapter = require('../adapter');



/**
 * An adapter for communicating through a server
 *
 * It should be given an EventEmitter-like socket
 */
class ClientAdapter extends Adapter {


	/**
	 * Given a web socket, it makes a new adapter
	 */
	constructor(sock){
		this._sock = sock;
		this._docs = {}; // The documents that are being monitored by the adapter


		var self = this;
		sock.on('ack', function(data){
			var id = data.id;
			var doc = self._docs[id];

			// TODO: Ensure non-null



			// TODO: Check version for missing operations

			doc.packets[data.v] = 'local';
			if(data.v > doc.latest){ doc.latest = data.v };

			doc._acked = true;
			doc._process();

			console.log('ACK')
		});


		// Called when the document has been changed by someone else connected to the server;
		sock.on('change', function(data){
			var id = data.id;
			var doc = self._docs[id];

			// TODO: Ensure non-null


			doc.packets[data.v] = data.ops;
			if(data.v > doc.latest){ doc.latest = data.v };

			doc._process();
			doc.emit('change')
		});





	};


	/**
	 * Listen for remote events/changes to this document
	 */
	subscribe(doc){
		this._docs[doc.id] = doc;
		this._sock.emit('subscribe', {id: doc.id, model: doc.model.name});
	};

	/**
	 * Stop listening for remote events
	 */
	unsubscribe(doc){
		if(!this._docs.hasOwnProperty(doc.id)){
			console.warn('The document was never subscribed');
			return;
		}

		this._sock.emit('unsubscribe', {id: doc.id, model: doc.model.name});
		delete this._docs[doc.id];
	};



	/**
	 * Send local changes to the server
	 */
	update(doc, callback){
		// TODO: The document must be subscribed for this to work

		var self = this;

		if(!doc._lock){ // Cannot send while already sending. TODO: But, also the ack, other operations that are queued to update should also be sent

			doc._lock = true;
			setTimeout(function(){ // Compose operations and send them once done executing
				if(doc.local.length == 0){
					doc._lock = false;
					callback(null);
					return;
				}

				doc._acked = false;
				doc._pending = doc.local.length;

				var data = {id: doc.id, model: doc.model.name, ops: doc.local, v: doc.v};

				console.log("SEND: " + JSON.stringify(data));
				self._sock.emit('update', data);

			});

		}

	};


	/**
	 * Request that changes (operations) from version 'from' to version 'to' be looked up
	 *
	 */
	history(doc, from, to, callback){
		this._sock.emit('history', {id: doc.id, model: doc.model.name, from: from, to: to});

		// Wait for the changes and callback when they are acknowledged
	};




};

module.exports = ClientAdapter;
