'use strict';

var util = require('util'),
	EventEmitter = require('events').EventEmitter,
	Operation = require('./op'),
	Ins = require('./ops/ins'),
	Del = require('./ops/del');

module.exports = Document;

/*
	A document represents a editable peice of data
	Generic JSON objects are supported: plain strings, numbers, arrays, objects, or any subset of JSON can be used as the root.
*/

/*
	Notes:

	Clients must get an ack of their last sent set of operations prior to sending more
	There will be a single scalar value representing the version of the document, only the server will be able to increment this
	The version vector is continuous, once a client has received an ack of their last sent operations, they should make sure that their history has all external changes
		integrated before sending more operations


*/

function Document(data){

	this.data = data;
	this.v = 0;

	this.history = [];

	this.pending = 0; // Number of operations waiting to be acknowledged
	this.local = []; // Future

	this.packets = {}; // A table of operations received from the server: keys are the version they apply to and values are the operations
	this.latest = 0; // The version of the newest peice of data received from the server


}
util.inherits(Document, EventEmitter);

Document.prototype.value = function(){
	return this.data;
}

Documet.prototype.server = function(sock){


}



/*
	Link the document to a server through an existing connection

	sock can be any EventEmitter style object supporting .on('msgName', callback) and .emit('msgName', {... data ...})
	sock DOES NOT need to ensure in order delivery of messages
*/
Document.prototype.client = function(sock){
	var self = this;

	this.sock = sock;

	// This is sent by the server when the whole document is requested using a 'read' message
	sock.on('value', function(doc){
		console.log(doc)

		self.data = doc.data;
		self.v = doc.v;

		self.emit('change');
	})
	sock.emit('read'); // Request the initial document value from the server

	this._acked = true;
	sock.on('ack', function(data){
		// TODO: Check version for missing operations

		self.packets[data.v] = 'local';
		if(data.v > self.latest){ self.latest = data.v };

		self._acked = true;
		self._process();

		console.log('ACK')

	})

	// Called when the document has been changed by someone else connected to the server;
	sock.on('change', function(data){
		self.packets[data.v] = data.ops;
		if(data.v > self.latest){ self.latest = data.v };

		self._process();
		self.emit('change')
	})

	/*
	sock.on('data', function(msg){

		if(msg.type == 'ack'){

			// Try to finalize pending operations
			// And submit more of the local operations
		}
		else if(msg.type == 'change'){


		}
		else if(msg.type == ''){

		}



	});
	*/
}



Document.prototype._submit = function(){

}

/* Wait for all local operations to sync with the server */
Document.prototype.flush = function(callback){

}


// Upgrade ops based on the preceding diff operations that split their contexts from the current document context
function Upgrade(ops, diff){

	var exc = []; // List of the previous operations to first exclude (these are the non-transformed ones)
	var inc = []; // List of the previous operations to then include (these are the transformed ones)
	for(var i = 0; i < ops.length; i++){
		var o = ops[i];

		var ot = o.exclude(exc);
			ot = ot.include(diff),
			ot = ot.include(inc);

		exc.splice(0, 0, o);
		inc.push(ot);
	}

	return inc;
}

/*
	Apply local changes to a version of the document (or the current version if no version specified)
	If multiple operates are specified, then they are assummed to be casually preceding each other

	//Apply an operation (or an array or operations) to the current version of document
	//Operations will also be queued to be synced with the server
*/
Document.prototype.apply = function(op, v){
	if(!(op instanceof Array))
		op = [op];

	if(op.length == 0)
		return;

	// Parsing
	op = op.slice();
	for(var i = 0; i < op.length; i++){
		var o = op[i];
		if(!(o instanceof Operation)){ // Parse it
			if(o.d){
				op[i] = Del(o.p, o.d);
			}
			else if(o.i){
				op[i] = Ins(o.p, o.i);
			}
		}
	}

	// Case: All the changes are on the current version
	if(arguments.length == 1 ){
		for(var i = 0; i < op.length; i++){
			this.data = op[i].exec(this.data);
			this.local.push(op[i]);
		}

		this._trysend();

		return;
	}


	// Undo local
	for(var i = this.local.length - 1; i >= 0; i--){
		this.data = this.local[i].inv().exec(this.data);
	}



	// Upgrade the context of the new operations
	if(v < this.v){
		var ctxDiff = this.history.slice(v); // Get all the commands since the specified version
		op = Upgrade(op, ctxDiff);
	}

	// TODO: Make sure that the operations were upgraded enough : in the case of missing operations, the history may have been incomplete


	// Transform the undone commands
	this.local = op.concat( Upgrade(this.local, op) );


	// Do and Redo
	for(var i = 0; i < this.local.length; i++){
		this.data = this.local[i].exec(this.data);
	}

	this._trysend();

	return op;
}


/* Try to compress the array of sequential operations using some simple methods and return the result */
function Compose(ops){
	var res = [];

	for(var i = 0; i < ops.length - 1; i++){
		var cur = ops[i].clone();


		if(cur instanceof Ins){
			// Sequential insertions to the same location or to the i+1'th location can be compressed
			for(var j = i+1; j < ops.length - 1; j++){
				var next = ops[j];
				if(next instanceof Ins){
					if(next.i == cur.i){

					}
					else if(next.i == cur.i + cur.value.length){

					}
					else
						break;
				}
				else
					break;
			}

		}


		if(cur instanceof Del){

		}

		res.push(cur);
	}

	return res;
}





Document.prototype._trysend = function(){
	if(this.sock && !this._lock){
		var self = this;

		this._lock = true;
		setTimeout(function(){ // Compose operations and send them once done executing
			if(!self.local.length > 0){
				self._lock = false;
				return;
			}

			self._acked = false;
			self._pending = self.local.length;

			var data = {ops: self.local, v: self.v};
			self.sock.emit('update', data);

		});

	}
}

// Client side message processing
Document.prototype._process = function(){
	if(!this._acked){ // Have data pending for which an ack wasn't received, after some time try resending it and either receiving an ordinary ack or a notice that it was already sent


		return;
	}

	while(this.packets[this.v]){
		var p = this.packets[this.v];

		if(p == 'local'){
			this.commit(this._pending);
			this._pending = 0;
			this._lock = false;
		}
		else{
			this.apply(p, this.v);
			this.commit(p.length);
		}

		delete this.packets[this.v];
	}

	if(this.v < this.latest){ // We seen to be missing stuff

	}
	else{
		this._trysend();
	}

}

/* Upgrade the history of the document using a certain number of local changes (omit to use them all) */
Document.prototype.commit = function(n){
	var bound = this.local.length;
	if(!n || n > bound){
		n = bound;
	}

	for(var i = 0; i < n; i++){
		this.history.push(this.local.shift());
	}

	this.v += n;
}
